import { MemoryKVStore } from '@/storage/kv';
import { makeRepositories } from '@/storage/repositories';
import { recordPractice, recordTrap } from '@/domain/learningEvents';
import { MockCrocheAIService } from '@/services/ai/MockCrocheAIService';
import { problemById } from '@/content/problems';
import { SessionStore } from '@/state/sessionStore';
import { resetDemo, seedDemo, createRealProfile } from '@/state/onboarding';
import type { Attempt } from '@/domain/types';

const ai = new MockCrocheAIService({ latencyMs: 0 });
const problem = problemById('eng-math-3')!;
const attempt: Attempt = { id: 'attempt-1', userId: 'u1', problemId: problem.id,
  userAnswer: '2', confidence: 'medium', createdAt: '2026-10-07T00:00:00.000Z' };
async function analysis() {
  const r = await ai.analyzeMistake({ problem, attempt, relevantMemories: [] });
  if (!r.ok) throw new Error(r.error);
  return r.value;
}

describe('durable learning events', () => {
  it('retries session hydration after a transient storage read failure', async () => {
    class FailingRead extends MemoryKVStore {
      fail = false;
      override async getItem(key: string): Promise<string | null> {
        if (this.fail) throw new Error('Temporarily unavailable');
        return super.getItem(key);
      }
    }
    const kv = new FailingRead();
    const first = new SessionStore(() => kv);
    await first.bind('u1');
    await first.startPractice(problem);
    const restored = new SessionStore(() => kv);
    kv.fail = true;
    try { await restored.bind('u1'); } catch { /* retry below */ }
    kv.fail = false;
    await restored.bind('u1');
    expect(restored.get('currentProblem')?.id).toBe(problem.id);
  });
  it('migrates legacy per-user DNA and history when committing an event', async () => {
    const kv = new MemoryKVStore();
    const repos = makeRepositories(kv);
    await kv.setItem('ft:u1:mistakes', '[]');
    await kv.setItem('ft:u1:traps', '[]');
    await kv.setItem('ft:u1:dna', JSON.stringify([{ userId: 'u1', subject: '공업수학', topic: '급수', errorType: 'condition_omission',
      errorDescription: '', evidence: [], score: 40, occurrenceCount: 2, severity: 2, confidence: 0.7,
      improvementScore: 0, recentOccurrence: attempt.createdAt, lastUpdated: attempt.createdAt }]));
    const record = await recordPractice(repos, problem, attempt, await analysis());
    expect(record.beforeScore).toBe(0);
    expect(record.afterScore).toBe(17);
    const reloaded = makeRepositories(kv);
    const entries = await reloaded.dna.get('u1');expect(entries[0]!.score).toBe(40);expect(entries[0]!.legacyAggregate).toBe(true);expect(entries[1]!.score).toBe(17);
    expect(await reloaded.mistakes.get('u1')).toHaveLength(1);
  });
  it('concurrent rerenders and reloads apply one mistake and one score delta', async () => {
    const kv = new MemoryKVStore();
    let repos = makeRepositories(kv);
    const a = await analysis();
    await Promise.all([recordPractice(repos, problem, attempt, a), recordPractice(repos, problem, attempt, a)]);
    repos = makeRepositories(kv);
    const replay = await recordPractice(repos, problem, attempt, a);
    expect(await repos.mistakes.get('u1')).toHaveLength(1);
    expect((await repos.dna.get('u1'))[0]!.score).toBe(17);
    expect(replay.beforeScore).toBe(0);
    expect(replay.afterScore).toBe(17);
    expect(await repos.dna.get('u2')).toEqual([]);
  });

  it('a failed atomic save leaves no score or event, then retry succeeds once', async () => {
    class FailingKV extends MemoryKVStore {
      failing = true;
      override async setItem(key: string, value: string): Promise<void> {
        if (this.failing && key.endsWith(':learning')) throw new Error('Storage full');
        return super.setItem(key, value);
      }
    }
    const kv = new FailingKV();
    const repos = makeRepositories(kv);
    let failed = false;
    try { await recordPractice(repos, problem, attempt, await analysis()); } catch { failed = true; }
    expect(failed).toBe(true);
    expect(await repos.mistakes.get('u1')).toEqual([]);
    expect(await repos.dna.get('u1')).toEqual([]);
    kv.failing = false;
    await recordPractice(repos, problem, attempt, await analysis());
    expect(await repos.mistakes.get('u1')).toHaveLength(1);
  });

  it('unknown wrong trap answers stay neutral; known HIT and correction are idempotent', async () => {
    const repos = makeRepositories(new MemoryKVStore());
    await recordPractice(repos, problem, attempt, await analysis());
    const generated = await ai.generateTrapProblem({ targetErrorType: 'condition_omission', subject: '공업수학', recentTopics: [], relevantMemories: [] });
    if (!generated.ok) throw new Error(generated.error);
    const trap = generated.value;
    const neutral = await recordTrap(repos, trap, { ...attempt, id: 'neutral', userAnswer: '999' });
    expect(neutral.predictionHit).toBe(false);
    expect(neutral.actualErrorType).toBe(undefined);
    expect((await repos.dna.get('u1'))[0]!.score).toBe(17);
    const hit = await recordTrap(repos, trap, { ...attempt, id: 'hit', userAnswer: '[2,5]' });
    expect(hit.predictionHit).toBe(true);
    const correction = { ...attempt, id: 'correct', userAnswer: '(2,5)' };
    const result = await recordTrap(repos, trap, correction);
    await recordTrap(repos, trap, correction);
    expect(result.solvedCorrectly).toBe(true);
    expect(result.afterScore!).toBeLessThan(result.beforeScore!);
    expect(await repos.traps.get('u1')).toHaveLength(3);
  });

  it('restores a flow by user and never leaks it to a different profile', async () => {
    const kv = new MemoryKVStore();
    let session = new SessionStore(() => kv);
    await session.bind('u1');
    await session.startPractice(problem);
    await session.set('currentAttempt', attempt);
    session = new SessionStore(() => kv);
    await session.bind('u1');
    expect(session.get('currentAttempt')?.id).toBe(attempt.id);
    await session.bind('u2');
    expect(session.get('currentProblem')).toBe(undefined);
    await session.bind('u1');
    expect(session.get('currentProblem')?.id).toBe(problem.id);
    await session.startPractice(problem);
    expect(session.get('currentAttempt')).toBe(undefined);
  });

  it('demo reset preserves real-user records and restores only demo seed scores', async () => {
    const repos = makeRepositories(new MemoryKVStore());
    const real = await createRealProfile(repos, { name: '수진', goal: '코딩', interests: ['Python 프로그래밍'] });
    await recordPractice(repos, problem, { ...attempt, userId: real.userId }, await analysis());
    await seedDemo(repos);
    await recordPractice(repos, problem, { ...attempt, userId: 'demo-user' }, await analysis());
    await resetDemo(repos);
    expect(await repos.mistakes.get('demo-user')).toEqual([]);
    expect((await repos.dna.get('demo-user'))[0]!.score).toBe(83);
    expect(await repos.mistakes.get(real.userId)).toHaveLength(1);
    expect((await repos.dna.get(real.userId))[0]!.score).toBe(17);
  });
});
