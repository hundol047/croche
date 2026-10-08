const {test,expect}=require('@playwright/test');
const visible=l=>l.filter({visible:true}).first();
const stages=[['elementary','초등학교',['수학','국어','영어','과학','사회','한국사']],['middle','중학교',['수학','국어','영어','과학','사회','한국사']],['high','고등학교',['수학','국어','영어','통합과학','통합사회','한국사']],['csat','수능',['수학','국어','영어','물리학Ⅰ','사회·문화','한국사']],['university','대학교',['공업수학','일반물리','Python 프로그래밍']]];
async function fresh(page){
 await page.goto('/onboarding');await page.getByLabel('이름 입력').fill('단원 연습');await page.getByRole('button',{name:'초등학교',exact:true}).first().click();
 await visible(page.getByTestId('onboarding-start')).click();await expect(visible(page.getByText('아직 Error DNA가 없어요',{exact:true}))).toBeVisible();
 const id=await page.evaluate(()=>localStorage.getItem('ft:activeUser'));await page.goto('/practice');await visible(page.getByTestId('go-curriculum')).click();await expect(visible(page.getByText('11개 단원 · 자체 제작 22문항',{exact:true}))).toBeVisible();return id;
}
async function openFilters(page){const button=visible(page.getByRole('button',{name:'학습 범위 바꾸기',exact:true}));if(await button.count())await button.click();}
async function snapshot(page,id){return page.evaluate(id=>JSON.parse(localStorage.getItem(`ft:${id}:session`)),id);}
async function state(page,id){return page.evaluate(id=>JSON.parse(localStorage.getItem(`ft:${id}:learning`)),id);}
async function noOverflow(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);}
async function capture(page,name){
 await noOverflow(page);
 const el=await page.evaluateHandle(()=>[...document.querySelectorAll('div')].find(el=>el.clientHeight>0&&['auto','scroll'].includes(getComputedStyle(el).overflowY)&&el.scrollHeight>el.clientHeight+4)||null);
 const scroll=el.asElement();if(scroll)await scroll.evaluate(el=>{el.scrollTop=0;});
 await page.screenshot({path:test.info().outputPath(`${name}.png`),fullPage:true});
 if(scroll){await scroll.evaluate(el=>{el.scrollTop=el.scrollHeight;});await page.screenshot({path:test.info().outputPath(`${name}-end.png`),fullPage:true});}
 await el.dispose();
}
async function solve(page,id){
 await visible(page.getByLabel('답 입력',{exact:true})).waitFor();await expect(page.getByLabel('답 입력',{exact:true}).filter({visible:true})).toHaveCount(1);const p=(await snapshot(page,id)).currentProblem;
 if(p.answerType==='mcq')await visible(page.getByRole('button',{name:`보기 ${p.correctAnswer}`,exact:true})).click();else await visible(page.getByLabel('답 입력',{exact:true})).fill(p.correctAnswer);
 await visible(page.getByTestId('submit-answer')).click();await expect(visible(page.getByText('정답입니다!',{exact:true}))).toBeVisible();const next=await visible(page.getByRole('button',{name:'다음 단원 문제 고르기',exact:true})).boundingBox();expect(next.width).toBeLessThanOrEqual(560);expect(Math.abs(next.x+next.width/2-page.viewportSize().width/2)).toBeLessThan(2);return p;
}
let errors;
test.beforeEach(async({page})=>{errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});});
test.afterEach(async({},info)=>{await info.attach('browser-errors',{body:JSON.stringify(errors),contentType:'application/json'});expect(errors).toEqual([]);});
test('authored curriculum: all 27 supported courses, base/application keys, exhaustion and user records',async({page})=>{
 test.setTimeout(240000);const id=await fresh(page);
 for(const [key,label,subjects]of stages){
  await openFilters(page);await page.getByRole('button',{name:label,exact:true}).click();
  for(const subject of subjects){
   await openFilters(page);await page.getByRole('button',{name:subject,exact:true}).click();await page.getByRole('button',{name:'전체',exact:true}).click();
   const row=visible(page.getByRole('button',{name:/다음 문제$/}));const name=await row.getAttribute('aria-label');const prompts=[];
   for(let i=0;i<2;i++){
    await visible(page.getByRole('button',{name,exact:true})).click();await visible(page.getByLabel('답 입력',{exact:true})).waitFor();
    const p=(await snapshot(page,id)).currentProblem;expect(p.educationLevel).toBe(key);expect(p.subject).toBe(subject);expect(p.contentOrigin).toBe('curriculum-original');expect(p.id).toContain('curriculum-v1:');expect(p.difficulty).toBe(i?'hard':'easy');expect(prompts).not.toContain(p.prompt);prompts.push(p.prompt);
    await noOverflow(page);if(key==='csat'&&subject==='한국사'&&i===1){await page.reload();await visible(page.getByLabel('답 입력',{exact:true})).waitFor();await capture(page,'unit-history-solve');}
    await solve(page,id);await visible(page.getByRole('button',{name:'다음 단원 문제 고르기',exact:true})).click();
    await expect(visible(page.getByText('단원·기출',{exact:true}))).toBeVisible();
   }
   await expect(visible(page.getByRole('button',{name,exact:true}))).toHaveAttribute('aria-disabled','true');
   if(key==='elementary'&&subject==='수학')await capture(page,'curriculum-elementary');
   if(key==='csat'&&subject==='한국사')await capture(page,'curriculum-history');
  }
 }
 await page.reload();await noOverflow(page);
 const s=await state(page,id);expect(s.mistakes).toHaveLength(54);expect(s.mistakes.every(m=>m.isCorrect)).toBe(true);expect(s.dna).toEqual([]);expect(Object.values(s.curriculumProgress).every(n=>n===2)).toBe(true);
});
test('official source and expert review states are honest and navigable by keyboard',async({page})=>{
 await fresh(page);await page.getByRole('button',{name:'공식 기출',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(visible(page.getByText('실제 기출 0문항 수록',{exact:true}))).toBeVisible();await expect(visible(page.getByText(/공식 문제·확정 정답·이용 조건을 확인한 문항이 아직 없습니다/))).toBeVisible();
 await capture(page,'official-exams-empty');
 await page.getByRole('button',{name:'한국사 감수',exact:true}).focus();await page.keyboard.press('Space');
 await expect(visible(page.getByText('전문가 감수 미완료',{exact:true}))).toBeVisible();await expect(visible(page.getByText(/44개 사건의 연도·설명/))).toBeVisible();await capture(page,'history-review-pending');
 await page.getByRole('button',{name:'단원별 연습',exact:true}).click();await page.getByRole('button',{name:'5–6학년',exact:true}).click();await capture(page,'curriculum-grade-filter');
 await expect(visible(page.getByText('5개 단원 · 자체 제작 10문항',{exact:true}))).toBeVisible();
});
test('unit storage failure, same prepared question retry, ungradable DNA protection and reload idempotency',async({page})=>{
 const id=await fresh(page),row=visible(page.getByRole('button',{name:'수와 자릿값 다음 문제',exact:true}));
 await page.evaluate(()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.endsWith(':learning'))throw new DOMException('full','QuotaExceededError');return set.call(this,k,v);};window.restoreContentSave=()=>{Storage.prototype.setItem=set;};});
 const before=await state(page,id);await row.click();await expect(visible(page.getByText('문제를 준비하지 못했습니다. 저장 공간을 확인하고 다시 시도해주세요.',{exact:true}))).toBeVisible();expect(await state(page,id)).toEqual(before);
 await page.evaluate(()=>window.restoreContentSave());
 await page.evaluate(()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.endsWith(':session'))throw new DOMException('full','QuotaExceededError');return set.call(this,k,v);};window.restoreContentSession=()=>{Storage.prototype.setItem=set;};});
 await row.click();await expect(visible(page.getByText('문제 화면을 저장하지 못했습니다. 다시 시도하면 같은 문항을 엽니다.',{exact:true}))).toBeVisible();
 await expect(visible(page.getByRole('button',{name:'공식 기출',exact:true}))).toHaveAttribute('aria-disabled','true');
 const reserved=await state(page,id);expect(reserved.curriculumProgress['curriculum-v1:elementary-place']).toBe(1);
 await page.evaluate(()=>window.restoreContentSession());await visible(page.getByRole('button',{name:'다시 시도',exact:true})).click();await visible(page.getByLabel('답 입력',{exact:true})).waitFor();expect((await state(page,id)).curriculumProgress).toEqual(reserved.curriculumProgress);
 const p=(await snapshot(page,id)).currentProblem;expect(p.id).toBe('curriculum-v1:elementary-place:0');
 await visible(page.getByLabel('답 입력',{exact:true})).fill('(()=>342)()');await visible(page.getByTestId('submit-answer')).click();await expect(visible(page.getByText('판정 불가',{exact:true}))).toBeVisible();expect((await state(page,id)).dna).toEqual([]);expect((await state(page,id)).mistakes).toEqual([]);
 await page.reload();await visible(page.getByLabel('답 입력',{exact:true})).waitFor();await solve(page,id);await page.reload();await expect(visible(page.getByText('정답입니다!',{exact:true}))).toBeVisible();expect((await state(page,id)).mistakes).toHaveLength(1);expect((await state(page,id)).dna).toEqual([]);
 await page.goto('/curriculum');await visible(page.getByRole('button',{name:'수와 자릿값 다음 문제',exact:true})).click();await visible(page.getByLabel('답 입력',{exact:true})).waitFor();expect((await snapshot(page,id)).currentProblem.id).toBe('curriculum-v1:elementary-place:1');
});
test('reserved unit recovers after refresh and review tracks actual latest answers without consuming variants',async({page})=>{
 const id=await fresh(page);
 await page.evaluate(()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.endsWith(':session'))throw new DOMException('full','QuotaExceededError');return set.call(this,k,v);};});
 await visible(page.getByRole('button',{name:'수와 자릿값 다음 문제',exact:true})).click();
 await expect(visible(page.getByText('문제 화면을 저장하지 못했습니다. 다시 시도하면 같은 문항을 엽니다.',{exact:true}))).toBeVisible();
 const prepared=await state(page,id);expect(prepared.curriculumPending.problemId).toBe('curriculum-v1:elementary-place:0');
 await page.reload();await visible(page.getByRole('button',{name:'준비한 문제 이어 열기',exact:true})).click();
 await visible(page.getByLabel('답 입력',{exact:true})).waitFor();expect((await snapshot(page,id)).currentProblem.id).toBe(prepared.curriculumPending.problemId);
 expect((await state(page,id)).curriculumPending).toBeUndefined();expect((await state(page,id)).curriculumProgress).toEqual(prepared.curriculumProgress);
 await visible(page.getByLabel('답 입력',{exact:true})).fill('0');await visible(page.getByTestId('submit-answer')).click();
 await expect(visible(page.getByText('오답 · 함께 확인해봐요',{exact:true}))).toBeVisible();
 await visible(page.getByRole('button',{name:'이 단원 다시 연습하기',exact:true})).click();
 await expect(visible(page.getByText('풀이 1문항 · 마지막 풀이 정답 0문항',{exact:true}))).toBeVisible();
 await visible(page.getByRole('button',{name:'수와 자릿값 복습 문제 고르기',exact:true})).click();
 await visible(page.getByRole('button',{name:'기본 다시 풀기',exact:true})).click();await visible(page.getByLabel('답 입력',{exact:true})).waitFor();
 expect((await snapshot(page,id)).currentAttempt).toBeUndefined();await expect(visible(page.getByLabel('답 입력',{exact:true}))).toHaveValue('');
 await solve(page,id);await page.reload();await expect(visible(page.getByText('정답입니다!',{exact:true}))).toBeVisible();expect((await state(page,id)).mistakes).toHaveLength(2);await capture(page,'analysis-footer-polished');
 await visible(page.getByRole('button',{name:'다음 단원 문제 고르기',exact:true})).click();
 await expect(visible(page.getByText('풀이 1문항 · 마지막 풀이 정답 1문항',{exact:true}))).toBeVisible();await expect(page.getByRole('button',{name:'초등학교',exact:true})).toHaveCount(0);await expect(visible(page.getByRole('button',{name:'학습 범위 바꾸기',exact:true}))).toBeVisible();
 expect((await state(page,id)).curriculumProgress).toEqual(prepared.curriculumProgress);
 await visible(page.getByRole('button',{name:'수와 자릿값 다음 문제',exact:true})).click();await solve(page,id);
 await visible(page.getByRole('button',{name:'다음 단원 문제 고르기',exact:true})).click();
 await expect(visible(page.getByText('풀이 2문항 · 마지막 풀이 정답 2문항',{exact:true}))).toBeVisible();
 await visible(page.getByRole('button',{name:'수와 자릿값 복습 문제 고르기',exact:true})).click();await capture(page,'curriculum-review-polished');
 await visible(page.getByRole('button',{name:'응용 다시 풀기',exact:true})).click();await solve(page,id);
 expect((await state(page,id)).curriculumProgress['curriculum-v1:elementary-place']).toBe(2);expect((await state(page,id)).mistakes).toHaveLength(4);
});
test('partial session handoff survives acknowledgment failure and reload without another reservation',async({page})=>{
 const id=await fresh(page);
 await page.evaluate(()=>{const set=Storage.prototype.setItem;let writes=0;Storage.prototype.setItem=function(k,v){if(k.endsWith(':learning')&&++writes>1)throw new DOMException('full','QuotaExceededError');return set.call(this,k,v);};});
 await visible(page.getByRole('button',{name:'수와 자릿값 다음 문제',exact:true})).click();
 await expect(visible(page.getByText('문제 화면을 저장하지 못했습니다. 다시 시도하면 같은 문항을 엽니다.',{exact:true}))).toBeVisible();
 const prepared=await state(page,id),saved=await snapshot(page,id);expect(saved.currentProblem.id).toBe(prepared.curriculumPending.problemId);expect(saved.curriculumHandoffToken).toBe(prepared.curriculumPending.token);
 await capture(page,'curriculum-save-recovery');await page.reload();await capture(page,'curriculum-refresh-recovery');
 // The session was saved: a bookmarked solve route can be submitted before the handoff is acknowledged.
 await page.goto('/practice/solve');await solve(page,id);const submitted=(await snapshot(page,id)).currentAttempt;
 await visible(page.getByRole('button',{name:'다음 단원 문제 고르기',exact:true})).click();
 await visible(page.getByRole('button',{name:'준비한 문제 이어 열기',exact:true})).click();
 await expect(visible(page.getByText('정답입니다!',{exact:true}))).toBeVisible();
 expect((await snapshot(page,id)).currentAttempt.id).toBe(submitted.id);
 await page.reload();await expect(visible(page.getByText('정답입니다!',{exact:true}))).toBeVisible();
 const done=await state(page,id);expect(done.curriculumProgress).toEqual(prepared.curriculumProgress);expect(done.curriculumPending).toBeUndefined();expect(done.mistakes).toHaveLength(1);expect(done.dna).toEqual([]);
});
