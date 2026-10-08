import { MemoryKVStore } from '@/storage/kv';
import { makeRepositories } from '@/storage/repositories';
import type { UserProfile, ErrorDnaEntry } from '@/domain/types';

function profile(userId: string, name: string): UserProfile {
  return {
    userId, name, goal: '대학교 전공', interests: ['공업수학'], isDemo: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function dna(userId: string, errorType: string, score: number): ErrorDnaEntry {
  return {
    userId, subject: 's', topic: 't', errorType, errorDescription: '', evidence: [],
    occurrenceCount: 1, recentOccurrence: '2026-01-01T00:00:00.000Z', severity: 3,
    confidence: 0.7, score, improvementScore: 0, lastUpdated: '2026-01-01T00:00:00.000Z',
  };
}

describe('storage repositories', () => {
  it('round-trips a profile and sets the active user', async () => {
    const repos = makeRepositories(new MemoryKVStore());
    await repos.profile.save(profile('u1', '민준'));
    expect(await repos.profile.getActiveUserId()).toBe('u1');
    const active = await repos.profile.getActive();
    expect(active?.name).toBe('민준');
  });

  it('keeps per-user DNA separate (no cross-account mixing)', async () => {
    const kv = new MemoryKVStore();
    const repos = makeRepositories(kv);
    await repos.dna.save('u1', [dna('u1', 'sign_error', 50)]);
    await repos.dna.save('u2', [dna('u2', 'unit_error', 90)]);
    const u1 = await repos.dna.get('u1');
    const u2 = await repos.dna.get('u2');
    expect(u1).toHaveLength(1);
    expect(u1[0]!.errorType).toBe('sign_error');
    expect(u2[0]!.errorType).toBe('unit_error');
  });

  it('persists mistakes and traps across reads (simulated restart)', async () => {
    const kv = new MemoryKVStore();
    let repos = makeRepositories(kv);
    await repos.mistakes.add('u1', {
      id: 'm1', userId: 'u1', problemId: 'p', subject: 's', topic: 't', isCorrect: false,
      errorType: 'sign_error',
      analysis: {
        isCorrect: false, errorType: 'sign_error', reason: 'r', evidence: [],
        correctionStrategy: 'c', severity: 3, confidence: 0.7, relatedConcepts: [], recurrenceRisk: 50,
      },
      attempt: { id: 'a', userId: 'u1', problemId: 'p', userAnswer: 'x', confidence: 'low', createdAt: 'now' },
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    // simulate app restart: new repositories over the SAME kv
    repos = makeRepositories(kv);
    const mistakes = await repos.mistakes.get('u1');
    expect(mistakes).toHaveLength(1);
  });

  it('returns defaults for unknown users without throwing', async () => {
    const repos = makeRepositories(new MemoryKVStore());
    expect(await repos.dna.get('ghost')).toEqual([]);
    expect(await repos.profile.get('ghost')).toBe(null);
  });
});
