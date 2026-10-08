import { practiceVariants } from '@/content/practiceVariants';
import { issuePractice, issueTrap } from '@/domain/questionIssuance';
import { makeRepositories } from '@/storage/repositories';
import { MemoryKVStore } from '@/storage/kv';
import { MockCrocheAIService } from '@/services/ai/MockCrocheAIService';
import { assessAnswer } from '@/domain/answerAssessment';
import { resetDemo } from '@/state/onboarding';
import type { Subject } from '@/domain/types';

const subjects: Subject[] = ['공업수학', '일반물리', 'Python 프로그래밍'];
const service = () => new MockCrocheAIService({ latencyMs: 0 });

describe('durable, varied question issuance', () => {
  it('ships 54 distinct prompts and accepts all their derived answers', () => {
    for (const subject of subjects) {
      const pool = practiceVariants(subject);
      expect(pool).toHaveLength(18);
      expect(new Set(pool.map((p) => p.prompt)).size).toBe(18);
      expect(new Set(pool.map((p) => p.topic)).size).toBe(3);
      for (const p of pool) expect(assessAnswer(p, p.correctAnswer).verdict).toBe('correct');
    }
  });
  it('verifies generated physics answers from the numbers actually shown', () => {
    for (const p of practiceVariants('일반물리')) {
      const numbers = [...p.prompt.matchAll(/\d+/g)].map((m) => Number(m[0]));
      const expected = p.id.includes(':motion:') ? numbers[0]! * numbers[1]! ** 2 / 2
        : p.id.includes(':energy:') ? numbers[0]! * numbers[1]! ** 2 / 2 : numbers[0]! / 3.6;
      expect(Number(p.correctAnswer)).toBeCloseTo(expected);
    }
  });
  it('checks the math answers against each displayed condition, including wrong signs and removed domain points', () => {
    for (const p of practiceVariants('공업수학')) {
      if (p.id.includes(':series:')) {
        const radius = Number(p.prompt.match(/x\/(\d+)/)![1]);
        expect(assessAnswer(p, `[-${radius},${radius}]`).verdict).toBe('correct');
        expect(assessAnswer(p, `(-${radius},${radius})`).verdict).toBe('incorrect');
      } else if (p.id.includes(':ode:')) {
        const k = Number(p.prompt.match(/y' \+ (\d+)y/)![1]);
        const c = Number(p.prompt.match(/y\(0\)=(\d+)/)![1]);
        expect(assessAnswer(p, `${c}*exp(-${k}*x)`).verdict).toBe('correct');
        expect(assessAnswer(p, `${c}*exp(${k}*x)`).verdict).toBe('incorrect');
      } else {
        const x = Number(p.prompt.match(/g\((\d+)\)/)![1]);
        expect(assessAnswer(p, 'undefined').verdict).toBe('correct');
        expect(assessAnswer(p, String(2 * x)).verdict).toBe('incorrect');
      }
    }
  });
  it('verifies Python iteration results independently from displayed bounds', () => {
    for (const p of practiceVariants('Python 프로그래밍')) {
      let expected = 0;
      if (p.id.includes(':range:')) {
        const m = p.prompt.match(/range\(0, (\d+), (\d+)\)/)!;
        for (let x = 0; x < Number(m[1]); x += Number(m[2])) expected += x;
      } else if (p.id.includes(':squares:')) {
        const m = p.prompt.match(/range\(1, (\d+)\)/)!;
        for (let x = 1; x < Number(m[1]); x += 1) expected += x * x;
      } else {
        const m = p.prompt.match(/range\((\d+)\)/)!;
        for (let x = 0; x < Number(m[1]); x += 1) if (x % 2 === 0) expected += 1;
      }
      expect(Number(p.correctAnswer)).toBe(expected);
    }
  });
  it('does not repeat abandoned practice questions after service/repository reload', async () => {
    const kv = new MemoryKVStore(); const texts: string[] = [];
    for (let i = 0; i < 18; i += 1) {
      const p = await issuePractice(makeRepositories(kv), service(), 'u', '공업수학');
      expect(texts.includes(p.prompt)).toBe(false); texts.push(p.prompt);
    }
    let exhausted = false;
    try { await issuePractice(makeRepositories(kv), service(), 'u', '공업수학'); } catch (e) { exhausted = (e as Error).message.startsWith('EXHAUSTED:'); }
    expect(exhausted).toBe(true);
    expect(await makeRepositories(kv).mistakes.get('u')).toHaveLength(0);
  });
  it('keeps subject/user histories independent and handles concurrent duplicate reservations', async () => {
    const repos = makeRepositories(new MemoryKVStore());
    const results = await Promise.allSettled([issuePractice(repos, service(), 'u', '일반물리'), issuePractice(repos, service(), 'u', '일반물리')]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const second = await issuePractice(repos, service(), 'u', '일반물리');
    const firstForOtherUser = await issuePractice(repos, service(), 'other', '일반물리');
    expect(second.prompt).not.toBe(firstForOtherUser.prompt);
    const firstMath = await issuePractice(repos, service(), 'u', '공업수학');
    expect(firstMath.correctAnswer).toBe('[-1,1]');
  });
  it('a failed issuance save leaves no history and retry can issue the same first question', async () => {
    class FailingKV extends MemoryKVStore {
      failing = true;
      override async setItem(key: string, value: string): Promise<void> {
        if (this.failing) throw new Error('Storage full');
        return super.setItem(key, value);
      }
    }
    const kv = new FailingKV(); const repos = makeRepositories(kv);
    let failed = false;
    try { await issuePractice(repos, service(), 'u', '일반물리'); } catch { failed = true; }
    expect(failed).toBe(true); expect((await repos.learning.get('u')).issued).toBe(undefined);
    kv.failing = false;
    expect((await issuePractice(repos, service(), 'u', '일반물리')).correctAnswer).toBe('24');
  });
  it('persists abandoned Trap issuance and reports finite pool exhaustion', async () => {
    const kv = new MemoryKVStore();
    const input = { subject: '공업수학' as const, targetErrorType: 'condition_omission', recentTopics: [], relevantMemories: [] };
    const first = await issueTrap(makeRepositories(kv), service(), 'u', input);
    const second = await issueTrap(makeRepositories(kv), service(), 'u', input);
    expect(first.question).not.toBe(second.question);
    expect(first.correctAnswer).toBe('(2,5)'); expect(second.correctAnswer).toBe('[-3,3]');
    let exhausted = false;
    try { await issueTrap(makeRepositories(kv), service(), 'u', input); } catch (e) { exhausted = (e as Error).message.startsWith('EXHAUSTED:'); }
    expect(exhausted).toBe(true);
  });
  it('demo reset clears only demo issuance and preserves real-user question history', async () => {
    const repos = makeRepositories(new MemoryKVStore());
    await issuePractice(repos, service(), 'demo-user', '일반물리');
    await issuePractice(repos, service(), 'real-user', '일반물리');
    await resetDemo(repos);
    expect((await repos.learning.get('demo-user')).issued).toBe(undefined);
    expect((await repos.learning.get('real-user')).issued).toHaveLength(1);
  });
});
