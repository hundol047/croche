/* Presenter scenario through the same atomic event functions used by the UI. */
import { MockCrocheAIService } from '@/services/ai/MockCrocheAIService';
import { MemoryKVStore } from '@/storage/kv';
import { makeRepositories } from '@/storage/repositories';
import { seedDemo } from '@/state/onboarding';
import { recordPractice, recordTrap } from '@/domain/learningEvents';
import { buildMemoryContext } from '@/domain/memorySelect';
import { buildReport } from '@/domain/report';
import { problemById } from '@/content/problems';
import { errorTypeLabel } from '@/domain/errorTypes';
import { nowIso } from '@/utils/date';
import type { Attempt } from '@/domain/types';

function assert(ok: boolean, message: string): void { if (!ok) throw new Error(message); }
async function main() {
  const ai = new MockCrocheAIService({ latencyMs: 0 });
  const repos = makeRepositories(new MemoryKVStore());
  const profile = await seedDemo(repos);
  const problem = problemById('eng-math-3')!;
  const attempt: Attempt = { id: 'judge-practice', userId: profile.userId, problemId: problem.id,
    userAnswer: '2', userReasoning: 'x+1로 약분하고 x=1을 대입했어요.', confidence: 'medium', createdAt: nowIso() };
  const analysis = await ai.analyzeMistake({ problem, attempt, relevantMemories: buildMemoryContext(await repos.dna.get(profile.userId), problem) });
  if (!analysis.ok) throw new Error(analysis.error);
  const record = await recordPractice(repos, problem, attempt, analysis.value);
  await recordPractice(repos, problem, attempt, analysis.value); // replay must be harmless
  assert((await repos.mistakes.get(profile.userId)).length === 1, 'Duplicate analysis');
  assert(record.beforeScore === 83 && record.afterScore === 100, 'Unexpected practice score');
  console.log(`1) 약분과 정의역 · 오답 2 → ${errorTypeLabel(record.errorType!)} ${record.beforeScore} → ${record.afterScore}`);

  const dna = await repos.dna.get(profile.userId);
  const prediction = await ai.predictNextMistake({ subject: '공업수학', relevantMemories: buildMemoryContext(dna, problem) });
  if (!prediction.ok) throw new Error(prediction.error);
  assert(prediction.value.predictedErrorType === 'condition_omission', 'Unexpected prediction');
  console.log(`2) 다음 실수: 조건 누락 · AI 예측 위험도 ${prediction.value.riskScore}`);

  const input = { targetErrorType: prediction.value.predictedErrorType, subject: '공업수학' as const, recentTopics: [], relevantMemories: [] };
  const first = await ai.generateTrapProblem(input);
  if (!first.ok) throw new Error(first.error);
  const hit = await recordTrap(repos, first.value, { ...attempt, id: 'judge-hit', problemId: 'trap-log', userAnswer: '[2,5]' });
  assert(hit.predictionHit && !hit.solvedCorrectly, 'Expected evidence-backed HIT');
  console.log('3) 로그 정의역 Trap · [2,5] → Prediction HIT');

  const second = await ai.generateTrapProblem({ ...input, recentTopics: [first.value.topic] });
  if (!second.ok) throw new Error(second.error);
  assert(second.value.question !== first.value.question, 'Trap must have new content');
  const overcome = await recordTrap(repos, second.value, { ...attempt, id: 'judge-correct', problemId: 'trap-root', userAnswer: '[-3,3]' });
  assert(overcome.solvedCorrectly && overcome.beforeScore === 100 && overcome.afterScore === 91, 'Expected correction');
  console.log('4) 제곱근 정의역 Trap · [-3,3] → Trap 극복 · 조건 누락 100 → 91');

  const state = await repos.learning.get(profile.userId);
  const report = buildReport(state.mistakes, state.traps, state.dna);
  assert(report.predictionHitRate === 0.5 && report.correctedCount === 1, 'Incorrect report aggregation');
  console.log('5) 리포트: Trap 2회 · 예측 적중 1회 (50%) · 교정 성공 1회');
  console.log('전체 심사 루프 정상 실행 ✓ (Mock, Real Croche 미연결)');
}
void main().catch((error) => { console.error(error); process.exitCode = 1; });
