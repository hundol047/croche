const {test,expect}=require('@playwright/test');
const stages=[
 {key:'elementary',label:'초등학교',subjects:['수학','국어','영어','과학','사회','한국사']},
 {key:'middle',label:'중학교',subjects:['수학','국어','영어','과학','사회','한국사']},
 {key:'high',label:'고등학교',subjects:['수학','국어','영어','통합과학','통합사회','한국사']},
 {key:'csat',label:'수능',subjects:['수학','국어','영어','물리학Ⅰ','사회·문화','한국사']},
];
const visible=(locator)=>locator.filter({visible:true}).first();
async function noOverflow(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);}
async function capture(page,name){
 await noOverflow(page);
 const handle=await page.evaluateHandle(()=>[...document.querySelectorAll('div')].find(el=>el.getBoundingClientRect().height>0&&['auto','scroll'].includes(getComputedStyle(el).overflowY)&&el.scrollHeight>el.clientHeight+4)||null);
 const scroll=handle.asElement();if(scroll)await scroll.evaluate(el=>{el.scrollTop=0;});
 await page.screenshot({path:test.info().outputPath(`${name}.png`),fullPage:true});
 if(scroll){await scroll.evaluate(el=>{el.scrollTop=el.scrollHeight;});await page.screenshot({path:test.info().outputPath(`${name}-end.png`),fullPage:true});}
 await handle.dispose();
}
async function fresh(page,stage){
 await page.goto('/onboarding');
 await page.getByLabel('이름 입력').fill('역사 공부');
 await page.getByRole('button',{name:stage.label,exact:true}).first().click();
 await page.getByRole('button',{name:'수학',exact:true}).click();
 await page.getByRole('button',{name:'한국사',exact:true}).click();
 await capture(page,`school-onboarding-${stage.key}`);
 await visible(page.getByTestId('onboarding-start')).click();
 await expect(visible(page.getByText('아직 Error DNA가 없어요',{exact:true}))).toBeVisible();
 const id=await page.evaluate(()=>localStorage.getItem('ft:activeUser'));
 const profile=await page.evaluate(id=>JSON.parse(localStorage.getItem(`ft:profile:${id}`)),id);
 expect(profile.educationLevel).toBe(stage.key);expect(profile.interests).toEqual(['한국사']);
 await visible(page.getByTestId('go-practice')).click();
 await expect(visible(page.getByTestId('generate-problem'))).toBeEnabled();
 return id;
}
async function snapshot(page,id){return page.evaluate(id=>JSON.parse(localStorage.getItem(`ft:${id}:session`)),id);}
async function state(page,id){return page.evaluate(id=>JSON.parse(localStorage.getItem(`ft:${id}:learning`)),id);}
async function solve(page,id){
 await page.getByLabel('답 입력',{exact:true}).waitFor();
 const p=(await snapshot(page,id)).currentProblem;
 if(p.answerType==='mcq')await visible(page.getByRole('button',{name:`보기 ${p.correctAnswer}`,exact:true})).click();
 else await page.getByLabel('답 입력',{exact:true}).fill(p.correctAnswer);
 await visible(page.getByTestId('submit-answer')).click();
 await expect(visible(page.getByText('정답입니다!',{exact:true}))).toBeVisible();
 return p;
}
let errors;
test.beforeEach(async({page})=>{errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});});
test.afterEach(async({page},info)=>{await info.attach('browser-errors',{body:JSON.stringify(errors),contentType:'application/json'});expect(errors).toEqual([]);});
for(const stage of stages)test(`${stage.label}: all six subjects and three difficulties, choices, profile and reload`,async({page})=>{
 test.setTimeout(120000);
 const id=await fresh(page,stage);
 await capture(page,`school-practice-${stage.key}`);
 for(const subject of stage.subjects)for(const [i,label] of ['쉬움','보통','어려움'].entries()){
  await page.goto('/practice');
  await page.getByRole('button',{name:subject,exact:true}).click();
  await page.getByRole('button',{name:label,exact:true}).click();
  await expect(visible(page.getByText(`${stage.label} ${subject} 30,000개 · 난이도별 10,000개`,{exact:true}))).toBeVisible();
  await visible(page.getByTestId('generate-problem')).click();
  await page.getByLabel('답 입력',{exact:true}).waitFor();
  const p=(await snapshot(page,id)).currentProblem;
  expect(p.educationLevel).toBe(stage.key);expect(p.subject).toBe(subject);expect(p.difficulty).toBe(['easy','medium','hard'][i]);
  expect(p.id).toContain(`practice:school-v1:${stage.key}:`);
  if(stage.key==='csat')expect(p.contentOrigin).toBe('original-csat');
  if(subject==='한국사'&&i===2){await page.reload();await page.getByLabel('답 입력',{exact:true}).waitFor();await capture(page,`history-${stage.key}-hard`);}
  await noOverflow(page);
  await solve(page,id);
 }
 await page.reload();await expect(visible(page.getByText('정답입니다!',{exact:true}))).toBeVisible();
 const s=await state(page,id);expect(s.mistakes).toHaveLength(18);expect(s.mistakes.every(m=>m.isCorrect&&m.educationLevel===stage.key)).toBe(true);expect(s.dna).toEqual([]);
 await page.goto('/practice');
 await expect(visible(page.getByRole('button',{name:'한국사',exact:true}))).toHaveAttribute('aria-pressed','true');
 await expect(visible(page.getByRole('button',{name:'어려움',exact:true}))).toHaveAttribute('aria-pressed','true');
});
test('history variation, durable exhaustion, failed reservation and neutral school Trap',async({page})=>{
 test.setTimeout(120000);
 const id=await fresh(page,stages[2]);const prompts=[];
 await page.getByRole('button',{name:'보통',exact:true}).click();
 for(let i=0;i<7;i++){
  await visible(page.getByTestId('generate-problem')).click();await page.getByLabel('답 입력',{exact:true}).waitFor();
  const p=(await snapshot(page,id)).currentProblem;expect(prompts).not.toContain(p.prompt);prompts.push(p.prompt);
  if(i===0){await page.reload();await page.getByLabel('답 입력',{exact:true}).waitFor();}
  await solve(page,id);await page.goto('/practice');
 }
 // Force the actual durable write to fail before issuance, then restore and retry.
 await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key.endsWith(':learning'))throw new DOMException('full','QuotaExceededError');return original.call(this,key,value);};window.restoreSchoolSave=()=>{Storage.prototype.setItem=original;};});
 const before=await state(page,id);
 await visible(page.getByTestId('generate-problem')).click();
 await expect(visible(page.getByText('문제를 불러오지 못했어요.',{exact:true}))).toBeVisible();
 expect(await state(page,id)).toEqual(before);
 await page.evaluate(()=>window.restoreSchoolSave());
 await visible(page.getByRole('button',{name:'다시 시도',exact:true})).click();
 await page.getByLabel('답 입력',{exact:true}).waitFor();
 const p=(await snapshot(page,id)).currentProblem;
 const wrong=p.options.find(o=>o!==p.correctAnswer);
 await visible(page.getByRole('button',{name:`보기 ${wrong}`,exact:true})).click();
 await visible(page.getByTestId('submit-answer')).click();
 await expect(visible(page.getByText('오답 · 함께 확인해봐요',{exact:true}))).toBeVisible();
 expect((await state(page,id)).dna).toEqual([]);
 // An unsupported wrong answer establishes no weakness. Seed a clearly synthetic, scoped fixture to verify school Trap neutrality separately.
 await page.evaluate(id=>{const key=`ft:${id}:learning`,s=JSON.parse(localStorage.getItem(key)),at=new Date().toISOString();s.dnaScopeVersion=2;s.dna=[{userId:id,educationLevel:'high',subject:'한국사',topic:'연표',errorType:'concept_confusion',errorDescription:'브라우저 검증용 합성 기록',evidence:[],occurrenceCount:1,recentOccurrence:at,severity:3,confidence:0.7,score:17,improvementScore:0,lastUpdated:at}];localStorage.setItem(key,JSON.stringify(s));},id);
 await page.goto('/trap');
 await visible(page.getByTestId('trap-start')).click();
 await page.getByLabel('Trap 답 입력',{exact:true}).waitFor();
 const trap=(await snapshot(page,id)).currentTrap;expect(trap.educationLevel).toBe('high');expect(trap.subject).toBe('한국사');
 const trapWrong=trap.options.find(o=>o!==trap.correctAnswer);
 await visible(page.getByRole('button',{name:`보기 ${trapWrong}`,exact:true})).click();
 await visible(page.getByTestId('trap-submit')).click();
 await expect(visible(page.getByText('함께 교정해봐요',{exact:true}))).toBeVisible();
 const after=await state(page,id);expect(after.traps.at(-1).predictionHit).toBe(false);expect(after.dna[0].occurrenceCount).toBe(1);
 await capture(page,'history-trap-neutral');
 await page.goto('/practice');
 await page.evaluate(id=>{const key=`ft:${id}:learning`,s=JSON.parse(localStorage.getItem(key));for(const f of ['first','last','order','span','middle'])s.practiceProgress[`school-v1:high:한국사:medium:history-${f}`]=2000;localStorage.setItem(key,JSON.stringify(s));},id);
 await page.reload();
 await expect(visible(page.getByTestId('generate-problem'))).toHaveAttribute('aria-disabled','true');
 await expect(visible(page.getByText('보통 · 남은 0 / 10,000개',{exact:true}))).toBeVisible();
 await capture(page,'history-exhausted');
 await page.getByRole('button',{name:'쉬움',exact:true}).click();
 await expect(visible(page.getByTestId('generate-problem'))).toBeEnabled();
});
