import { schoolFamilies, schoolProblem } from '@/content/schoolBank';
import { curriculumSubjects, type SchoolLevel } from '@/domain/curriculum';
import { DIFFICULTIES, practiceProblem, practiceCatalog } from '@/content/practiceVariants';
import { validateProblem } from '@/domain/schemas';
import { assessAnswer } from '@/domain/answerAssessment';
import { issuePractice, issueTrap, practiceAvailability, practiceProgressKey } from '@/domain/questionIssuance';
import { recordPractice, recordTrap } from '@/domain/learningEvents';
import { makeRepositories } from '@/storage/repositories';
import { MemoryKVStore } from '@/storage/kv';
import { MockCrocheAIService } from '@/services/ai/MockCrocheAIService';
import { HISTORY_FACTS } from '@/content/schoolHistory';
import type { Problem, Attempt } from '@/domain/types';
const levels:SchoolLevel[]=['elementary','middle','high','csat'];
const service=()=>new MockCrocheAIService({latencyMs:0});
const sum=(n:number[])=>n.reduce((a,b)=>a+b,0);
const numbers=(p:Problem)=>[...p.prompt.replace(/\n숫자만 입력[\s\S]*$/,'').matchAll(/\d+(?:\.\d+)?/g)].map(m=>Number(m[0]));
const integerCount=(lo:number,hi:number,accept:(x:number)=>boolean)=>{let count=0;for(let x=lo;x<=hi;x++)if(accept(x))count++;return count;};
/** Independent calculations from the displayed math conditions, not seed parameters. */
function mathAnswer(p:Problem,id:string):number {
 const n=numbers(p);
 switch(id){
  case 'addition':case 'time':return sum(n);
  case 'subtraction':return n[0]!-n[1]!-n[2]!;
  case 'multiplication':return n[0]!*n[1]!+n[2]!;
  case 'division':return (n[0]!+n[1]!)/n[2]!;
  case 'fraction':return n[0]!+n[2]!;
  case 'rectangle':return 2*sum(n);
  case 'area':return n[0]!*n[1]!-n[2]!;
  case 'decimal':return sum(n);
  case 'average':return sum(n)/3;
  case 'ratio':return n[2]!*n[1]!/(n[0]!+n[1]!);
  case 'discount':return n[2]!-n[0]!*(1-n[1]!/100);
  case 'volume':return n[0]!*n[1]!*n[2]!-n[3]!;
  case 'meeting':return (n[1]!+n[3]!)*n[4]!;
  case 'reverse-average':return 3*n[2]!-n[0]!-n[1]!;
  case 'integer':return -n[0]!+n[1]!*n[2]!;
  case 'linear-equation':{const m=p.prompt.match(/(\d+)x−(\d+)=(-?\d+)/)!;return(Number(m[3])+Number(m[2]))/Number(m[1]);}
  case 'function':return n[0]!*n[2]!+n[1]!;
  case 'triangle':return 180-n[0]!-n[1]!;
  case 'probability':return n[0]!/sum(n);
  case 'system':return (n[2]!-n[0]!)/(n[1]!-1);
  case 'slope':return (n[3]!-n[1]!)/(n[2]!-n[0]!);
  case 'quadratic':return n[0]!**2+n[1]!**2+n[3]!;
  case 'similarity':return n[2]!*n[3]!*n[1]!**2;
  case 'pythagoras':return n[0]!**2+n[1]!**2;
  case 'line-intersection':return (n[2]!-n[1]!)/(n[0]!-1);
  case 'quadratic-vertex':return n[1]!+n[2]!;
  case 'draw-two':return n[0]!*(n[0]!-1)/((n[0]!+n[1]!)*(n[0]!+n[1]!-1));
  case 'inequality':return integerCount(-n[0]!,n[1]!-1,x=>(x%n[2]!)===0);
  case 'weighted-average':case 'csat-expectation':return(n[0]!*n[1]!+n[2]!*n[3]!)/(n[1]!+n[3]!);
  case 'polynomial':return n[0]!*n[3]!**2+n[1]!*n[3]!+n[2]!;
  case 'arithmetic':return n[0]!+(n[2]!-1)*n[1]!;
  case 'csat-log':return n[1]!+n[3]!-n[5]!;
  case 'logarithm':return n[2]!+n[4]!-n[6]!;
  case 'derivative':case 'csat-slope':return 2*n[0]!*n[2]!+n[1]!;
  case 'combination':case 'csat-choose':return n[0]!*(n[0]!-1)/2;
  case 'csat-area':return n[0]!*n[3]!**2/2+n[1]!*n[3]!;
  case 'integral':return n[1]!*n[0]!**2/2+n[2]!*n[0]!;
  case 'quadratic-condition':return (n[2]!-n[0]!)**2-(n[3]!-n[0]!)**2;
  case 'geometric':return n[0]!*n[1]!**(n[2]!-1);
  case 'conditional':return n[2]!/(n[2]!+n[4]!);
  case 'tangent':case 'csat-tangent':return n[2]!-n[0]!*n[3]!**2;
  case 'optimization':case 'csat-extremum':return Math.min((n[2]!-n[0]!)**2,(n[3]!-n[0]!)**2)+n[1]!;
  case 'absolute-area':{const m=p.prompt.match(/x=(-?\d+)부터 x=(-?\d+)/)!;return n[0]!*((Number(m[1])-n[1]!)**2+(Number(m[2])-n[1]!)**2)/2;}
  case 'second':return 6*n[3]!+2*(n[0]!+n[1]!+n[2]!);
  case 'without-replacement':case 'csat-complex-count':return 2*n[0]!*n[1]!/((n[0]!+n[1]!)*(n[0]!+n[1]!-1));
  case 'integer-count':case 'csat-integer':return integerCount(-n[0]!,n[1]!,x=>(x-n[2]!)**2<=n[3]!);
  case 'csat-value':return n[0]!+n[1]!+n[2]!;
  case 'csat-sequence':return sum(Array.from({length:n[2]!},(_,i)=>n[0]!+i*n[1]!));
  case 'csat-remainder':return (n[4]!-n[0]!)*n[3]!+n[1]!;
  case 'csat-probability':return n[0]!/(n[0]!+n[1]!);
  case 'csat-geometric':return n[0]!*(n[1]!/n[0]!)**(n[2]!-1);
  case 'csat-piecewise':{const m=p.prompt.match(/∫_(-?\d+)\^(-?\d+) (\d+)\|x−(\d+)\|/)!;return Number(m[3])*((Number(m[1])-Number(m[4]))**2+(Number(m[2])-Number(m[4]))**2)/2;}
  default:throw new Error(`Missing oracle ${id}`);
 }
}

/** The reference reads quantities from each rendered physics/science statement. */
function scienceAnswer(p:Problem,id:string):number {
 const n=numbers(p);
 const reaction=()=>{const m=p.prompt.match(/H₂ (\d+) mol, O₂ (\d+) mol/)!;return [Number(m[1]),Number(m[2])];};
 switch(id){
  case 'temperature':return n[0]!+n[1]!-n[2]!;
  case 'plant':case 'mass':case 'rain':return sum(n);
  case 'water':case 'evaporation':return n[0]!-n[1]!-n[2]!;
  case 'observation':case 'mix-temperature':return sum(n)/3;
  case 'food':return n[0]!*n[1]!*n[2]!;
  case 'separation':return n[0]!;
  case 'ecosystem':return n[0]!-n[1]!+n[2]!;
  case 'density':case 'speed':return n[0]!/n[1]!;
  case 'pressure':return n[0]!/(n[1]!*n[2]!);
  case 'nucleus':return n[0]!+n[1]!;
  case 'series-current':case 'csat-series':return n[2]!/(n[0]!+n[1]!);
  case 'work':return (n[0]!-n[1]!)*n[2]!;
  case 'heat':return n[0]!*n[1]!*n[2]!;
  case 'reaction-mass':return n[0]!+n[1]!-n[2]!;
  case 'solution':return 100*n[0]!/(n[0]!+n[1]!);
  case 'potential':return n[0]!*n[1]!*n[2]!;
  case 'accelerating':case 'csat-accelerate':return n[0]!*n[2]!+n[1]!*n[2]!**2/2;
  case 'parallel-current':return n[2]!/n[0]!+n[2]!/n[1]!;
  case 'temperature-mixture':case 'heat-capacity':case 'csat-temperature':return (n[0]!*n[1]!+n[2]!*n[3]!)/(n[0]!+n[2]!);
  case 'dilution':return 100*n[0]!/(n[0]!+n[1]!+n[2]!);
  case 'return-speed':return (2*n[0]!)/(n[0]!/n[1]!+n[0]!/n[2]!);
  case 'atomic-electrons':return n[0]!-n[2]!;
  case 'mechanical':return n[0]!*n[1]!**2/2+n[0]!*n[2]!*n[3]!;
  case 'electric-power':return n[0]!*n[1]!**2;
  case 'wave':case 'csat-wave':return n[0]!*n[1]!;
  case 'mass-ratio':return n[2]!*n[1]!/n[0]!;
  case 'stoichiometry':{const [h,o]=reaction();return Math.min(h!,2*o!);}
  case 'heat-efficiency':return n[0]!*n[1]!*(1-n[2]!/100);
  case 'momentum':case 'csat-collision':return n[0]!*n[1]!/(n[0]!+n[2]!);
  case 'electrical-energy':case 'csat-power':return n[0]!*n[1]!*n[2]!;
  case 'concentration':return n[0]!*n[1]!/n[2]!;
  case 'limiting-left':{const [h,o]=reaction();return Math.max(0,o!-h!/2);}
  case 'friction-energy':return n[0]!*n[1]!*n[2]!*n[3]!;
  case 'mixed-circuit':case 'csat-mixed':return n[3]!/(n[2]!+1/(1/n[0]!+1/n[1]!));
  case 'motion-work':return n[1]!**2*n[2]!**2/(2*n[0]!);
  case 'csat-velocity':return (n[1]!-n[0]!)/n[2]!;
  case 'csat-momentum':return n[0]!*n[1]!;
  case 'csat-kinetic':return n[0]!*n[1]!**2/2;
  case 'csat-current':return n[1]!/n[0]!;
  case 'csat-heat':return n[1]!*n[2]!/n[0]!;
  case 'csat-braking':return n[0]!*n[1]!+n[0]!**2/(2*n[2]!);
  case 'csat-loss':{const v=n[0]!*n[1]!/(n[0]!+n[2]!);return n[0]!*n[1]!**2/2-(n[0]!+n[2]!)*v*v/2;}
  case 'csat-interference':return integerCount(n[1]!,n[2]!,x=>(x%n[0]!)===0);
  default:throw new Error(`Missing science oracle ${id}`);
 }
}
function socialAnswer(p:Problem,id:string):number {
 const n=numbers(p);
 switch(id){
  case 'so-route':case 'so-vote':return sum(n);
  case 'so-budget':return n[0]!-n[1]!-n[2]!;
  case 'so-population':return 100*n[0]!/sum(n);
  case 'so-density':return (n[0]!+n[1]!)/n[2]!;
  case 'so-ratio':return 100*n[1]!/(n[1]!+n[2]!);
  case 'so-income':return sum(n)/3;
  case 'so-price':return n[0]!*(1+n[1]!/100)-n[2]!;
  case 'so-weighted':return (n[0]!*n[1]!+n[2]!*n[3]!)/(n[0]!+n[2]!);
  case 'so-poverty':return n[0]!*n[1]!/100;
  case 'so-change':return 100*(n[3]!-n[0]!)/n[0]!;
  case 'so-demand':return(n[0]!+n[1]!+n[2]!-n[3]!)/2;
  default:throw new Error(`Missing social oracle ${id}`);
 }
}

/** Logic/reading checks parse the material actually shown to the learner. */
function readingAnswer(p:Problem,id:string):string|undefined {
 const s=p.prompt;
 const rows=s.split('\n').filter(r=>/^[가나다라A-D]: /.test(r));
 if(id==='ko-rule'||id==='en-rule'){
  const criteria=id==='ko-rule'?[...s.matchAll(/(?:읽은 책 수가|기록한 날 수가|참여 횟수가) (\d+) (이상|이하)/g)].map(m=>({value:Number(m[1]),op:m[2]==='이상'?'min':'max'})):[...s.matchAll(/(at least|no more than|exactly) (\d+) (?:books|days of records|late reports)/g)].map(m=>({value:Number(m[2]),op:m[1]==='at least'?'min':m[1]==='no more than'?'max':'exact'}));
  const eligible=rows.filter(row=>{const values=[...row.matchAll(/\d+/g)].map(m=>Number(m[0]));return criteria.every((rule,i)=>rule.op==='min'?values[i]!>=rule.value:rule.op==='max'?values[i]!<=rule.value:values[i]===rule.value);});
  if(eligible.length!==1)throw new Error(`Ambiguous reading rule ${p.id}`);
  return eligible[0]![0]!;
 }
 if(id==='ko-counterexample'){
  const claim=s.match(/“([^”]+)”/)![1]!,values=[...claim.matchAll(/\d+/g)].map(m=>Number(m[0]));
  const counter=rows.filter(row=>{const n=[...row.matchAll(/\d+/g)].map(m=>Number(m[0]));return claim.startsWith('책을')?(values.length===3?n[0]!>=values[0]!&&n[1]!>=values[1]!&&n[2]!<values[2]!:n[0]!>=values[0]!&&n[1]!<values[1]!):n[1]!>=values[0]!&&n[0]!<values[1]!;});
  if(counter.length!==1)throw new Error(`Ambiguous counterexample ${p.id}`);
  return counter[0]![0]!;
 }
 if(id==='ko-order'||id==='en-order'){
  const events=id==='ko-order'?[...s.matchAll(/(독서 모임|발표 모임|토론 모임): 시작부터 제(\d+)일/g)].map(m=>({name:m[1]!,day:Number(m[2])})):[...s.matchAll(/(Reading|Discussion|Presentation) takes place on day (\d+)/g)].map(m=>({name:m[1]!,day:Number(m[2])}));
  events.sort((a,b)=>a.day-b.day);
  return p.difficulty==='hard'?events.map(e=>e.name).join(' → '):events[p.difficulty==='easy'?0:2]!.name;
 }
 if(id==='ko-notice'){
  const m=s.match(/참가비는 (\d+)원, 접수 마감은 이달 (\d+)일, 정원은 (\d+)명/)!;
  return p.difficulty==='hard'?`${Number(m[1])*Number(m[3])}원`:`${Number(m[2])+(p.difficulty==='medium'?1:0)}일`;
 }
 if(id==='ko-evidence'){
  if(p.difficulty==='hard')return '운영 기간과 이용자 구성도 달라 단일 원인을 확정할 수 없다';
  if(p.difficulty==='medium'){const first=Number(s.match(/첫 주의 대출은 (\d+)권/)![1]),days=Number(s.match(/각각 (\d+)일/)![1]);return `${Number((first/days).toFixed(6))}권`;}
  const m=s.match(/첫 주의 대출은 (\d+)권, 다음 주는 (\d+)권/)!;const diff=Number(m[2])-Number(m[1]);
  return diff>0?`대출 총량은 ${diff}개 증가했다`:diff<0?`대출 총량은 ${-diff}개 감소했다`:'대출 총량은 변하지 않았다';
 }
 if(id==='en-reference')return p.difficulty==='hard'?'receipt':s.match(/(?:bought|selected) a (\w+)/)![1]!;
 if(id==='en-grammar'){
  const past=s.includes('Yesterday');
  const verbObjects:Record<string,[string,string]>={'football':['played','plays'],'a book':['read','reads'],'a notebook':['bought','buys'],'a model':['made','makes'],'a movie':['watched','watches'],'the museum':['visited','visits'],'breakfast':['ate','eats'],'water':['drank','drinks'],'English':['studied','studies'],'a diary':['wrote','writes']};
  const object=s.match(/___ ([^.]+?)(?: and ___|\.)/)![1]!;
  const first=verbObjects[object]![past?0:1];
  return p.difficulty==='hard'?`${first}; ${past?'wrote':'writes'}`:first;
 }
 if(id==='en-vocabulary'&&p.difficulty!=='easy'){
  const m=s.match(/This (\w+) is (\w+),/)!;
  return p.difficulty==='medium'?`${m[1]}: ${m[2]}`:'첫 번째 대상';
 }
 return undefined;
}

describe('school curriculum bank',()=>{
 for(const level of levels)for(const subject of curriculumSubjects[level])it(`${level} ${subject}: 30,000 valid, distinct condition variants with supported grading`,()=>{
   let count=0; const seen=new Set<string>();
   for(const difficulty of DIFFICULTIES){
     for(const f of schoolFamilies(level,subject,difficulty))for(let i=0;i<2000;i++){
       const p=schoolProblem(level,subject,difficulty,f.id,i);
       if(seen.has(p.prompt))throw new Error(`Duplicate ${p.id}`);
       seen.add(p.prompt);count++;
       const checked=validateProblem(p);
       if(!checked.ok)throw new Error(`${p.id}: ${checked.error}`);
       if(assessAnswer(p,p.correctAnswer).verdict!=='correct')throw new Error(`Ungradable key ${p.id}`);
       if((subject==='수학')||(p.answerType==='numeric' && ['과학','통합과학','물리학Ⅰ','사회','통합사회','사회·문화'].includes(subject))) {
         const expected=subject==='수학'?mathAnswer(p,f.id):subject.includes('사회')?socialAnswer(p,f.id):scienceAnswer(p,f.id);
         if(!Number.isFinite(expected)||Math.abs(Number(p.correctAnswer)-expected)>=1e-6)throw new Error(`${p.id}: independent answer ${expected}, key ${p.correctAnswer}`);
       }
       if(subject==='국어'||subject==='영어') {
         const expected=readingAnswer(p,f.id);
         if(expected!==undefined && p.correctAnswer!==expected)throw new Error(`${p.id}: reading logic answer ${expected}, key ${p.correctAnswer}`);
       }
       if(p.options && new Set(p.options).size!==p.options.length)throw new Error(`Duplicate choice ${p.id}`);
       if(level==='csat' && p.contentOrigin!=='original-csat')throw new Error('Misattributed CSAT content');
     }
     expect(seen.size).toBe((DIFFICULTIES.indexOf(difficulty)+1)*10000);
   }
   expect(count).toBe(30000);
 },60000);
 for(const level of levels)it(`${level}: displayed math conditions independently determine the answer`,()=>{
   for(const d of DIFFICULTIES)for(const f of schoolFamilies(level,'수학',d))for(const i of [0,1,137,777,1999]){
     const p=schoolProblem(level,'수학',d,f.id,i),expected=mathAnswer(p,f.id);
     if(!Number.isFinite(expected)||Math.abs(Number(p.correctAnswer)-expected)>=1e-6)throw new Error(`${p.id}\n${p.prompt}\nexpected ${expected}, got ${p.correctAnswer}`);
   }
 });
 for(const level of levels)it(`${level}: science and social numeric variants match independently read conditions`,()=>{
  const subjects=curriculumSubjects[level].filter(s=>['과학','통합과학','물리학Ⅰ','사회','통합사회','사회·문화'].includes(s));
  for(const subject of subjects)for(const d of DIFFICULTIES)for(const f of schoolFamilies(level,subject,d))for(const i of [0,1,137,777,1999]){
   const p=schoolProblem(level,subject,d,f.id,i);if(p.answerType!=='numeric')continue;
   const expected=subject.includes('사회')?socialAnswer(p,f.id):scienceAnswer(p,f.id);
   if(!Number.isFinite(expected)||Math.abs(Number(p.correctAnswer)-expected)>=1e-6)throw new Error(`${p.id}\n${p.prompt}\nexpected ${expected}, got ${p.correctAnswer}`);
  }
 });
 it('historical anchors distinguish creation/publication, wars and democratic movements',()=>{
  const anchors:Record<string,number>={'훈민정음 창제':1443,'훈민정음 반포':1446,'임진왜란 발발':1592,'정묘호란':1627,'병자호란':1636,'병인양요':1866,'신미양요':1871,'강화도 조약 체결':1876,'3·1 운동':1919,'봉오동 전투':1920,'한국 광복군 창설':1940,'광복':1945,'대한민국 정부 수립':1948,'6·25 전쟁 발발':1950,'4·19 혁명':1960,'5·18 민주화 운동':1980,'6월 민주 항쟁':1987};
  for(const [name,year] of Object.entries(anchors))expect(HISTORY_FACTS.find(f=>f.name===name)?.year).toBe(year);
  expect(new Set(HISTORY_FACTS.map(f=>f.year)).size).toBe(HISTORY_FACTS.length);
 });
 it('history keys follow the displayed facts, including hard summaries, not option position',()=>{
  for(const d of DIFFICULTIES)for(const f of schoolFamilies('csat','한국사',d))for(const i of [0,1,137,777,1999]){
   const p=schoolProblem('csat','한국사',d,f.id,i);
   const rows=p.prompt.split('\n').filter(row=>/^[가나다]\. /.test(row)).map(row=>({label:row[0],fact:HISTORY_FACTS.find(fact=>d==='hard'?row.includes(fact.clue):row.includes(fact.name+' ' )||row.endsWith(fact.name))!}));
   if(rows.length!==3||rows.some(r=>!r.fact))throw new Error('Unrecognized history material');
   const ordered=[...rows].sort((a,b)=>a.fact.year-b.fact.year);
   const expected=f.id==='history-span'?String(ordered[2]!.fact.year-ordered[0]!.fact.year):f.id==='history-order'?ordered.map(r=>r.label).join(' → '):ordered[f.id==='history-first'?0:f.id==='history-last'?2:1]!.label;
   expect(p.correctAnswer).toBe(expected);
  }
 });
 it('keeps stage cursors independent across reloads, preserves v2 and does not log rejected issuance',async()=>{
  const kv=new MemoryKVStore();const texts:string[]=[];
  for(let i=0;i<20;i++){
   const p=await issuePractice(makeRepositories(kv),service(),'u','한국사','medium',undefined,'elementary');
   expect(texts.includes(p.prompt)).toBe(false);texts.push(p.prompt);
  }
  const repos=makeRepositories(kv);
  expect(practiceAvailability(await repos.learning.get('u'),'한국사','medium','middle').reduce((n,f)=>n+f.remaining,0)).toBe(10000);
  const old=await issuePractice(repos,service(),'u','공업수학');
  expect(old).toEqual(practiceProblem('공업수학','medium',practiceCatalog('공업수학','medium')[0]!.id,0));
  expect((await repos.learning.get('u')).mistakes).toEqual([]);
  const key=practiceProgressKey('한국사','medium','history-first','elementary');
  expect((await repos.learning.get('u')).practiceProgress![key]).toBe(4);
 });
 it('retains school metadata in wrong-answer events and Trap; neutral errors never become HIT',async()=>{
  const repos=makeRepositories(new MemoryKVStore()),ai=service();
  const p=await issuePractice(repos,ai,'u','한국사','medium',undefined,'high');
  const answer=p.options!.find(o=>o!==p.correctAnswer)!;
  const attempt:Attempt={id:'school-attempt',userId:'u',problemId:p.id,userAnswer:answer,confidence:'medium',createdAt:'2026-10-08T00:00:00.000Z'};
  const analysis=await ai.analyzeMistake({problem:p,attempt,relevantMemories:[]});if(!analysis.ok)throw new Error(analysis.error);
  await recordPractice(repos,p,attempt,analysis.value);await recordPractice(repos,p,attempt,analysis.value);
  const state=await repos.learning.get('u');expect(state.mistakes).toHaveLength(1);expect(state.mistakes[0]!.educationLevel).toBe('high');expect(state.dna).toEqual([]);
  const trap=await issueTrap(repos,ai,'u',{subject:'한국사',educationLevel:'high',targetErrorType:'concept_confusion',recentTopics:[],relevantMemories:[]});
  expect(trap.educationLevel).toBe('high');expect(trap.subject).toBe('한국사');
  const wrong=trap.options!.find(o=>o!==trap.correctAnswer)!;
  const result=await recordTrap(repos,trap,{...attempt,id:'school-trap',problemId:'school-trap-q',userAnswer:wrong});
  expect(result.predictionHit).toBe(false);expect(result.actualErrorType).toBe(undefined);
  expect((await repos.learning.get('u')).dna).toEqual([]);
 });
});
