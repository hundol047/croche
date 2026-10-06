import { RealCrocheAIService } from '@/services/ai/RealCrocheAIService';
import type { CrocheClient } from '@/services/croche/client';
import { problemById } from '@/content/problems';
import type { Attempt } from '@/domain/types';

const AT = '2026-01-10T00:00:00.000Z';

function attempt(problemId: string, answer: string): Attempt {
  return { id: 'a', userId: 'u', problemId, userAnswer: answer, confidence: 'high', createdAt: AT };
}

/** A programmable fake Croche client: returns queued responses in order. */
class FakeClient implements CrocheClient {
  calls: { model: string; system: string; user: string; context: string[] }[] = [];
  constructor(private responses: unknown[]) {}
  async completeJson(args: { model: string; system: string; user: string; context: string[] }) {
    this.calls.push(args);
    if (this.responses.length === 0) throw new Error('no more responses');
    return this.responses.shift();
  }
}

const validAnalysis = {
  isCorrect: false,
  errorType: 'edge_case_omission',
  errorTitle: '경계조건 누락',
  reason: '끝점 검사를 생략했습니다.',
  evidence: ['제출 답이 정답과 다릅니다.'],
  correctionStrategy: '끝점을 대입해 검증하세요.',
  severity: 3,
  confidence: 0.7,
  relatedConcepts: ['수렴구간'],
  recurrenceRisk: 72,
};

describe('RealCrocheAIService (fake client)', () => {
  const problem = problemById('eng-math-1')!;

  it('parses and returns a valid MistakeAnalysis from the client', async () => {
    const client = new FakeClient([validAnalysis]);
    const svc = new RealCrocheAIService(client);
    const r = await svc.analyzeMistake({ problem, attempt: attempt(problem.id, '(-1,1)'), relevantMemories: [] });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.errorType).toBe('edge_case_omission');
    // only the relevant memories (none here) are passed as context
    expect(client.calls[0]!.context).toEqual([]);
  });

  it('selects the quality model tier for deep analysis', async () => {
    const client = new FakeClient([validAnalysis]);
    const svc = new RealCrocheAIService(client);
    await svc.analyzeMistake({ problem, attempt: attempt(problem.id, 'x'), relevantMemories: [] });
    // analyze_mistake -> quality tier; default id contains "quality"
    expect(client.calls[0]!.model).toContain('quality');
  });

  it('retries once when the first response fails schema validation, then succeeds', async () => {
    const client = new FakeClient([{ garbage: true }, validAnalysis]);
    const svc = new RealCrocheAIService(client, { maxValidationRetries: 1 });
    const r = await svc.analyzeMistake({ problem, attempt: attempt(problem.id, 'x'), relevantMemories: [] });
    expect(r.ok).toBe(true);
    expect(client.calls.length).toBe(2);
    // the retry carries a repair hint
    expect(client.calls[1]!.user).toContain('재요청');
  });

  it('returns an error (fallback) when retries are exhausted — never crashes', async () => {
    const client = new FakeClient([{ bad: 1 }, { bad: 2 }]);
    const svc = new RealCrocheAIService(client, { maxValidationRetries: 1 });
    const r = await svc.analyzeMistake({ problem, attempt: attempt(problem.id, 'x'), relevantMemories: [] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('invalid AI response');
  });

  it('returns an error on transport failure without retrying blindly', async () => {
    const client = new FakeClient([]); // throws on first call
    const svc = new RealCrocheAIService(client, { maxValidationRetries: 2 });
    const r = await svc.predictNextMistake({ relevantMemories: [] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('AI 호출에 실패');
    expect(client.calls.length).toBe(1);
  });

  it('applies the tone guard to AI natural-language fields', async () => {
    const client = new FakeClient([
      { ...validAnalysis, reason: '당신은 소질이 없습니다. 끝점 검사를 생략했습니다.' },
    ]);
    const svc = new RealCrocheAIService(client);
    const r = await svc.analyzeMistake({ problem, attempt: attempt(problem.id, 'x'), relevantMemories: [] });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.reason).not.toContain('소질이 없');
    }
  });
});
