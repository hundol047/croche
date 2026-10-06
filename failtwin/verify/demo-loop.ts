/* Offline runtime demonstration of the FailTwin core loop (no RN, no network).
 * Runs the REAL domain engine + MockCrocheAIService through the full journey
 * and prints the data changes, proving the end-to-end experience executes.
 * Not part of the shipped app. */
import { MockCrocheAIService } from '@/services/ai/MockCrocheAIService';
import { MemoryKVStore } from '@/storage/kv';
import { makeRepositories } from '@/storage/repositories';
import {
  applyMistake,
  applyCorrection,
  findEntry,
  upsertEntry,
  strongestErrorType,
} from '@/domain/errorDnaEngine';
import { buildMemoryContext } from '@/domain/memorySelect';
import { predictFromDna } from '@/domain/prediction';
import { buildReport } from '@/domain/report';
import { checkAnswer, inferTrapErrorType } from '@/domain/trapEval';
import { problemById } from '@/content/problems';
import { errorTypeLabel } from '@/domain/errorTypes';
import { uid } from '@/utils/id';
import { nowIso } from '@/utils/date';
import type { ErrorType } from '@/domain/types';

const log = (...a: unknown[]) => console.log(...a);

async function main() {
  const ai = new MockCrocheAIService({ latencyMs: 0, seed: 3 });
  const repos = makeRepositories(new MemoryKVStore());
  const userId = 'demo-runtime';

  log('── FailTwin core loop (runtime demo) ──\n');

  // 1) Solve a problem WRONG (omit the endpoint check).
  const problem = problemById('eng-math-1')!;
  log(`1) 문제: [${problem.subject}/${problem.topic}] ${problem.prompt.slice(0, 40)}...`);
  log(`   제출 답(오답): "(-1,1)"  (정답: ${problem.correctAnswer})`);

  const memBefore = buildMemoryContext(await repos.dna.get(userId), problem);
  const analysisRes = await ai.analyzeMistake({
    problem,
    attempt: { id: uid('a'), userId, problemId: problem.id, userAnswer: '(-1,1)', confidence: 'high', createdAt: nowIso() },
    relevantMemories: memBefore,
  });
  if (!analysisRes.ok) throw new Error('analysis failed: ' + analysisRes.error);
  const analysis = analysisRes.value;
  log(`\n2) AI 분석: 정답? ${analysis.isCorrect} · 핵심 실수 = ${errorTypeLabel(analysis.errorType ?? '')}`);
  log(`   원인: ${analysis.reason.slice(0, 70)}...`);

  // 3) Deterministic Error DNA update.
  let dna = await repos.dna.get(userId);
  const et = analysis.errorType as ErrorType;
  const before = findEntry(dna, et)?.score ?? 0;
  dna = upsertEntry(dna, applyMistake(findEntry(dna, et), {
    userId, subject: problem.subject, topic: problem.topic, errorType: et, severity: analysis.severity,
  }));
  await repos.dna.save(userId, dna);
  const after = findEntry(dna, et)!.score;
  log(`\n3) Error DNA 변화: ${errorTypeLabel(et)} ${before} → ${after}`);

  // 4) Prediction from DNA.
  const pred = predictFromDna(dna, { subject: problem.subject, topic: problem.topic })!;
  log(`\n4) 다음 실수 예측: ${errorTypeLabel(pred.predictedErrorType)} · AI 예측 위험도 ${Math.round(pred.riskScore)}`);

  // 5) Trap Mode — target the strongest error type.
  const target = strongestErrorType(dna)!.errorType;
  const trapRes = await ai.generateTrapProblem({
    targetErrorType: target, subject: '공업수학', recentTopics: [problem.topic],
    relevantMemories: buildMemoryContext(dna, problem),
  });
  if (!trapRes.ok) throw new Error('trap failed: ' + trapRes.error);
  const trap = trapRes.value;
  log(`\n5) Trap 문제 생성 (타깃=${errorTypeLabel(target)}):`);
  log(`   ${trap.question.slice(0, 60).replace(/\n/g, ' ')}...`);
  log(`   함정: ${trap.trapExplanation.slice(0, 60)}...`);
  log(`   이전 문제와 동일한가? ${trap.question === problem.prompt ? 'YES(문제!)' : 'NO (새 문제)'}`);

  // 6) User falls for the trap (wrong) -> Prediction HIT.
  const wrong = trap.answerType === 'numeric' ? '999' : 'wrong';
  const solved = checkAnswer(trap, wrong);
  const actual = solved ? undefined : inferTrapErrorType(trap, wrong, '');
  const hit = !solved && actual === trap.targetErrorType;
  log(`\n6) Trap 재도전(오답) → 정답? ${solved} · 예측 적중(HIT)? ${hit}`);
  await repos.traps.add(userId, {
    id: uid('tr'), userId, trapProblemId: uid('tq'), targetErrorType: trap.targetErrorType,
    actualErrorType: actual, predictionHit: hit, solvedCorrectly: solved, createdAt: nowIso(),
  });

  // 7) Now the user CORRECTS the pattern -> score goes down.
  const corr = applyCorrection(findEntry(dna, target)!, { confidence: 'medium' });
  dna = upsertEntry(dna, corr);
  await repos.dna.save(userId, dna);
  log(`\n7) 교정 성공 → ${errorTypeLabel(target)} ${after} → ${corr.score} (하향)`);

  // 8) Report.
  const report = buildReport(await repos.mistakes.get(userId), await repos.traps.get(userId), dna);
  log(`\n8) 리포트: 예측 적중률 ${Math.round(report.predictionHitRate * 100)}% · 가장 위험 = ${report.mostDangerousErrorType ? errorTypeLabel(report.mostDangerousErrorType) : '-'}`);
  log(`   Insight: ${report.insight.slice(0, 80)}...`);

  log('\n── 전체 루프가 런타임에서 정상 실행됨 ✓ ──');
}

void main();
