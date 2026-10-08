const {test,expect}=require('@playwright/test');
const fs=require('node:fs/promises');
const visible=l=>l.filter({visible:true}).first();
async function fresh(page,stage='대학교'){
 await page.goto('/onboarding');await visible(page.getByLabel('이름 입력')).fill('기록 점검');await visible(page.getByRole('button',{name:stage,exact:true})).click();
 await visible(page.getByTestId('onboarding-start')).click();await expect(visible(page.getByText('아직 Error DNA가 없어요',{exact:true}))).toBeVisible();return page.evaluate(()=>localStorage.getItem('ft:activeUser'));
}
const learning=(page,id)=>page.evaluate(id=>JSON.parse(localStorage.getItem(`ft:${id}:learning`)),id);
const snapshot=(page,id)=>page.evaluate(id=>JSON.parse(localStorage.getItem(`ft:${id}:session`)),id);
async function bank(page){await page.goto('/practice');await visible(page.getByRole('button',{name:'1계 선형 미분방정식 문제 풀기',exact:true})).click();await visible(page.getByLabel('답 입력',{exact:true})).waitFor();}
async function answer(page,text,correct=true){await visible(page.getByLabel('답 입력',{exact:true})).fill(text);await visible(page.getByTestId('submit-answer')).click();await expect(visible(page.getByText(correct?'정답입니다!':'오답 · 함께 확인해봐요',{exact:true}))).toBeVisible();}
async function capture(page,name){
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 const h=await page.evaluateHandle(()=>[...document.querySelectorAll('div')].find(e=>e.clientHeight>0&&getComputedStyle(e).overflowY==='auto'&&e.scrollHeight>e.clientHeight+4)||null),el=h.asElement();
 if(el)await el.evaluate(e=>{e.scrollTop=0;});await page.screenshot({path:test.info().outputPath(name+'.png'),fullPage:true});
 if(el){await el.evaluate(e=>{e.scrollTop=e.scrollHeight;});await page.screenshot({path:test.info().outputPath(name+'-end.png'),fullPage:true});}await h.dispose();
}
let errors;
test.beforeEach(({page})=>{errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});});
test.afterEach(async()=>expect(errors).toEqual([]));
test('damaged learning is preserved, exported, restored and explicitly reset without another account changing',async({page})=>{
 const id=await fresh(page);await page.evaluate(id=>{
  const key=`ft:${id}:learning`;localStorage.setItem(key+':backup',JSON.stringify({dnaScopeVersion:2,dna:[],mistakes:[],traps:[],practiceProgress:{audit:7}}));localStorage.setItem(key,'{"mistakes":[');localStorage.setItem('ft:other:learning','not-your-record');
 },id);await page.reload();await expect(visible(page.getByText('저장된 기록이 손상되었습니다. 새 기록으로 덮어쓰지 않았습니다.',{exact:true}))).toBeVisible();
 await capture(page,'damaged-record-recovery');const download=page.waitForEvent('download');await visible(page.getByRole('button',{name:'손상 원본 내보내기',exact:true})).click();
 const file=await download, exported=await fs.readFile(await file.path(),'utf8');expect(JSON.parse(exported).raw).toBe('{"mistakes":[');expect(exported).not.toContain('not-your-record');
 expect(await page.evaluate(id=>localStorage.getItem(`ft:${id}:learning`),id)).toBe('{"mistakes":[');
 await visible(page.getByRole('button',{name:'이전 기록으로 복원',exact:true})).click();await expect(visible(page.getByText('오늘의 학습 상태',{exact:true}))).toBeVisible();expect((await learning(page,id)).practiceProgress.audit).toBe(7);
 await page.evaluate(id=>{localStorage.setItem(`ft:${id}:learning`,'broken-again');localStorage.removeItem(`ft:${id}:learning:backup`);},id);await page.reload();
 await visible(page.getByRole('button',{name:'이전 기록으로 복원',exact:true})).click();await expect(visible(page.getByText('복원할 이전 기록이 없습니다. 원본을 내보내 보관해주세요.',{exact:true}))).toBeVisible();
 await visible(page.getByRole('button',{name:'복원할 백업이 없는 경우',exact:true})).click();await visible(page.getByRole('button',{name:'원본 보존 후 빈 기록으로 시작',exact:true})).click();
 await expect(visible(page.getByText('오늘의 학습 상태',{exact:true}))).toBeVisible();expect((await learning(page,id)).mistakes).toEqual([]);
 expect(await page.evaluate(()=>localStorage.getItem('ft:other:learning'))).toBe('not-your-record');
 const archived=await page.evaluate(id=>Object.keys(localStorage).filter(k=>k.startsWith(`ft:${id}:learning:damaged:`)).map(k=>localStorage.getItem(k)),id);expect(archived).toContain('broken-again');
});
test('practice and Trap drafts survive reload, save failure and retry without premature learning events',async({page})=>{
 const id=await fresh(page);await bank(page);await visible(page.getByLabel('답 입력',{exact:true})).fill('3e^(-2x)');await visible(page.getByLabel('풀이 과정 입력',{exact:true})).fill('초기 조건을 대입했습니다.');await visible(page.getByRole('button',{name:'매우 확신',exact:true})).click();
 await expect(visible(page.getByText('입력 저장됨 · 제출 전에는 학습 기록에 반영되지 않습니다.',{exact:true}))).toBeVisible();expect((await learning(page,id))?.mistakes??[]).toEqual([]);
 await page.reload();await expect(visible(page.getByLabel('답 입력',{exact:true}))).toHaveValue('3e^(-2x)');await expect(visible(page.getByLabel('풀이 과정 입력',{exact:true}))).toHaveValue('초기 조건을 대입했습니다.');await expect(visible(page.getByRole('button',{name:'매우 확신',exact:true}))).toHaveAttribute('aria-pressed','true');
 await page.evaluate(()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.endsWith(':session'))throw new DOMException('full','QuotaExceededError');return set.call(this,k,v);};window.restoreDraftSave=()=>{Storage.prototype.setItem=set;};});
 await visible(page.getByLabel('답 입력',{exact:true})).fill('3*e^{-2*x}');await expect(visible(page.getByText('입력 저장 실패 · 이 화면에는 입력이 남아 있습니다.',{exact:true}))).toBeVisible();await capture(page,'draft-save-failure');
 await page.evaluate(()=>window.restoreDraftSave());await visible(page.getByRole('button',{name:'입력 저장 다시 시도',exact:true})).click();await expect(visible(page.getByText('입력 저장됨 · 제출 전에는 학습 기록에 반영되지 않습니다.',{exact:true}))).toBeVisible();
 await capture(page,'practice-draft-restored');await visible(page.getByTestId('submit-answer')).click();await expect(visible(page.getByText('정답입니다!',{exact:true}))).toBeVisible();expect((await learning(page,id)).mistakes).toHaveLength(1);expect((await learning(page,id)).dna).toEqual([]);
 await bank(page);await answer(page,'3e^(2x)',false);await page.goto('/trap');await visible(page.getByTestId('trap-start')).click();await visible(page.getByLabel('Trap 답 입력',{exact:true})).waitFor();const trap=(await snapshot(page,id)).currentTrap;
 await visible(page.getByLabel('Trap 답 입력',{exact:true})).fill(trap.correctAnswer);await visible(page.getByLabel('Trap 풀이 과정 입력',{exact:true})).fill('부호를 다시 확인했습니다.');await expect(visible(page.getByText('입력 저장됨 · 제출 전에는 학습 기록에 반영되지 않습니다.',{exact:true}))).toBeVisible();
 await page.reload();await expect(visible(page.getByLabel('Trap 답 입력',{exact:true}))).toHaveValue(trap.correctAnswer);await expect(visible(page.getByLabel('Trap 풀이 과정 입력',{exact:true}))).toHaveValue('부호를 다시 확인했습니다.');expect((await learning(page,id)).traps).toEqual([]);
 await capture(page,'trap-draft-restored');await visible(page.getByTestId('trap-submit')).click();await expect(visible(page.getByText('Trap 극복',{exact:true}))).toBeVisible();expect((await learning(page,id)).traps).toHaveLength(1);
});
test('coefficient-only error stays neutral, review finds original answer and correction consumes no new question',async({page})=>{
 const id=await fresh(page);await bank(page);await answer(page,'6e^(-2x)',false);await expect(visible(page.getByText('오답 원인 미확인 · Error DNA에는 반영하지 않았습니다.',{exact:true}))).toBeVisible();expect((await learning(page,id)).dna).toEqual([]);await capture(page,'neutral-coefficient-analysis');
 const before=(await learning(page,id)).practiceProgress;await page.goto('/review');await visible(page.getByLabel('복습 문제 검색',{exact:true})).fill('미분방정식');await expect(visible(page.getByText('1문제 · 반복 제출은 하나의 문항으로 표시합니다.',{exact:true}))).toBeVisible();
 await visible(page.getByRole('button',{name:'공업수학 · 1계 선형 미분방정식',exact:true})).click();await expect(visible(page.getByText('6e^(-2x)',{exact:true}))).toBeVisible();await capture(page,'review-question-detail');
 await visible(page.getByRole('button',{name:'이 문제 다시 풀기',exact:true})).click();await expect(visible(page.getByLabel('답 입력',{exact:true}))).toHaveValue('');await answer(page,'3e^(-2x)');await visible(page.getByRole('button',{name:'복습 목록으로',exact:true})).click();
 await expect(visible(page.getByText('0문제 · 반복 제출은 하나의 문항으로 표시합니다.',{exact:true}))).toBeVisible();await visible(page.getByRole('button',{name:'전체 풀이',exact:true})).click();await expect(visible(page.getByText('1문제 · 반복 제출은 하나의 문항으로 표시합니다.',{exact:true}))).toBeVisible();await capture(page,'review-list-corrected');
 const after=await learning(page,id);expect(after.mistakes).toHaveLength(2);expect(after.dna).toEqual([]);expect(after.practiceProgress).toEqual(before);
 const download=page.waitForEvent('download');await visible(page.getByRole('button',{name:'학습 기록 내보내기',exact:true})).click();const file=await download;const bundle=JSON.parse(await fs.readFile(await file.path(),'utf8'));expect(bundle.profile.userId).toBe(id);expect(bundle.learning.mistakes).toHaveLength(2);
});
test('DNA scopes separate subjects and school stages while historical combined score stays unchanged',async({page})=>{
 const id=await fresh(page);await page.evaluate(id=>{const at=new Date().toISOString();localStorage.setItem(`ft:${id}:learning`,JSON.stringify({dna:[{userId:id,subject:'공업수학',topic:'과거 통합',errorType:'sign_error',errorDescription:'합성 이전 기록',evidence:[],occurrenceCount:2,recentOccurrence:at,severity:3,confidence:0.7,score:40,improvementScore:0,lastUpdated:at}],mistakes:[],traps:[]}));},id);
 await page.goto('/prediction');await expect(visible(page.getByText('아직 예측할 기록이 없어요. 문제를 풀면 실수 패턴을 확인할 수 있습니다.',{exact:true}))).toBeVisible();
 const scopes=[['공업수학','university'],['일반물리','university'],['수학','high'],['수학','middle']];
 async function problem(subject,educationLevel){await page.evaluate(({id,subject,educationLevel})=>localStorage.setItem(`ft:${id}:session`,JSON.stringify({currentProblem:{id:`scope:${educationLevel}:${subject}`,educationLevel,subject,topic:'부호 비교',prompt:'브라우저 검증용 자체 수식: 3e^(-2x)를 입력하세요.',answerType:'text',correctAnswer:'3e^{-2x}',explanation:'계수는 3이고 x의 계수는 -2입니다.',difficulty:'easy',source:'bank',targetErrorType:'sign_error'}})),{id,subject,educationLevel});await page.goto('/practice/solve');}
 for(const [s,l]of scopes){await problem(s,l);await answer(page,'3e^(2x)',false);}
 await problem('공업수학','university');await answer(page,'3e^(-2x)');const state=await learning(page,id);expect(state.dna).toHaveLength(5);expect(state.dna.find(e=>e.legacyAggregate).score).toBe(40);
 const score=(s,l)=>state.dna.find(e=>!e.legacyAggregate&&e.subject===s&&(e.educationLevel??'university')===l).score;expect(score('공업수학','university')).toBe(8);for(const [s,l]of scopes.slice(1))expect(score(s,l)).toBe(17);
 await page.goto('/');await expect(visible(page.getByText('기존 통합 기록 · 과목별 재분류 전',{exact:true}))).toBeVisible();await capture(page,'scoped-dna-records');
 await page.goto('/prediction');await expect(visible(page.getByText('일반물리 · 대학교',{exact:true}))).toBeVisible();
 await visible(page.getByRole('button',{name:'이 유형 훈련하기',exact:true})).click();expect(new URL(page.url()).searchParams.get('subject')).toBe('일반물리');expect(new URL(page.url()).searchParams.get('educationLevel')).toBe('university');
 await visible(page.getByTestId('trap-start')).click();await visible(page.getByLabel('Trap 답 입력',{exact:true})).waitFor();expect((await snapshot(page,id)).currentTrap.subject).toBe('일반물리');
 await visible(page.getByLabel('Trap 답 입력',{exact:true})).fill('6');await visible(page.getByTestId('trap-submit')).click();await expect(visible(page.getByText('예측 적중 (Prediction HIT)',{exact:true}))).toBeVisible();
 await page.reload();await expect(visible(page.getByText('예측 적중 (Prediction HIT)',{exact:true}))).toBeVisible();const afterTrap=await learning(page,id);expect(afterTrap.traps).toHaveLength(1);expect(afterTrap.dna.find(e=>!e.legacyAggregate&&e.subject==='일반물리').score).toBe(32);expect(afterTrap.dna.find(e=>!e.legacyAggregate&&e.subject==='공업수학').score).toBe(8);expect(afterTrap.dna.find(e=>e.legacyAggregate).score).toBe(40);
});
test('new authored data and long-reading questions have valid answers and layouts',async({page})=>{
 const id=await fresh(page,'초등학교');await page.goto('/curriculum');const row=()=>visible(page.getByRole('button',{name:'표의 합계와 비교 다음 문제',exact:true}));
 await row().click();await answer(page,'63');await visible(page.getByRole('button',{name:'다음 단원 문제 고르기',exact:true})).click();await row().click();await capture(page,'supplement-data-fraction');await answer(page,'2/3');expect((await learning(page,id)).dna).toEqual([]);
 await visible(page.getByRole('button',{name:'다음 단원 문제 고르기',exact:true})).click();await visible(page.getByRole('button',{name:'학습 범위 바꾸기',exact:true})).click();await visible(page.getByRole('button',{name:'고등학교',exact:true})).click();await visible(page.getByRole('button',{name:'영어',exact:true})).click();
 await visible(page.getByRole('button',{name:'장문 독해와 조사 해석 다음 문제',exact:true})).click();await visible(page.getByLabel('답 입력',{exact:true})).waitFor();const p=(await snapshot(page,id)).currentProblem;expect(p.prompt.length).toBeGreaterThan(1000);
 await capture(page,'supplement-long-reading');await visible(page.getByRole('button',{name:`보기 ${p.correctAnswer}`,exact:true})).click();await visible(page.getByTestId('submit-answer')).click();await expect(visible(page.getByText('정답입니다!',{exact:true}))).toBeVisible();
});
