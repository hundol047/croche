import { CURRICULUM_UNITS, curriculumProblem, curriculumUnits } from '@/content/curriculumUnits';
import { EDUCATION_LEVELS, curriculumSubjects } from '@/domain/curriculum';
import { validateProblem } from '@/domain/schemas';
import { assessAnswer } from '@/domain/answerAssessment';
import { curriculumProgressKey, issueCurriculum, unitAvailability, prepareCurriculum, pendingCurriculumProblem, finishCurriculumHandoff, unitCompletion } from '@/domain/curriculumIssuance';
import { makeRepositories } from '@/storage/repositories';
import { MemoryKVStore } from '@/storage/kv';
import { HISTORY_FACTS } from '@/content/schoolHistory';
import { OFFICIAL_EXAMS } from '@/content/officialExams';
import { SessionStore } from '@/state/sessionStore';
import type { MistakeRecord } from '@/domain/types';
import { OFFICIAL_EXAM_RECEIPTS } from '@/content/officialExamReceipts';

const unit = CURRICULUM_UNITS[0]!;
describe('authored curriculum units and honest coverage', () => {
  it('has bounded, gradable, unique items in all 27 supported level/course pairs', () => {
    const ids = new Set<string>();
    for (const level of EDUCATION_LEVELS) for (const subject of curriculumSubjects[level]) {
      const units = curriculumUnits(level, subject), prompts = new Set<string>();
      expect(units.length > 0).toBe(true);
      for (const u of units) for (let i = 0; i < u.items.length; i += 1) {
        const p = curriculumProblem(u, i);
        expect(validateProblem(p).ok).toBe(true);
        expect(assessAnswer(p, p.correctAnswer).verdict).toBe('correct');
        expect(ids.has(p.id)).toBe(false); ids.add(p.id);
        expect(prompts.has(p.prompt)).toBe(false); prompts.add(p.prompt);
        expect(p.contentOrigin).toBe('curriculum-original');
        expect(p.id.startsWith('curriculum-v1:')).toBe(true);
        if (p.options) {
          expect(new Set(p.options).size).toBe(p.options.length);
          for (const wrong of p.options.filter(o => o !== p.correctAnswer)) expect(assessAnswer(p, wrong).verdict).toBe('incorrect');
        }
      }
    }
    expect(ids.size).toBe(226);
  });
  it('distributes authored choice keys instead of always placing them first', () => {
    const positions = new Set<number>();
    for (const u of CURRICULUM_UNITS) for (let i=0;i<u.items.length;i+=1) {
      const p=curriculumProblem(u,i);
      if(p.options)positions.add(p.options.indexOf(p.correctAnswer));
    }
    expect(positions.size).toBe(4);
  });
  it('independently checks rendered arithmetic, probability and Python range prompts', () => {
    let checked = 0;
    for (const u of CURRICULUM_UNITS) for (let i = 0; i < u.items.length; i += 1) {
      const p = curriculumProblem(u, i); let expected: number | undefined;
      let m = /백의 자리 (\d+), 십의 자리 (\d+), 일의 자리 (\d+)인 수(?:에 (\d+)을 더한 수)?는/.exec(p.prompt);
      if (m) expected = 100*Number(m[1])+10*Number(m[2])+Number(m[3])+Number(m[4] ?? 0);
      m = /^(\d+)\+(\d+)의 값/.exec(p.prompt); if (m) expected = Number(m[1])+Number(m[2]);
      m = /사람 (\d+)명이 한 차에 (\d+)명씩/.exec(p.prompt); if (m) expected = Math.ceil(Number(m[1])/Number(m[2]));
      m = /^(\d+)의 (\d+)\/(\d+)은/.exec(p.prompt); if (m) expected = Number(m[1])*Number(m[2])/Number(m[3]);
      m = /가로 (\d+) cm, 세로 (\d+) cm, 높이 (\d+) cm인 직육면체의 부피/.exec(p.prompt); if (m) expected = Number(m[1])*Number(m[2])*Number(m[3]);
      m = /log₂(\d+)\+log₂(\d+)−log₂(\d+)의 값/.exec(p.prompt); if (m) expected = Math.log2(Number(m[1]))+Math.log2(Number(m[2]))-Math.log2(Number(m[3]));
      m = /len\(range\((\d+),(\d+)\)\)/.exec(p.prompt); if (m) expected = Number(m[2])-Number(m[1]);
      m = /sum\(range\((\d+),(\d+),(\d+)\)\)/.exec(p.prompt); if (m) { expected = 0; for (let x=Number(m[1]);x<Number(m[2]);x+=Number(m[3])) expected += x; }
      m = /길이 (\d+)인 리스트의 모든 원소를 한 번씩/.exec(p.prompt); if (m) expected = Number(m[1]);
      m = /공정한 동전을 두 번 던집니다/.exec(p.prompt); if (m) expected = 1/4;
      m = /질량 (\d+) g, 부피 (\d+) cm³인 물체의 밀도/.exec(p.prompt); if (m) expected = Number(m[1])/Number(m[2]);
      m = /전압 (\d+) V, 저항 (\d+) Ω인 회로의 전류/.exec(p.prompt); if (m) expected = Number(m[1])/Number(m[2]);
      m = /진동수 (\d+) Hz, 파장 (\d+) m인 파동의 속력/.exec(p.prompt); if (m) expected = Number(m[1])*Number(m[2]);
      m = /정지 상태에서 가속도 (\d+) m\/s²로 (\d+)초간 움직인 물체의 속력/.exec(p.prompt); if (m) expected = Number(m[1])*Number(m[2]);
      if (expected !== undefined) { expect(assessAnswer(p, String(expected)).verdict).toBe('correct'); checked += 1; }
    }
    expect(checked >= 17).toBe(true);
  });
  it('uses only existing history assertions and verifies displayed year differences', () => {
    const history = CURRICULUM_UNITS.filter(u => u.subject === '한국사');
    expect(history).toHaveLength(28);
    for (const u of history) {
      const p = curriculumProblem(u, 1);
      const a = HISTORY_FACTS.find(f => p.prompt.includes(`가. ${f.clue}`))!;
      const b = HISTORY_FACTS.find(f => p.prompt.includes(`나. ${f.clue}`))!;
      expect(!!a && !!b).toBe(true);
      expect(assessAnswer(p, String(b.year-a.year)).verdict).toBe('correct');
      expect(p.prompt.includes('사료 인용이 아닙니다')).toBe(true);
    }
  });
  it('requires matching release receipts before any official exam is listed', () => {
    for (const exam of OFFICIAL_EXAMS) expect(OFFICIAL_EXAM_RECEIPTS.some(r => exam.id === `official:${r.examId}:${exam.questionNumber}`)).toBe(true);
    for (const r of OFFICIAL_EXAM_RECEIPTS) expect(OFFICIAL_EXAMS.some(e => e.id.startsWith(`official:${r.examId}:`))).toBe(true);
    // Until source access/rights are supplied, counts must stay truthfully zero.
    if (!OFFICIAL_EXAM_RECEIPTS.length) expect(OFFICIAL_EXAMS.length).toBe(0);
  });
});
describe('durable unit reservations', () => {
  it('persists the actual all-grades filter and rejects a mismatched grade reservation', async () => {
    const repos=makeRepositories(new MemoryKVStore());
    await issueCurriculum(repos,'u',unit,'전체');
    expect((await repos.learning.get('u')).curriculumSelection?.group).toBe('전체');
    const before=await repos.learning.get('u');let failed=false;
    try{await issueCurriculum(repos,'u',unit,'다른 학년');}catch{failed=true;}
    expect(failed).toBe(true);expect(await repos.learning.get('u')).toEqual(before);
  });
  it('serializes parallel reservations, persists exhaustion and isolates users', async () => {
    const kv = new MemoryKVStore(), repos = makeRepositories(kv);
    const p = await Promise.all([issueCurriculum(repos,'u',unit),issueCurriculum(repos,'u',unit)]);
    expect(new Set(p.map(x => x.id)).size).toBe(2);
    let exhausted=false; try { await issueCurriculum(makeRepositories(kv),'u',unit); } catch(e) { exhausted=(e as Error).message.startsWith('EXHAUSTED:'); }
    expect(exhausted).toBe(true);
    expect(unitAvailability(await repos.learning.get('u'),unit).remaining).toBe(0);
    expect((await issueCurriculum(repos,'other',unit)).id).toBe(p[0]!.id);
    expect((await repos.learning.get('u')).curriculumSelection?.group).toBe(unit.group);
  });
  it('does not consume a question or alter legacy events on a failed save and retry', async () => {
    class FailingKV extends MemoryKVStore { failing=false; override async setItem(k:string,v:string) { if(this.failing)throw new Error('full'); await super.setItem(k,v); } }
    const kv=new FailingKV(),repos=makeRepositories(kv);
    await repos.learning.update('u',s=>({...s,practiceProgress:{'v2:existing':19},issued:[{kind:'practice',subject:'공업수학',text:'legacy'}]}));
    const before=await repos.learning.get('u');kv.failing=true;
    let failed=false;try{await issueCurriculum(repos,'u',unit);}catch{failed=true;}expect(failed).toBe(true);
    expect(await repos.learning.get('u')).toEqual(before);kv.failing=false;
    expect((await issueCurriculum(makeRepositories(kv),'u',unit)).id).toBe(curriculumProblem(unit,0).id);
    const after=await repos.learning.get('u');expect(after.practiceProgress).toEqual(before.practiceProgress);expect(after.issued).toEqual(before.issued);expect(after.dna).toEqual([]);expect(after.mistakes).toEqual([]);
  });
  it('preserves corrupt counters for recovery and rejects them instead of repeating', async () => {
    const repos=makeRepositories(new MemoryKVStore());
    for(const bad of [-1,0.5,3,NaN]){
      await repos.learning.update('u',s=>({...s,curriculumProgress:{[curriculumProgressKey(unit)]:bad}}));
      const before=await repos.learning.get('u');let failed=false;
      try{await issueCurriculum(repos,'u',unit);}catch{failed=true;}
      expect(failed).toBe(true);expect(await repos.learning.get('u')).toEqual(before);
    }
    for (const corrupt of [null, [], 'bad']) {
      await repos.learning.update('u', s => ({...s, curriculumProgress: corrupt as unknown as Record<string,number>}));
      const before=await repos.learning.get('u');let failed=false;
      try{await issueCurriculum(repos,'u',unit);}catch{failed=true;}
      expect(failed).toBe(true);expect(await repos.learning.get('u')).toEqual(before);
    }
  });
});

describe('recoverable curriculum handoff and review', () => {
  it('restores one reservation across reloads and parallel prepare calls without consuming another', async () => {
    const kv = new MemoryKVStore(), repos = makeRepositories(kv);
    const problems = await Promise.all([prepareCurriculum(repos,'u',unit),prepareCurriculum(repos,'u',unit)]);
    expect(problems[0]!.id).toBe(problems[1]!.id);
    const saved = await repos.learning.get('u');
    expect(unitAvailability(saved,unit).next).toBe(1);
    expect(pendingCurriculumProblem(await makeRepositories(kv).learning.get('u'))?.id).toBe(problems[0]!.id);
    expect(saved.mistakes).toEqual([]);expect(saved.dna).toEqual([]);
    const token = saved.curriculumPending!.token;
    await finishCurriculumHandoff(repos,'u',problems[0]!.id,'stale');
    expect((await repos.learning.get('u')).curriculumPending?.token).toBe(token);
    await finishCurriculumHandoff(repos,'u',problems[0]!.id,token);
    expect((await repos.learning.get('u')).curriculumPending).toBe(undefined);
    expect((await prepareCurriculum(repos,'u',unit)).id).toBe(curriculumProblem(unit,1).id);
  });
  it('reopens only reserved items without resetting exhaustion or cross-user records', async () => {
    const repos=makeRepositories(new MemoryKVStore());
    await issueCurriculum(repos,'u',unit);await issueCurriculum(repos,'u',unit);
    const before=await repos.learning.get('u');
    const review=await prepareCurriculum(repos,'u',unit,'전체',0);
    expect(review.id).toBe(curriculumProblem(unit,0).id);
    const after=await repos.learning.get('u');expect(after.curriculumProgress).toEqual(before.curriculumProgress);
    expect(unitAvailability(after,unit).remaining).toBe(0);expect(after.mistakes).toEqual(before.mistakes);
    let failed=false;try{await prepareCurriculum(repos,'other',unit,'전체',0);}catch{failed=true;}
    expect(failed).toBe(true);expect(unitAvailability(await repos.learning.get('other'),unit).next).toBe(0);
  });
  it('keeps the reserved item when acknowledging a saved session fails; same handoff preserves a submitted answer while a new review clears it', async () => {
    class FailingKV extends MemoryKVStore { failing=false; override async setItem(k:string,v:string){if(this.failing&&k.endsWith(':learning'))throw new Error('full');await super.setItem(k,v);} }
    const kv=new FailingKV(),repos=makeRepositories(kv),session=new SessionStore(()=>kv);
    await session.bind('u');const problem=await prepareCurriculum(repos,'u',unit);const token=(await repos.learning.get('u')).curriculumPending!.token;
    await session.startPractice(problem,token);kv.failing=true;
    let failed=false;try{await finishCurriculumHandoff(repos,'u',problem.id,token);}catch{failed=true;}
    expect(failed).toBe(true);expect(pendingCurriculumProblem(await repos.learning.get('u'))?.id).toBe(problem.id);
    await session.set('currentAttempt',{id:'a',userId:'u',problemId:problem.id,userAnswer:problem.correctAnswer,confidence:'medium',createdAt:'2026-10-08T00:00:00Z'});
    const restored=new SessionStore(()=>kv);await restored.bind('u');await restored.startPractice(problem,token);
    expect(restored.get('currentAttempt')?.id).toBe('a');kv.failing=false;
    await finishCurriculumHandoff(repos,'u',problem.id,token);
    await prepareCurriculum(repos,'u',unit,'전체',0);const reviewToken=(await repos.learning.get('u')).curriculumPending!.token;
    expect(reviewToken===token).toBe(false);await restored.startPractice(problem,reviewToken);expect(restored.get('currentAttempt')).toBe(undefined);
  });
  it('does not count opened or repeated answers twice; latest actual outcome controls completion', () => {
    const id=curriculumProblem(unit,0).id;
    const records=[{problemId:id,isCorrect:false},{problemId:id,isCorrect:true}] as MistakeRecord[];
    expect(unitCompletion({dna:[],mistakes:[],traps:[]},unit)).toEqual({answered:0,correct:0});
    expect(unitCompletion({dna:[],mistakes:records,traps:[]},unit)).toEqual({answered:1,correct:1});
    expect(unitCompletion({dna:[],mistakes:[...records,{problemId:id,isCorrect:false} as MistakeRecord],traps:[]},unit)).toEqual({answered:1,correct:0});
  });
  it('rejects unknown, malformed and unreserved pending items without rewriting them', async () => {
    const repos=makeRepositories(new MemoryKVStore());
    for(const pending of [null,{problemId:'code',token:'curriculum_a'},{problemId:curriculumProblem(unit,1).id,token:'curriculum_a'},{problemId:curriculumProblem(unit,0).id,token:'invalid'}]){
      await repos.learning.update('u',s=>({...s,curriculumProgress:{[curriculumProgressKey(unit)]:1},curriculumPending:pending as unknown as {problemId:string;token:string}}));
      const before=await repos.learning.get('u');let failed=false;
      try{await prepareCurriculum(repos,'u',unit);}catch{failed=true;}
      expect(failed).toBe(true);expect(await repos.learning.get('u')).toEqual(before);
    }
  });
});
