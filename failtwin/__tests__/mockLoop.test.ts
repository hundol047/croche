import { TRAP_TEMPLATES } from '@/services/ai/trapTemplates';
import { checkAnswer } from '@/domain/trapEval';
import { MockCrocheAIService } from '@/services/ai/MockCrocheAIService';
import { MemoryKVStore } from '@/storage/kv';
import { makeRepositories } from '@/storage/repositories';
import { ToolRunner } from '@/services/ai/tools';
import { applyMistake, applyCorrection, upsertEntry, findEntry, strongestErrorType } from '@/domain/errorDnaEngine';
import { buildMemoryContext } from '@/domain/memorySelect';
import { problemById } from '@/content/problems';
import type { Attempt, ErrorType } from '@/domain/types';

const AT = '2026-01-10T00:00:00.000Z';
const ai = new MockCrocheAIService({ latencyMs: 0, seed: 1 });

function attempt(problemId: string, answer: string, confidence: Attempt['confidence']): Attempt {
  return { id: 'a', userId: 'u', problemId, userAnswer: answer, confidence, createdAt: AT };
}

describe('end-to-end Mock loop', () => {
  it('every shipped trap accepts its complete correct answer and rejects its targeted misconception answers', () => {
    for (const templates of Object.values(TRAP_TEMPLATES)) {
      for (const trap of templates) {
        expect(checkAnswer(trap, trap.correctAnswer)).toBe(true);
        for (const wrong of trap.targetedWrongAnswers ?? []) expect(checkAnswer(trap, wrong)).toBe(false);
      }
    }
    const slice = TRAP_TEMPLATES.edge_case_omission!.find((t) => t.topic === '슬라이스 경계')!;
    expect(slice.correctAnswer).toBe('FAILTWIN'.slice(2, 7));
  });
  it('rotates new trap content for the same weakness and subject independently of practice generation', async () => {
    const svc = new MockCrocheAIService({ latencyMs: 0 });
    const input = { targetErrorType: 'condition_omission', subject: '공업수학' as const, recentTopics: [], relevantMemories: [] };
    const first = await svc.generateTrapProblem(input);
    await svc.generateProblem({ subject: '일반물리' });
    const second = await svc.generateTrapProblem(input);
    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(first.value.correctAnswer).toBe('(2,5)');
      expect(second.value.correctAnswer).toBe('[-3,3]');
      expect(second.value.question).not.toBe(first.value.question);
    }
  });
  it('analyzes a wrong answer into a structured MistakeAnalysis', async () => {
    const problem = problemById('eng-math-1')!;
    const r = await ai.analyzeMistake({
      problem,
      attempt: attempt(problem.id, '(-1,1)', 'high'), // omits endpoint → wrong
      relevantMemories: [],
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.isCorrect).toBe(false);
      expect(r.value.errorType).toBe('edge_case_omission');
      expect(r.value.severity).toBeGreaterThanOrEqual(1);
      expect(r.value.correctionStrategy.length).toBeGreaterThan(0);
    }
  });

  it('recognizes a correct answer', async () => {
    const problem = problemById('phys-1')!;
    const r = await ai.analyzeMistake({
      problem, attempt: attempt(problem.id, '25', 'medium'), relevantMemories: [],
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.isCorrect).toBe(true);
  });

  it('runs the full loop: mistake → DNA update → prediction → trap → result → report', async () => {
    const kv = new MemoryKVStore();
    const repos = makeRepositories(kv);
    const userId = 'learner-1';

    // 1) Solve a problem WRONG
    const problem = problemById('eng-math-1')!;
    const analysisRes = await ai.analyzeMistake({
      problem, attempt: attempt(problem.id, '(-1,1)', 'high'), relevantMemories: [],
    });
    expect(analysisRes.ok).toBe(true);
    const analysis = analysisRes.ok ? analysisRes.value : null;
    expect(analysis && !analysis.isCorrect).toBe(true);

    // 2) Deterministic DNA update
    let entries = await repos.dna.get(userId);
    const errorType = analysis!.errorType as ErrorType;
    const existing = findEntry(entries, errorType);
    const updated = applyMistake(existing, {
      userId, subject: problem.subject, topic: problem.topic,
      errorType, severity: analysis!.severity, at: AT,
    });
    entries = upsertEntry(entries, updated);
    await repos.dna.save(userId, entries);
    expect((await repos.dna.get(userId))[0]!.score).toBeGreaterThan(0);

    // 3) Prediction reflects the DNA
    const memories = buildMemoryContext(entries, { subject: problem.subject, topic: problem.topic });
    const predRes = await ai.predictNextMistake({
      subject: problem.subject, topic: problem.topic, relevantMemories: memories,
    });
    expect(predRes.ok).toBe(true);
    if (predRes.ok) expect(predRes.value.predictedErrorType).toBe('edge_case_omission');

    // 4) Trap generation targets the strongest error type
    const strongest = strongestErrorType(entries)!;
    const trapRes = await ai.generateTrapProblem({
      targetErrorType: strongest.errorType, subject: '공업수학',
      recentTopics: [problem.topic], relevantMemories: memories,
    });
    expect(trapRes.ok).toBe(true);
    const trap = trapRes.ok ? trapRes.value : null;
    expect(trap!.targetErrorType).toBe(strongest.errorType);
    // trap is NEW content, not the same problem
    expect(trap!.question).not.toContain(problem.prompt);

    // 5) User now SOLVES the trap correctly → correction + result
    const corrected = applyCorrection(updated, { confidence: 'medium', at: AT });
    expect(corrected.score).toBeLessThan(updated.score);
    await repos.dna.save(userId, upsertEntry(entries, corrected));

    const runner = new ToolRunner(repos, ai);
    const saveRes = await runner.runTool('saveTrapResult', {
      userId, trapProblemId: 'trap-1', targetErrorType: strongest.errorType,
      actualErrorType: undefined, predictionHit: false, solvedCorrectly: true,
    });
    expect(saveRes.ok).toBe(true);

    // 6) Report reflects the activity
    const progressRes = await runner.runTool('getLearningProgress', { userId });
    expect(progressRes.ok).toBe(true);
  });

  it('repeated trap taps produce DIFFERENT problems (not just new numbers)', async () => {
    const svc = new MockCrocheAIService({ latencyMs: 0, seed: 1 });
    const r1 = await svc.generateTrapProblem({
      targetErrorType: 'edge_case_omission', subject: 'Python 프로그래밍', recentTopics: [], relevantMemories: [],
    });
    const r2 = await svc.generateTrapProblem({
      targetErrorType: 'edge_case_omission', subject: '공업수학', recentTopics: ['a'], relevantMemories: [],
    });
    expect(r1.ok && r2.ok).toBe(true);
    if (r1.ok && r2.ok) {
      expect(r1.value.question).not.toBe(r2.value.question);
    }
  });

  it('tool input validation rejects malformed input (AI cannot write junk)', async () => {
    const repos = makeRepositories(new MemoryKVStore());
    const runner = new ToolRunner(repos, ai);
    const bad = await runner.runTool('updateErrorDNA', {
      userId: 'u', subject: 's', topic: 't', errorType: 'bad type!!', severity: 99, outcome: 'mistake',
    });
    expect(bad.ok).toBe(false);
  });

  it('updateErrorDNA tool updates score deterministically', async () => {
    const repos = makeRepositories(new MemoryKVStore());
    const runner = new ToolRunner(repos, ai);
    const r1 = await runner.runTool('updateErrorDNA', {
      userId: 'u', subject: 's', topic: 't', errorType: 'sign_error', severity: 3, outcome: 'mistake', confidence: 'medium',
    });
    expect(r1.ok).toBe(true);
    const entries = await repos.dna.get('u');
    expect(entries[0]!.errorType).toBe('sign_error');
    expect(entries[0]!.score).toBeGreaterThan(0);
  });
});
