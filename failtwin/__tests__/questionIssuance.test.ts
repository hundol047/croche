import { DIFFICULTIES, practiceCatalog, VARIANTS_PER_FAMILY } from '@/content/practiceVariants';
import { issuePractice, issueTrap, practiceAvailability, practiceProgressKey } from '@/domain/questionIssuance';
import { makeRepositories } from '@/storage/repositories';
import { MemoryKVStore } from '@/storage/kv';
import { MockCrocheAIService } from '@/services/ai/MockCrocheAIService';
import { resetDemo } from '@/state/onboarding';
import type { Subject } from '@/domain/types';

const subjects: Subject[] = ['공업수학', '일반물리', 'Python 프로그래밍'];
const service = () => new MockCrocheAIService({ latencyMs: 0 });

describe('durable, varied question issuance', () => {
  it('does not repeat abandoned practice questions after service/repository reload', async () => {
    const kv = new MemoryKVStore(); const texts: string[] = [];
    for (let i = 0; i < 30; i += 1) {
      const p = await issuePractice(makeRepositories(kv), service(), 'u', '공업수학');
      expect(texts.includes(p.prompt)).toBe(false); texts.push(p.prompt);
    }
    expect(Object.values((await makeRepositories(kv).learning.get('u')).practiceProgress!).reduce((s,v)=>s+v,0)).toBe(30);
    expect(await makeRepositories(kv).mistakes.get('u')).toHaveLength(0);
  });
  it('keeps subject/user histories independent and reserves distinct concurrent questions', async () => {
    const repos = makeRepositories(new MemoryKVStore());
    const results = await Promise.allSettled([issuePractice(repos, service(), 'u', '일반물리'), issuePractice(repos, service(), 'u', '일반물리')]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(2);
    expect(new Set(results.map(r => r.status === 'fulfilled' ? r.value.id : 'failed')).size).toBe(2);
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
    expect(failed).toBe(true); expect((await repos.learning.get('u')).practiceProgress).toBe(undefined);
    kv.failing = false;
    expect((await issuePractice(repos, service(), 'u', '일반물리')).correctAnswer).toBe('24');
  });

  it('keeps difficulty/type counters separate and preserves legacy learning history', async () => {
    const repos = makeRepositories(new MemoryKVStore());
    const legacy = { kind: 'practice' as const, subject: '공업수학' as const, text: 'legacy exercise' };
    await repos.learning.update('u', s=>({...s, issued:[legacy]}));
    const first = await issuePractice(repos, service(), 'u', '공업수학', 'easy', '등차수열의 합');
    expect(first.topic).toBe('등차수열의 합'); expect(first.difficulty).toBe('easy');
    expect((await issuePractice(repos, service(), 'u', '공업수학', 'hard')).difficulty).toBe('hard');
    const state=await repos.learning.get('u');
    expect(state.issued).toEqual([legacy]); expect(state.dna).toEqual([]); expect(state.mistakes).toEqual([]);
    expect(practiceAvailability(state,'공업수학','easy').reduce((n,f)=>n+f.remaining,0)).toBe(9999);
    expect(practiceAvailability(state,'공업수학','medium').reduce((n,f)=>n+f.remaining,0)).toBe(10000);
  });
  it('issues the last variant then honestly reports exhaustion without wrapping; other types remain available', async () => {
    const repos=makeRepositories(new MemoryKVStore());
    const catalog=practiceCatalog('일반물리','hard');
    const key=practiceProgressKey('일반물리','hard',catalog[0]!.id);
    await repos.learning.update('u', s=>({...s,practiceProgress:{[key]:1999}}));
    const last=await issuePractice(repos,service(),'u','일반물리','hard',catalog[0]!.topic);
    expect(last.id.endsWith(':1999')).toBe(true);
    let failed=false; try { await issuePractice(repos,service(),'u','일반물리','hard',catalog[0]!.topic); } catch(e) { failed=(e as Error).message.startsWith('EXHAUSTED:'); }
    expect(failed).toBe(true); expect((await repos.learning.get('u')).practiceProgress![key]).toBe(2000);
    expect((await issuePractice(repos,service(),'u','일반물리','hard')).topic).toBe(catalog[1]!.topic);
    await repos.learning.update('u', s=>({...s,practiceProgress:Object.fromEntries(catalog.map(f=>[practiceProgressKey('일반물리','hard',f.id),2000]))}));
    failed=false; try { await issuePractice(repos,service(),'u','일반물리','hard'); } catch(e) { failed=(e as Error).message.startsWith('EXHAUSTED:'); }
    expect(failed).toBe(true);
    expect((await issuePractice(repos,service(),'u','일반물리','easy')).difficulty).toBe('easy');
  });
  it('stores all 90,000 issuance positions in fewer than 4 KiB and refuses corrupt cursors', async () => {
    const repos=makeRepositories(new MemoryKVStore()); const progress:Record<string,number>={};
    for(const subject of subjects) for(const difficulty of DIFFICULTIES) for(const f of practiceCatalog(subject,difficulty)) progress[practiceProgressKey(subject,difficulty,f.id)]=VARIANTS_PER_FAMILY;
    await repos.learning.update('u',s=>({...s,practiceProgress:progress}));
    const state=await repos.learning.get('u');
    expect(Object.keys(state.practiceProgress!)).toHaveLength(45);
    expect(encodeURIComponent(JSON.stringify(progress)).replace(/%[0-9A-F]{2}|[^%]/g,'x').length<4096).toBe(true);
    for(const invalid of [-1,2001,0.5]) {
      const key=practiceProgressKey('공업수학','easy','derivative');
      await repos.learning.update('u',s=>({...s,practiceProgress:{[key]:invalid}}));
      let failed=false; try { await issuePractice(repos,service(),'u','공업수학','easy'); } catch { failed=true; }
      expect(failed).toBe(true); expect((await repos.learning.get('u')).practiceProgress![key]).toBe(invalid);
    }
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
    expect(Object.values((await repos.learning.get('real-user')).practiceProgress!)).toEqual([1]);
    expect((await repos.learning.get('demo-user')).practiceProgress).toBe(undefined);
  });
});
