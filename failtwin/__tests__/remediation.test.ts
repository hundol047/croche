import { MemoryKVStore } from '@/storage/kv';
import { makeRepositories, StorageCorruptionError, restoreRecordBackup, exportDamagedRecord, archiveAndResetRecord } from '@/storage/repositories';
import { SessionStore } from '@/state/sessionStore';
import { MockCrocheAIService } from '@/services/ai/MockCrocheAIService';
import { problemById } from '@/content/problems';
import { recordPractice, recordTrap } from '@/domain/learningEvents';
import { assessAnswer } from '@/domain/answerAssessment';
import { findEntry, applyMistake } from '@/domain/errorDnaEngine';
import { latestProblemRecords, reviewProblem } from '@/domain/review';
import { practiceProblem } from '@/content/practiceVariants';
import { CURRICULUM_SUPPLEMENTS } from '@/content/curriculumSupplements';
import { curriculumProblem } from '@/content/curriculumUnits';
import { ToolRunner } from '@/services/ai/tools';
import { predictFromDna } from '@/domain/prediction';
import { buildMemoryContext } from '@/domain/memorySelect';
import { buildReport, totalRisk } from '@/domain/report';
import { issuePractice, issueTrap } from '@/domain/questionIssuance';
import type { CrocheAIService } from '@/services/ai/CrocheAIService';
import { Ok } from '@/utils/result';
import type { Problem, Attempt } from '@/domain/types';
const problem = problemById('eng-math-2')!, ai = new MockCrocheAIService({latencyMs:0});
const attempt = (p:Problem,id:string,answer:string):Attempt => ({id,userId:'u',problemId:p.id,userAnswer:answer,confidence:'medium',createdAt:'2026-10-08T00:00:00Z'});
async function rejected(call:()=>Promise<unknown>) { try { await call(); return false; } catch { return true; } }
async function submit(repos:ReturnType<typeof makeRepositories>,p:Problem,id:string,answer:string) {
 const a=attempt(p,id,answer),result=await ai.analyzeMistake({problem:p,attempt:a,relevantMemories:[]});if(!result.ok)throw new Error(result.error);return recordPractice(repos,p,a,result.value);
}
describe('record preservation and explicit recovery',()=>{
 it('preserves malformed legacy arrays and profiles instead of defaulting to an empty account',async()=>{
  const kv=new MemoryKVStore(),repos=makeRepositories(kv);
  for(const [key,raw] of [['ft:u:dna','[{}]'],['ft:u:mistakes','{}'],['ft:u:traps','null'],['ft:profile:u','{"userId":"u"}']]){
   await kv.setItem(key!,raw!);const read=key!.startsWith('ft:profile:')?()=>repos.profile.get('u'):()=>repos.learning.get('u');
   expect(await rejected(read)).toBe(true);expect(await kv.getItem(key!)).toBe(raw);
   await kv.removeItem(key!);
  }
 });
 it('never turns malformed JSON, null or wrong-shaped learning data into a writable empty history',async()=>{
  const kv=new MemoryKVStore(),repos=makeRepositories(kv),key='ft:u:learning';
  for(const raw of ['{"mistakes":[','null','[]','{"dna":[{}],"mistakes":[],"traps":[]}','']) {
   await kv.setItem(key,raw);let error:unknown;try{await repos.learning.get('u');}catch(e){error=e;}
   expect(error instanceof StorageCorruptionError).toBe(true);expect(await rejected(()=>repos.learning.update('u',s=>s))).toBe(true);expect(await kv.getItem(key)).toBe(raw);
  }
 });
 it('restores only the prior valid snapshot and keeps damaged bytes exportable, including archives',async()=>{
  const kv=new MemoryKVStore(),repos=makeRepositories(kv),key='ft:u:learning';
  await repos.learning.update('u',s=>({...s,practiceProgress:{audit:1}}));
  await repos.learning.update('u',s=>({...s,practiceProgress:{audit:2}}));await kv.setItem(key,'broken');
  const before=JSON.parse(await exportDamagedRecord(key,kv));expect(before.raw).toBe('broken');
  await restoreRecordBackup(key,kv);expect((await repos.learning.get('u')).practiceProgress?.audit).toBe(1);
  const after=JSON.parse(await exportDamagedRecord(key,kv));expect(after.archives[0].raw).toBe('broken');
 });
 it('refuses corrupt backup and a failed archive write without replacing the damaged primary',async()=>{
  class Failing extends MemoryKVStore { fail=false;override async setItem(k:string,v:string){if(this.fail&&k.includes(':damaged:'))throw new Error('full');await super.setItem(k,v);} }
  const kv=new Failing(),key='ft:u:learning';await kv.setItem(key,'damaged');await kv.setItem(`${key}:backup`,'null');
  expect(await rejected(()=>restoreRecordBackup(key,kv))).toBe(true);expect(await kv.getItem(key)).toBe('damaged');
  kv.fail=true;expect(await rejected(()=>archiveAndResetRecord(key,kv))).toBe(true);expect(await kv.getItem(key)).toBe('damaged');
 });
 it('archives the interrupted session before explicit reset and isolates another user',async()=>{
  const kv=new MemoryKVStore();await kv.setItem('ft:u:learning','broken');await kv.setItem('ft:u:session','old-session');await kv.setItem('ft:other:learning','untouched');
  await archiveAndResetRecord('ft:u:learning',kv);expect((await makeRepositories(kv).learning.get('u')).mistakes).toEqual([]);
  expect(await kv.getItem('ft:u:session')).toBe('{}');expect(await kv.getItem('ft:other:learning')).toBe('untouched');
  expect(JSON.parse(await exportDamagedRecord('ft:u:session',kv)).archives[0].raw).toBe('old-session');
 });
 it('stops a commit when backup storage fails, without partially saving an event',async()=>{
  class Failing extends MemoryKVStore { fail=false;override async setItem(k:string,v:string){if(this.fail&&k.endsWith(':backup'))throw new Error('full');await super.setItem(k,v);} }
  const kv=new Failing(),repos=makeRepositories(kv);await repos.learning.update('u',s=>s);const before=await kv.getItem('ft:u:learning');kv.fail=true;
  expect(await rejected(()=>submit(repos,problem,'a','3e^(2x)'))).toBe(true);expect(await kv.getItem('ft:u:learning')).toBe(before);
 });
});
describe('evidence and scoped DNA',()=>{
 it('keeps physics sign Traps in physics with verified keys, HIT evidence and truthful unsupported combinations',async()=>{
  const repos=makeRepositories(new MemoryKVStore()),service=new MockCrocheAIService({latencyMs:0});
  const input={subject:'일반물리' as const,targetErrorType:'sign_error' as const,recentTopics:[],relevantMemories:[]};
  const first=await issueTrap(repos,service,'u',input),second=await issueTrap(repos,service,'u',input);
  expect(first.subject).toBe('일반물리');expect(second.subject).toBe('일반물리');expect(first.question).not.toBe(second.question);
  expect(first.correctAnswer).toBe('-6');expect(second.correctAnswer).toBe('-20');for(const trap of [first,second])expect(assessAnswer(trap,trap.correctAnswer).verdict).toBe('correct');
  const wrong=await recordTrap(repos,first,{...attempt(problem,'trap-wrong','6'),problemId:'physics-trap'});expect(wrong.predictionHit).toBe(true);
  const neutral=await recordTrap(repos,first,{...attempt(problem,'trap-neutral','5'),problemId:'physics-trap'});expect(neutral.predictionHit).toBe(false);expect(neutral.actualErrorType).toBe(undefined);
  const correct=await recordTrap(repos,first,{...attempt(problem,'trap-correct','-6'),problemId:'physics-trap'});expect(correct.afterScore).toBe(8);
  expect((await service.generateTrapProblem({...input,subject:'Python 프로그래밍'})).ok).toBe(false);
 });
 it('rejects generated course, stage, difficulty and target mismatches before reserving any history',async()=>{
  const repos=makeRepositories(new MemoryKVStore()),res=await ai.generateTrapProblem({subject:'공업수학',targetErrorType:'sign_error',recentTopics:[],relevantMemories:[]});if(!res.ok)throw new Error(res.error);
  const fake:CrocheAIService={kind:'real',analyzeMistake:i=>ai.analyzeMistake(i),predictNextMistake:i=>ai.predictNextMistake(i),generateProblem:async()=>Ok({...problem,subject:'일반물리'}),generateTrapProblem:async()=>Ok({...res.value,subject:'일반물리'})};
  expect(await rejected(()=>issuePractice(repos,fake,'u','공업수학'))).toBe(true);
  const input={subject:'공업수학' as const,targetErrorType:'sign_error' as const,recentTopics:[],relevantMemories:[]};expect(await rejected(()=>issueTrap(repos,fake,'u',input))).toBe(true);
  for(const patch of [{educationLevel:'high' as const,subject:'수학' as const},{targetErrorType:'condition_omission' as const}]){fake.generateTrapProblem=async()=>Ok({...res.value,...patch});expect(await rejected(()=>issueTrap(repos,fake,'u',input))).toBe(true);}
  fake.generateProblem=async()=>Ok({...problem,difficulty:'hard'});expect(await rejected(()=>issuePractice(repos,fake,'u','공업수학','easy'))).toBe(true);
  const state=await repos.learning.get('u');expect(state.issued??[]).toEqual([]);expect(state.dna).toEqual([]);expect(state.mistakes).toEqual([]);
 });
 it('serializes named tool updates and keeps same-named errors in separate courses and stages',async()=>{
  const repos=makeRepositories(new MemoryKVStore()),runner=new ToolRunner(repos,ai);
  const base={userId:'u',subject:'수학',topic:'부호',errorType:'sign_error',severity:3,outcome:'mistake',educationLevel:'high'};
  const results=await Promise.all([runner.runTool('updateErrorDNA',base),runner.runTool('updateErrorDNA',base),runner.runTool('updateErrorDNA',{...base,educationLevel:'middle'})]);
  for(const result of results)expect(result.ok).toBe(true);
  const entries=await repos.dna.get('u');expect(entries).toHaveLength(2);
  expect(findEntry(entries,'sign_error',{subject:'수학',educationLevel:'high'})?.occurrenceCount).toBe(2);
  expect(findEntry(entries,'sign_error',{subject:'수학',educationLevel:'middle'})?.occurrenceCount).toBe(1);
  expect((await runner.runTool('saveMistakeAnalysis',{userId:'u',problemId:'missing',isCorrect:false,errorType:'sign_error'})).ok).toBe(false);
  expect((await repos.mistakes.get('u')).length).toBe(0);
 });
 it('coefficient-only and unknown errors remain wrong without inventing a sign error or DNA',async()=>{
  const repos=makeRepositories(new MemoryKVStore());const record=await submit(repos,problem,'a','6e^(-2x)');
  expect(record.isCorrect).toBe(false);expect(record.errorType).toBe(undefined);expect((await repos.learning.get('u')).dna).toEqual([]);
  await recordPractice(repos,problem,record.attempt,{...record.analysis,errorType:'sign_error'});expect((await repos.learning.get('u')).mistakes).toHaveLength(1);
 });
 it('distinguishes course and stage, applies correction only to the matching scope, and preserves legacy scores',async()=>{
  const repos=makeRepositories(new MemoryKVStore());const legacy=applyMistake(undefined,{userId:'u',subject:'공업수학',topic:'old',errorType:'sign_error',severity:3});
  await repos.dna.save('u',[{...legacy,score:40,legacyAggregate:true}]);
  const physics:Problem={...problem,id:'physics',subject:'일반물리'},high:Problem={...problem,id:'high',subject:'수학',educationLevel:'high'},middle:Problem={...high,id:'middle',educationLevel:'middle'};
  for(const [i,p] of [problem,physics,high,middle].entries())await submit(repos,p,`a${i}`,'3e^(2x)');
  await submit(repos,problem,'correct',problem.correctAnswer);const state=await repos.learning.get('u');
  expect(state.dna).toHaveLength(5);expect(state.dna[0]!.score).toBe(40);
  expect(findEntry(state.dna,'sign_error',problem)?.score).toBe(8);expect(findEntry(state.dna,'sign_error',physics)?.score).toBe(17);
  expect(findEntry(state.dna,'sign_error',high)?.score).toBe(17);expect(findEntry(state.dna,'sign_error',middle)?.score).toBe(17);expect(findEntry(state.dna,'sign_error')).toBe(undefined);
  const context=buildMemoryContext(state.dna,high);expect(context).toHaveLength(1);expect(context[0]!.score).toBe(17);
  expect(predictFromDna(state.dna,{subject:'공업수학',educationLevel:'university'})?.riskScore).toBeLessThan(25);
  expect(predictFromDna(state.dna.filter(e=>e.legacyAggregate))).toBe(null);
  expect(totalRisk(state.dna)).toBe(14.8);expect(buildReport(state.mistakes,state.traps,state.dna).mostDangerousScore).toBe(17);
 });
});
describe('durable drafts, fractions and review',()=>{
 it('persists Trap drafts and allows intentional editing of an old attempt without stale edits replacing a newer submission',async()=>{
  const kv=new MemoryKVStore(),session=new SessionStore(()=>kv);await session.bind('u');await session.startPractice(problem);
  const old=attempt(problem,'old',problem.correctAnswer),draft={problemId:problem.id,answer:'6e^(-2x)',reasoning:'비교',confidence:'medium' as const};
  await session.set('currentAttempt',old);await session.savePracticeDraft(draft,old.id);expect(session.get('currentAttempt')).toBe(undefined);expect(session.get('practiceDraft')).toEqual(draft);
  await session.set('currentAttempt',attempt(problem,'new',problem.correctAnswer));await session.savePracticeDraft(draft,old.id);expect(session.get('currentAttempt')?.id).toBe('new');expect(session.get('practiceDraft')).toBe(undefined);
  const result=await ai.generateTrapProblem({targetErrorType:'sign_error',subject:'공업수학',recentTopics:[],relevantMemories:[]});if(!result.ok)throw new Error(result.error);
  await session.startTrap(result.value,'trap-draft');const trapDraft={...draft,problemId:'trap-draft',answer:result.value.correctAnswer};await session.saveTrapDraft(trapDraft);
  const restored=new SessionStore(()=>kv);await restored.bind('u');expect(restored.get('trapDraft')).toEqual(trapDraft);
  await restored.set('trapAttempt',{...old,problemId:'trap-draft'});await restored.saveTrapDraft(trapDraft);expect(restored.get('trapDraft')).toBe(undefined);
 });
 it('restores answer, reasoning and confidence without creating a learning event; stale drafts cannot follow a new problem or account',async()=>{
  const kv=new MemoryKVStore(),session=new SessionStore(()=>kv);await session.bind('u');await session.startPractice(problem);
  const draft={problemId:problem.id,answer:'3e^(-2x)',reasoning:'초기 조건 대입',confidence:'high' as const};await session.savePracticeDraft(draft);
  const restored=new SessionStore(()=>kv);await restored.bind('u');expect(restored.get('practiceDraft')).toEqual(draft);expect((await makeRepositories(kv).learning.get('u')).mistakes).toEqual([]);
  const next=problemById('phys-1')!;await Promise.all([restored.startPractice(next),restored.savePracticeDraft(draft)]);expect(restored.get('practiceDraft')).toBe(undefined);
  await restored.bind('other');expect(restored.get('practiceDraft')).toBe(undefined);
 });
 it('queued draft saves cannot restore a draft after submission, and same handoff preserves drafts',async()=>{
  const kv=new MemoryKVStore(),session=new SessionStore(()=>kv);await session.bind('u');await session.startPractice(problem,'handoff');
  const draft={problemId:problem.id,answer:problem.correctAnswer,reasoning:'',confidence:'medium' as const};await session.savePracticeDraft(draft);await session.startPractice(problem,'handoff');expect(session.get('practiceDraft')).toEqual(draft);
  await session.set('currentAttempt',attempt(problem,'a',problem.correctAnswer));await session.savePracticeDraft(draft);expect(session.get('practiceDraft')).toBe(undefined);
  await session.startPractice(problem,undefined,'review');expect(session.get('currentAttempt')).toBe(undefined);expect(session.get('practiceReturnTo')).toBe('review');
 });
 it('rejects damaged session/draft snapshots instead of losing or overwriting them',async()=>{
  const kv=new MemoryKVStore();for(const raw of ['broken','[]','null',JSON.stringify({currentProblem:problem,practiceDraft:{problemId:problem.id,answer:5}})]){
   await kv.setItem('ft:u:session',raw);expect(await rejected(()=>new SessionStore(()=>kv).bind('u'))).toBe(true);expect(await kv.getItem('ft:u:session')).toBe(raw);
  }
 });
 it('accepts bounded rational input, rejects zero divisors, nested expressions, code and underflow',()=>{
  for(const a of ['1/2','2 / 4','0.5'])expect(assessAnswer({answerType:'numeric',correctAnswer:'0.5'},a).verdict).toBe('correct');
  expect(assessAnswer({answerType:'numeric',correctAnswer:'0'},'1e-8').verdict).toBe('incorrect');
  expect(assessAnswer({answerType:'numeric',correctAnswer:'1e-8'},'0').verdict).toBe('incorrect');
  expect(assessAnswer({answerType:'numeric',correctAnswer:'-0.5'},'-1/2').verdict).toBe('correct');
  for(const a of ['1/0','0/0','1/(2+3)','(()=>0.5)()','1e-400'])expect(assessAnswer({answerType:'numeric',correctAnswer:'0.5'},a).verdict).toBe('ungradable');
  expect(assessAnswer({answerType:'text',correctAnswer:'[0,0.5)'},'[0,1/2)').verdict).toBe('correct');expect(assessAnswer({answerType:'text',correctAnswer:'[0,0.5)'},'[0,1/2]').verdict).toBe('incorrect');
 });
 it('reconstructs immutable past questions and groups repeated attempts by latest outcome',async()=>{
  const repos=makeRepositories(new MemoryKVStore());const a=await submit(repos,problem,'a','6e^(-2x)'),b=await submit(repos,problem,'b',problem.correctAnswer);
  const latest=latestProblemRecords([a,b]);expect(latest).toHaveLength(1);expect(latest[0]!.isCorrect).toBe(true);expect(reviewProblem({...a,problem:undefined})?.id).toBe(problem.id);
  expect(latestProblemRecords([a,{...a,id:'other',problemId:'another'},b]).map(r=>r.problemId)).toEqual([problem.id,'another']);
  const p=practiceProblem('일반물리','easy','speed',4);expect(reviewProblem({...a,problem:undefined,problemId:p.id})?.prompt).toBe(p.prompt);
  expect(reviewProblem({...a,problemId:'unknown',problem:undefined})).toBe(undefined);
 });
 it('audits new supplemental keys and independently checks numeric conditions',()=>{
  expect(CURRICULUM_SUPPLEMENTS).toHaveLength(13);
  for(const u of CURRICULUM_SUPPLEMENTS)for(let i=0;i<u.items.length;i+=1){const p=curriculumProblem(u,i);expect(assessAnswer(p,p.correctAnswer).verdict).toBe('correct');}
  const values=[63,2/3,6,12,4,3/2,16/40,6/20,3,20,7];
  const numbers=CURRICULUM_SUPPLEMENTS.flatMap(u=>u.items.filter(i=>i.answerType==='numeric'));
  expect(numbers).toHaveLength(values.length);for(let i=0;i<values.length;i+=1)expect(Math.abs(Number(numbers[i]!.correctAnswer)-values[i]!)<1e-12).toBe(true);
 });
});
