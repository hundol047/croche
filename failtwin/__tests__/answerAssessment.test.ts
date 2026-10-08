import { assessAnswer, UngradableAnswerError } from '@/domain/answerAssessment';
import { MockCrocheAIService } from '@/services/ai/MockCrocheAIService';
import { recordPractice, recordTrap } from '@/domain/learningEvents';
import { makeRepositories } from '@/storage/repositories';
import { MemoryKVStore } from '@/storage/kv';
import { problemById } from '@/content/problems';
import type { Attempt, MistakeAnalysis } from '@/domain/types';

const ode = problemById('eng-math-2')!;
const ai = new MockCrocheAIService({ latencyMs: 0 });
const attempt: Attempt = { id: 'a', userId: 'u', problemId: ode.id, userAnswer: '3e^(-2x)', confidence: 'medium', createdAt: '2026-10-08T00:00:00Z' };
const bogus: MistakeAnalysis = { isCorrect: false, errorType: 'sign_error', reason: 'wrong', evidence: [], correctionStrategy: 'check', severity: 3, confidence: 0.8, relatedConcepts: [], recurrenceRisk: 60 };

describe('safe answer assessment', () => {
  it('accepts the reproduced exponential notation variants', () => {
    for (const answer of ['3e^(-2x)', '3e^{-2x}', '3 * e^{ -2 * x }', '3exp(-2*x)', '3e^(−2x)']) {
      expect(assessAnswer(ode, answer).verdict).toBe('correct');
    }
  });
  it('distinguishes genuinely different signs, coefficients and exponents', () => {
    for (const answer of ['3e^(2x)', '-3e^(-2x)', '2e^(-2x)', '3e^(-3x)', '3.01e^(-2x)']) {
      expect(assessAnswer(ode, answer).verdict).toBe('incorrect');
    }
  });
  it('rejects unsupported, ambiguous, malicious and oversized expressions without executing them', () => {
    for (const answer of ['3e^-2x', '3e^(-2x)+0', '3 0e^(-2x)', '*e^(-2x)', '3e^{(-2x)}', '3e^(-2x);globalThis.attack=true', 'Function("return 3")()', '3'.repeat(300)]) {
      expect(assessAnswer(ode, answer).verdict).toBe('ungradable');
    }
    expect((globalThis as unknown as { attack?: boolean }).attack).toBe(undefined);
    expect(assessAnswer({ ...ode, correctAnswer: '30e^{-20x}' }, '3 0e^{-2 0x}').verdict).toBe('ungradable');
  });
  it('keeps interval endpoints and numeric tokens meaningful', () => {
    const q = { answerType: 'text' as const, correctAnswer: '[-1,1)' };
    expect(assessAnswer(q, ' [-1.0, 1) ').verdict).toBe('correct');
    for (const a of ['(-1,1)', '[-1,1]', '[-2,1)']) expect(assessAnswer(q, a).verdict).toBe('incorrect');
    for (const a of ['[-1,1', '[-1 0,1)', 'x<1']) expect(assessAnswer(q, a).verdict).toBe('ungradable');
    expect(assessAnswer({ ...q, correctAnswer: '[-10,10]' }, '[-1 0,1 0]').verdict).toBe('ungradable');
    const n = { answerType: 'numeric' as const, correctAnswer: '20' };
    expect(assessAnswer(n, '2e1').verdict).toBe('correct');
    for (const a of ['20+1', '20m', '2 0', 'Infinity', 'NaN', '9007199254740993']) expect(assessAnswer(n, a).verdict).toBe('ungradable');
  });
  it('accepts valid multi-select order and case while refusing unknown options', () => {
    const q = problemById('py-2')!;
    expect(assessAnswer(q, 'STR, TUPLE').verdict).toBe('correct');
    expect(assessAnswer(q, 'tuple').verdict).toBe('incorrect');
    expect(assessAnswer(q, 'invented').verdict).toBe('ungradable');
  });
  it('never stores an unsupported answer or lets a conflicting analysis change DNA', async () => {
    const repos = makeRepositories(new MemoryKVStore());
    for (const answer of ['3e^(-2x)+0', '3e^(-2x)']) {
      let rejected = false;
      try { await recordPractice(repos, ode, { ...attempt, userAnswer: answer }, bogus); } catch { rejected = true; }
      expect(rejected).toBe(true);
    }
    expect(await repos.mistakes.get('u')).toHaveLength(0);
    expect(await repos.dna.get('u')).toHaveLength(0);
  });
  it('records one correction for an equivalent answer across concurrent retries and reload', async () => {
    const kv = new MemoryKVStore(); let repos = makeRepositories(kv);
    const wrongAttempt = { ...attempt, id: 'wrong', userAnswer: '3e^(2x)' };
    const wrong = await ai.analyzeMistake({ problem: ode, attempt: wrongAttempt, relevantMemories: [] });
    if (!wrong.ok) throw new Error(wrong.error);
    await recordPractice(repos, ode, wrongAttempt, wrong.value);
    const before = (await repos.dna.get('u'))[0]!.score;
    const correct = await ai.analyzeMistake({ problem: ode, attempt, relevantMemories: [] });
    if (!correct.ok) throw new Error(correct.error);
    await Promise.all([recordPractice(repos, ode, attempt, correct.value), recordPractice(repos, ode, attempt, correct.value)]);
    repos = makeRepositories(kv);
    await recordPractice(repos, ode, attempt, correct.value);
    expect(await repos.mistakes.get('u')).toHaveLength(2);
    expect((await repos.dna.get('u'))[0]!.score).toBeLessThan(before);
  });
  it('does not store an ungradable Trap or infer a HIT from its reasoning', async () => {
    const repos = makeRepositories(new MemoryKVStore());
    const result = await ai.generateTrapProblem({ targetErrorType: 'condition_omission', subject: '공업수학', recentTopics: [], relevantMemories: [] });
    if (!result.ok) throw new Error(result.error);
    let rejected = false;
    try { await recordTrap(repos, result.value, { ...attempt, userAnswer: '(2,5);invalid', userReasoning: '급하게 풀었어요' }); }
    catch (e) { rejected = e instanceof UngradableAnswerError; }
    expect(rejected).toBe(true);
    expect(await repos.traps.get('u')).toHaveLength(0);
    expect(await repos.dna.get('u')).toHaveLength(0);
  });
});
