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
async function reloadWith(page, text) {
  await expect(page.getByText(text, { exact: true }).filter({ visible: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText(text, { exact: true }).filter({ visible: true }).first()).toBeVisible();
  await noOverflow(page);
}
async function demo(page) {
  await page.goto('/onboarding');
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
  await reloadWith(page, '오늘의 학습 진단');
  await page.screenshot({ path: test.info().outputPath('dashboard.png'), fullPage: true });
  await page.getByTestId('go-practice').filter({ visible: true }).click();
  await page.getByRole('button', { name: '약분과 정의역 문제 풀기', exact: true }).click();
  await page.getByLabel('답 입력', { exact: true }).fill('2');
  await page.getByLabel('풀이 과정 입력', { exact: true }).fill('x+1로 약분하고 x=1을 대입했어요.');
  await page.getByTestId('submit-answer').filter({ visible: true }).click();
  await expect(page.getByText('83 → 100', { exact: true }).filter({ visible: true })).toBeVisible();
  await page.waitForTimeout(1000); // catch the prior effect-driven infinite analysis loop
  expect((await learning(page)).mistakes).toHaveLength(1);
  await reloadWith(page, 'Error DNA 변화');
  expect((await learning(page)).mistakes).toHaveLength(1);
  await page.screenshot({ path: test.info().outputPath('analysis.png'), fullPage: true });
  await page.getByRole('button', { name: '다음 실수 예측 보기', exact: true }).click();
  await reloadWith(page, '예상 실수 위험도');
  await page.getByRole('button', { name: '🎯 이 실수를 유발하는 Trap 문제 받기', exact: true }).click();
  await page.getByTestId('trap-start').filter({ visible: true }).click();
  await expect(page.getByText('ln(x-2) + ln(5-x)', { exact: false }).filter({ visible: true })).toBeVisible();
  await reloadWith(page, '타깃: 조건 누락');
  await page.getByLabel('Trap 답 입력', { exact: true }).fill('[2,5]');
  await page.getByTestId('trap-submit').filter({ visible: true }).click();
  await expect(page.getByText('예측 적중 (Prediction HIT)', { exact: true }).filter({ visible: true })).toBeVisible();
  await reloadWith(page, '예측 적중 (Prediction HIT)');
  await page.screenshot({ path: test.info().outputPath('trap-hit.png'), fullPage: true });
  expect((await learning(page)).traps).toHaveLength(1);
  await page.getByRole('button', { name: '다시 도전', exact: true }).click();
  await expect(page.getByText('√(9-x²)', { exact: false }).filter({ visible: true })).toBeVisible();
  await page.getByLabel('Trap 답 입력', { exact: true }).fill('[-3,3]');
  await page.getByTestId('trap-submit').filter({ visible: true }).click();
  await expect(page.getByText('Trap 극복! 🎉', { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText('조건 누락 100 → 91', { exact: true }).filter({ visible: true })).toBeVisible();
  await page.getByRole('button', { name: '학습 리포트 보기', exact: true }).click();
  await expect(page.getByText('50%', { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText('1개', { exact: true }).filter({ visible: true })).toBeVisible();
  await reloadWith(page, '학습 리포트');
  const state = await learning(page);
  expect(state.dna.find((d) => d.errorType === 'condition_omission').score).toBe(91);
  expect(state.traps).toHaveLength(2);
  expect(state.traps.map((t) => t.predictionHit)).toEqual([true, false]);
  await noOverflow(page);
  await page.screenshot({ path: test.info().outputPath('report.png'), fullPage: true });
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
