const { test, expect } = require('@playwright/test');

const problems = [
  { subject: '공업수학', topic: '급수의 수렴구간', answer: ' [-1, 1) ', generated: ' [-1, 1] ' },
  { subject: '일반물리', topic: '등가속도 운동', answer: '25.00', generated: '24.0' },
  { subject: 'Python 프로그래밍', topic: '반복문 경계', answer: '1e1', generated: '18.00' },
];

async function learning(page, userId = 'demo-user') {
  return page.evaluate((id) => JSON.parse(localStorage.getItem(`ft:${id}:learning`)), userId);
}
async function noOverflow(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
  // Check rendered SVG charts against their actual card content, not viewport estimates.
  const charts = await page.locator('svg').evaluateAll((svgs) => svgs.filter((s) => s.querySelector('polyline')).map((s) => {
    const a = s.getBoundingClientRect(); const b = s.parentElement.parentElement.getBoundingClientRect();
    return { width: a.width, fits: a.left >= b.left - 1 && a.right <= b.right + 1 };
  }));
  for (const chart of charts) { expect(chart.width).toBeGreaterThan(0); expect(chart.fits).toBe(true); }
}
async function capture(page, name) {
  await noOverflow(page);
  if (name === 'trap-hit' || name === 'trap-overcome') {
    const title = name === 'trap-hit' ? '예측 적중 (Prediction HIT)' : 'Trap 극복';
    // Capture the settled result, not an intermediate frame of its brief fade.
    await expect(page.getByText(title, { exact: true }).filter({ visible: true }).locator('..')).toHaveCSS('opacity', '1');
  }
  // RN ScrollView scrolls within the viewport. Capture its end as well so
  // presenter screenshots do not conceal feedback or actions below the fold.
  const handle = await page.evaluateHandle(() => [...document.querySelectorAll('div')].find((el) =>
    el.getBoundingClientRect().height > 0 && ['auto', 'scroll'].includes(getComputedStyle(el).overflowY) &&
    el.scrollHeight > el.clientHeight + 4) || null);
  const scroll = handle.asElement();
  if (scroll) await scroll.evaluate((el) => { el.scrollTop = 0; });
  await page.screenshot({ path: test.info().outputPath(`${name}.png`), fullPage: true });
  if (scroll) {
    await scroll.evaluate((el) => { el.scrollTop = el.scrollHeight; });
    await page.screenshot({ path: test.info().outputPath(`${name}-end.png`), fullPage: true });
    await scroll.evaluate((el) => { el.scrollTop = 0; });
  }
  await handle.dispose();
}
async function reloadWith(page, text) {
  await expect(page.getByText(text, { exact: true }).filter({ visible: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText(text, { exact: true }).filter({ visible: true }).first()).toBeVisible();
  await noOverflow(page);
}
async function demo(page) {
  await page.goto('/onboarding');
  await expect(page.getByTestId('onboarding-demo').filter({ visible: true })).toBeVisible();
  await noOverflow(page);
  await capture(page, 'onboarding');
  await page.getByTestId('onboarding-demo').filter({ visible: true }).click();
  await expect(page.getByTestId('go-practice').filter({ visible: true })).toBeVisible();
}

let errors;
let warnings;
test.beforeEach(async ({ page }) => {
  errors = [];
  warnings = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
    if (m.type() === 'warning') warnings.push(m.text());
  });
});
test.afterEach(async ({ page }, info) => {
  await info.attach('browser-console', { body: JSON.stringify({ errors, warnings }, null, 2), contentType: 'application/json' });
  await page.screenshot({ path: info.outputPath('screen.png'), fullPage: true });
  expect(errors).toEqual([]);
  // SDK 51's React Navigation 6 passes the deprecated pointerEvents prop.
  // Record the upstream warning; any new warning is a regression.
  expect(warnings.filter((w) => w !== 'props.pointerEvents is deprecated. Use style.pointerEvents')).toEqual([]);
});

test('fresh profile stays empty; bank and generated problems work in every subject', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('onboarding-start').filter({ visible: true })).toHaveAttribute('aria-disabled', 'true');
  await page.getByLabel('이름 입력').fill('수진');
  await page.getByRole('button', { name: '코딩', exact: true }).click();
  await page.getByRole('button', { name: 'Python 프로그래밍', exact: true }).click();
  await page.getByTestId('onboarding-start').filter({ visible: true }).click();
  await expect(page.getByText('아직 Error DNA가 없어요', { exact: true }).filter({ visible: true })).toBeVisible();
  await noOverflow(page);
  const userId = await page.evaluate(() => localStorage.getItem('ft:activeUser'));
  await page.goto('/report');
  await expect(page.getByText('아직 학습 기록이 없어요', { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText('W1', { exact: true }).filter({ visible: true })).toHaveCount(0);
  await page.getByRole('button', { name: '첫 문제 풀기', exact: true }).click();

  for (const p of problems) {
    await page.getByRole('button', { name: p.subject, exact: true }).click();
    await page.getByRole('button', { name: `${p.topic} 문제 풀기`, exact: true }).click();
    await reloadWith(page, '문제');
    await expect(page.getByTestId('submit-answer').filter({ visible: true })).toHaveAttribute('aria-disabled', 'true');
    await page.getByLabel('답 입력', { exact: true }).fill(p.answer);
    await page.getByLabel('풀이 과정 입력', { exact: true }).fill('조건을 확인하고 검산했어요.');
    await page.getByRole('button', { name: '매우 확신', exact: true }).click();
    await page.getByTestId('submit-answer').filter({ visible: true }).click();
    await expect(page.getByText('정답입니다!', { exact: true }).filter({ visible: true })).toBeVisible();
    await reloadWith(page, '정답입니다!');
    await page.getByRole('button', { name: '홈으로', exact: true }).click();
    await page.getByTestId('go-practice').filter({ visible: true }).click();
    await page.getByRole('button', { name: p.subject, exact: true }).click();
    await page.getByTestId('generate-problem').filter({ visible: true }).click();
    await page.getByLabel('답 입력', { exact: true }).fill(p.generated);
    await page.getByTestId('submit-answer').filter({ visible: true }).click();
    await expect(page.getByText('정답입니다!', { exact: true }).filter({ visible: true })).toBeVisible();
    await page.getByRole('button', { name: '홈으로', exact: true }).click();
    await page.getByTestId('go-practice').filter({ visible: true }).click();
  }
  // Multi-select accepts case and order differences.
  await page.getByRole('button', { name: 'Python 프로그래밍', exact: true }).click();
  await page.getByRole('button', { name: '리스트 vs 튜플 문제 풀기', exact: true }).click();
  await page.getByLabel('답 입력', { exact: true }).fill(' STR, TUPLE ');
  await page.getByTestId('submit-answer').filter({ visible: true }).click();
  await expect(page.getByText('정답입니다!', { exact: true }).filter({ visible: true })).toBeVisible();
  const state = await learning(page, userId);
  expect(state.dna).toEqual([]);
  expect(state.mistakes).toHaveLength(7);
  await page.goto('/');
  await page.getByTestId('switch-profile').filter({ visible: true }).click();
  await page.getByTestId('onboarding-demo').filter({ visible: true }).click();
  await page.getByTestId('reset-demo').filter({ visible: true }).click();
  await expect.poll(async () => (await learning(page)).dna[0].score).toBe(83);
  expect((await learning(page, userId)).mistakes).toHaveLength(7);
});

test('judge loop: one analysis, HIT, new trap, correction, report and reload persistence', async ({ page }) => {
  await demo(page);
  await reloadWith(page, '오늘의 학습 상태');
  await capture(page, 'dashboard');
  await page.getByTestId('go-practice').filter({ visible: true }).click();
  await capture(page, 'practice');
  await page.getByRole('button', { name: '약분과 정의역 문제 풀기', exact: true }).click();
  await capture(page, 'solve');
  await page.getByLabel('답 입력', { exact: true }).fill('2');
  await page.getByLabel('풀이 과정 입력', { exact: true }).fill('x+1로 약분하고 x=1을 대입했어요.');
  await page.getByTestId('submit-answer').filter({ visible: true }).click();
  await expect(page.getByText('83 → 100', { exact: true }).filter({ visible: true })).toBeVisible();
  await page.waitForTimeout(1000); // catch the prior effect-driven infinite analysis loop
  expect((await learning(page)).mistakes).toHaveLength(1);
  await reloadWith(page, 'Error DNA 변화');
  expect((await learning(page)).mistakes).toHaveLength(1);
  await capture(page, 'analysis');
  await page.getByRole('button', { name: '다음 실수 예측 보기', exact: true }).click();
  await reloadWith(page, '예상 실수 위험도');
  await capture(page, 'prediction');
  await page.getByRole('button', { name: '이 유형 훈련하기', exact: true }).click();
  await capture(page, 'trap-intro');
  await page.getByTestId('trap-start').filter({ visible: true }).click();
  await expect(page.getByText('ln(x-2) + ln(5-x)', { exact: false }).filter({ visible: true })).toBeVisible();
  await reloadWith(page, '타깃: 조건 누락');
  await page.getByLabel('Trap 답 입력', { exact: true }).fill('[2,5]');
  await page.getByTestId('trap-submit').filter({ visible: true }).click();
  await expect(page.getByText('예측 적중 (Prediction HIT)', { exact: true }).filter({ visible: true })).toBeVisible();
  await reloadWith(page, '예측 적중 (Prediction HIT)');
  await capture(page, 'trap-hit');
  expect((await learning(page)).traps).toHaveLength(1);
  await page.getByRole('button', { name: '다시 도전', exact: true }).click();
  await expect(page.getByText('√(9-x²)', { exact: false }).filter({ visible: true })).toBeVisible();
  await page.getByLabel('Trap 답 입력', { exact: true }).fill('[-3,3]');
  await page.getByTestId('trap-submit').filter({ visible: true }).click();
  await expect(page.getByText('Trap 극복', { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText('조건 누락 100 → 91', { exact: true }).filter({ visible: true })).toBeVisible();
  await capture(page, 'trap-overcome');
  await page.getByRole('button', { name: '학습 리포트 보기', exact: true }).click();
  await expect(page.getByText('50%', { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText('1회', { exact: true }).filter({ visible: true })).toBeVisible();
  await reloadWith(page, '학습 리포트');
  const state = await learning(page);
  expect(state.dna.find((d) => d.errorType === 'condition_omission').score).toBe(91);
  expect(state.traps).toHaveLength(2);
  expect(state.traps.map((t) => t.predictionHit)).toEqual([true, false]);
  await noOverflow(page);
  await capture(page, 'report');
});

test('uncertain wrong Trap gives neutral feedback and does not invent a DNA change', async ({ page }) => {
  await demo(page);
  await page.getByTestId('go-trap').filter({ visible: true }).click();
  await page.getByTestId('trap-start').filter({ visible: true }).click();
  await page.getByLabel('Trap 답 입력', { exact: true }).fill('999');
  await page.getByTestId('trap-submit').filter({ visible: true }).click();
  await expect(page.getByText('함께 교정해봐요', { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText('예측 적중 (Prediction HIT)', { exact: true }).filter({ visible: true })).toHaveCount(0);
  await expect(page.getByText('Error DNA 변화', { exact: true }).filter({ visible: true })).toHaveCount(0);
  expect((await learning(page)).dna[0].score).toBe(83);
  expect((await learning(page)).traps[0].predictionHit).toBe(false);
});

test('empty deep routes recover and unauthenticated routes return to onboarding', async ({ page }) => {
  await page.goto('/analysis');
  await expect(page.getByTestId('onboarding-demo').filter({ visible: true })).toBeVisible();
  await page.getByTestId('onboarding-demo').filter({ visible: true }).click();
  await page.goto('/practice/solve');
  await expect(page.getByText('문제를 불러오지 못했어요.', { exact: true }).filter({ visible: true })).toBeVisible();
  await page.getByRole('button', { name: '돌아가기', exact: true }).click();
  await expect(page.getByTestId('generate-problem').filter({ visible: true })).toBeVisible();
  await page.goto('/analysis');
  await expect(page.getByText('풀이 기록이 없어요', { exact: true }).filter({ visible: true })).toBeVisible();
  await page.getByRole('button', { name: '홈으로', exact: true }).click();
  await expect(page.getByTestId('go-practice').filter({ visible: true })).toBeVisible();
});

test('blocked storage and a failed analysis save offer recovery without duplicate events', async ({ page }) => {
  await page.addInitScript(() => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('Storage blocked'); } });
    window.restoreFailtwinStorage = () => Object.defineProperty(window, 'localStorage', descriptor);
  });
  await page.goto('/');
  await expect(page.getByText('학습 기록을 불러오지 못했어요.', { exact: false })).toBeVisible();
  await page.evaluate(() => window.restoreFailtwinStorage());
  await page.getByRole('button', { name: '다시 시도', exact: true }).click();
  await page.getByTestId('onboarding-demo').filter({ visible: true }).click();
  await page.getByTestId('go-practice').filter({ visible: true }).click();
  await page.getByRole('button', { name: '약분과 정의역 문제 풀기', exact: true }).click();
  await page.getByLabel('답 입력', { exact: true }).fill('2');
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    let failOnce = true;
    Storage.prototype.setItem = function (key, value) {
      if (failOnce && key === 'ft:demo-user:learning') { failOnce = false; throw new Error('Storage full'); }
      return original.call(this, key, value);
    };
  });
  await page.getByTestId('submit-answer').filter({ visible: true }).click();
  await expect(page.getByText('분석이나 저장에 실패했어요.', { exact: false })).toBeVisible();
  expect((await learning(page)).mistakes).toHaveLength(0);
  expect((await learning(page)).dna[0].score).toBe(83);
  await page.getByRole('button', { name: '다시 시도', exact: true }).click();
  await expect(page.getByText('83 → 100', { exact: true }).filter({ visible: true })).toBeVisible();
  expect((await learning(page)).mistakes).toHaveLength(1);
});

test('equivalent exponential answer is correct; ungradable input never creates DNA or events', async ({ page }) => {
  await demo(page);
  const before = (await learning(page)).dna;
  await page.getByTestId('go-practice').filter({ visible: true }).click();
  await page.getByRole('button', { name: '1계 선형 미분방정식 문제 풀기', exact: true }).click();
  for (const answer of ['3e^(-2x)+0', '3e^(-2x);globalThis.attack=true']) {
    await page.getByLabel('답 입력', { exact: true }).fill(answer);
    await page.getByTestId('submit-answer').filter({ visible: true }).click();
    await expect(page.getByText('판정 불가', { exact: true }).filter({ visible: true })).toBeVisible();
    expect((await learning(page)).mistakes).toHaveLength(0);
    expect((await learning(page)).dna).toEqual(before);
  }
  expect(await page.evaluate(() => window.attack)).toBe(undefined);
  await capture(page, 'ungradable-practice');
  await page.reload();
  await page.getByLabel('답 입력', { exact: true }).fill('3e^(-2x)');
  await page.getByTestId('submit-answer').filter({ visible: true }).click();
  await reloadWith(page, '정답입니다!');
  expect((await learning(page)).mistakes).toHaveLength(1);
  expect((await learning(page)).dna).toEqual(before);
  await capture(page, 'equivalent-answer');
});

test('new questions vary by type and survive reload in all three subjects', async ({ page }) => {
  await demo(page);
  const cases = [
    { subject: '공업수학', answers: ['[-1,1]', '3e^(-2x)', '정의되지 않음'] },
    { subject: '일반물리', answers: ['24', '9', '10'] },
    { subject: 'Python 프로그래밍', answers: ['18', '5', '4'] },
  ];
  for (const item of cases) {
    const prompts = [];
    for (const answer of item.answers) {
      await page.goto('/practice');
      await page.getByRole('button', { name: item.subject, exact: true }).click();
      await page.getByTestId('generate-problem').filter({ visible: true }).click();
      await page.getByLabel('답 입력', { exact: true }).waitFor();
      const prompt = await page.evaluate(() => JSON.parse(localStorage.getItem('ft:demo-user:session')).currentProblem.prompt);
      expect(prompts.includes(prompt)).toBe(false); prompts.push(prompt);
      await page.reload();
      await page.getByLabel('답 입력', { exact: true }).fill(answer);
      await page.getByTestId('submit-answer').filter({ visible: true }).click();
      await expect(page.getByText('정답입니다!', { exact: true }).filter({ visible: true })).toBeVisible();
    }
  }
  const state = await learning(page);
  expect(Object.values(state.practiceProgress).reduce((n, value) => n + value, 0)).toBe(9);
  expect(state.mistakes).toHaveLength(9);
});

test('last bank variant, exhaustion, reload and other difficulties remain consistent', async ({ page }) => {
  await demo(page);
  // Fixture represents 9,999 previously opened variants; exercise the real final issuance.
  await page.evaluate(() => {
    const key = 'ft:demo-user:learning'; const state = JSON.parse(localStorage.getItem(key));
    state.practiceProgress = Object.fromEntries(['series', 'ode', 'domain', 'product', 'system'].map(id => [`v2:공업수학:medium:${id}`, id === 'system' ? 1999 : 2000]));
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page.goto('/practice');
  await expect(page.getByText('보통 · 남은 1 / 10,000개', { exact: true }).filter({ visible: true })).toBeVisible();
  await page.getByTestId('generate-problem').filter({ visible: true }).click();
  await page.getByLabel('답 입력', { exact: true }).fill('-1');
  await page.getByTestId('submit-answer').filter({ visible: true }).click();
  await expect(page.getByText('정답입니다!', { exact: true }).filter({ visible: true })).toBeVisible();
  await page.goto('/practice');
  await expect(page.getByText('보통 · 남은 0 / 10,000개', { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByTestId('generate-problem').filter({ visible: true })).toHaveAttribute('aria-disabled', 'true');
  await capture(page, 'practice-exhausted');
  await page.reload();
  await expect(page.getByTestId('generate-problem').filter({ visible: true })).toHaveAttribute('aria-disabled', 'true');
  expect((await learning(page)).mistakes).toHaveLength(1);
  await page.getByRole('button', { name: '쉬움', exact: true }).click();
  await expect(page.getByText('쉬움 · 남은 10,000 / 10,000개', { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByTestId('generate-problem').filter({ visible: true })).toBeEnabled();
});

test('30,000 per subject: every difficulty grades correctly and topic choice persists', async ({ page }) => {
  await demo(page);
  const cases = [
    { subject: '공업수학', answers: ['3', '[-1,1]', '12'] },
    { subject: '일반물리', answers: ['2', '24', '31.35'] },
    { subject: 'Python 프로그래밍', answers: ['2', '18', '10'] },
  ];
  for (const item of cases) for (let i = 0; i < 3; i += 1) {
    await page.goto('/practice');
    await page.getByRole('button', { name: item.subject, exact: true }).click();
    const label = ['쉬움', '보통', '어려움'][i];
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.getByText(`대학교 ${item.subject} 30,000개 · 난이도별 10,000개`, { exact: true }).filter({ visible: true })).toBeVisible();
    await expect(page.getByText(`${label} · 남은 10,000 / 10,000개`, { exact: true }).filter({ visible: true })).toBeVisible();
    if (item.subject === '공업수학' && i === 0) await capture(page, 'bank-easy');
    if (item.subject === '일반물리' && i === 2) await capture(page, 'bank-hard');
    await page.getByTestId('generate-problem').filter({ visible: true }).click();
    await page.getByLabel('답 입력', { exact: true }).waitFor();
    const problem = await page.evaluate(() => JSON.parse(localStorage.getItem('ft:demo-user:session')).currentProblem);
    expect(problem.difficulty).toBe(['easy', 'medium', 'hard'][i]);
    expect(problem.source).toBe('bank');
    await page.reload();
    if (item.subject === 'Python 프로그래밍' && i === 2) await capture(page, 'bank-python-hard-solve');
    await page.getByLabel('답 입력', { exact: true }).fill(item.answers[i]);
    await page.getByTestId('submit-answer').filter({ visible: true }).click();
    await expect(page.getByText('정답입니다!', { exact: true }).filter({ visible: true })).toBeVisible();
  }
  await page.goto('/practice');
  await page.getByRole('button', { name: '공업수학', exact: true }).click();
  await page.getByRole('button', { name: '보통', exact: true }).click();
  await page.getByRole('button', { name: '초기값과 지수함수 유형 풀기', exact: true }).click();
  await page.getByLabel('답 입력', { exact: true }).fill('3e^(-2x)');
  await page.getByTestId('submit-answer').filter({ visible: true }).click();
  await expect(page.getByText('정답입니다!', { exact: true }).filter({ visible: true })).toBeVisible();
  await page.goto('/practice');
  await page.getByRole('button', { name: '보통', exact: true }).click();
  await page.getByRole('button', { name: '초기값과 지수함수 유형 풀기', exact: true }).click();
  await page.getByLabel('답 입력', { exact: true }).fill('3e^(-3x)');
  await page.getByTestId('submit-answer').filter({ visible: true }).click();
  await expect(page.getByText('정답입니다!', { exact: true }).filter({ visible: true })).toBeVisible();
  const state = await learning(page);
  expect(state.practiceProgress['v2:공업수학:medium:ode']).toBe(2);
  expect(state.mistakes).toHaveLength(11);
  expect(new Set(state.mistakes.map(m => m.problemId)).size).toBe(11);
  expect(state.mistakes.every(m => m.isCorrect)).toBe(true);
  expect(state.dna.find(d => d.errorType === 'condition_omission').score).toBe(74);
});

test('failed bank reservation retries without consuming a variant or accumulating DNA', async ({ page }) => {
  await demo(page);
  await page.getByTestId('go-practice').filter({ visible: true }).click();
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    let failOnce = true;
    Storage.prototype.setItem = function (key, value) {
      if (failOnce && key === 'ft:demo-user:learning') { failOnce = false; throw new Error('Storage full'); }
      return original.call(this, key, value);
    };
  });
  await page.getByTestId('generate-problem').filter({ visible: true }).click();
  await expect(page.getByText('문제를 불러오지 못했어요.', { exact: true }).filter({ visible: true })).toBeVisible();
  expect((await learning(page)).practiceProgress).toBeUndefined();
  await page.getByRole('button', { name: '다시 시도', exact: true }).click();
  await page.getByLabel('답 입력', { exact: true }).waitFor();
  const state = await learning(page);
  expect(state.practiceProgress['v2:공업수학:medium:series']).toBe(1);
  expect(state.mistakes).toHaveLength(0); expect(state.dna[0].score).toBe(83);
});

test('ungradable Trap stays neutral; reload, HIT, correction and exhaustion stay consistent', async ({ page }) => {
  await demo(page);
  const before = (await learning(page)).dna;
  await page.getByTestId('go-trap').filter({ visible: true }).click();
  await page.getByTestId('trap-start').filter({ visible: true }).click();
  await page.getByLabel('Trap 답 입력', { exact: true }).fill('(2,5);invalid');
  await page.getByTestId('trap-submit').filter({ visible: true }).click();
  await expect(page.getByText('판정 불가', { exact: true }).filter({ visible: true })).toBeVisible();
  expect((await learning(page)).dna).toEqual(before);
  expect((await learning(page)).traps).toHaveLength(0);
  await capture(page, 'ungradable-trap');
  await page.reload();
  await page.getByLabel('Trap 답 입력', { exact: true }).fill('[2,5]');
  await page.getByTestId('trap-submit').filter({ visible: true }).click();
  await expect(page.getByText('예측 적중 (Prediction HIT)', { exact: true }).filter({ visible: true })).toBeVisible();
  await page.getByRole('button', { name: '다시 도전', exact: true }).click();
  await page.getByLabel('Trap 답 입력', { exact: true }).fill('[-3,3]');
  await page.getByTestId('trap-submit').filter({ visible: true }).click();
  await expect(page.getByText('Trap 극복', { exact: true }).filter({ visible: true })).toBeVisible();
  await page.getByRole('button', { name: '다시 도전', exact: true }).click();
  await expect(page.getByText('이 패턴의 준비된 문제를 모두 열어봤습니다. 다른 패턴이나 기본 문제를 선택해주세요.', { exact: true }).filter({ visible: true })).toBeVisible();
  expect((await learning(page)).traps).toHaveLength(2);
  expect((await learning(page)).issued.filter((q) => q.kind === 'trap')).toHaveLength(2);
  await capture(page, 'trap-exhausted');
});
