import type { Repositories } from '@/storage/repositories';
import type { Problem, Attempt, MistakeAnalysis, TrapProblem, TrapResult, MistakeRecord } from './types';
import { applyMistake, applyCorrection, findEntry, upsertEntry } from './errorDnaEngine';
import { inferPracticeErrorType } from './practiceEvidence';
import { inferTrapErrorType } from './trapEval';
import { assessAnswer, UngradableAnswerError } from './answerAssessment';

/** One submitted attempt = one durable event, even after reload or retry. */
export async function recordPractice(
  repos: Repositories, problem: Problem, attempt: Attempt, analysis: MistakeAnalysis,
): Promise<MistakeRecord> {
  if (attempt.problemId !== problem.id) throw new Error('Problem/attempt mismatch');
  const assessment = assessAnswer(problem, attempt.userAnswer);
  if (assessment.verdict === 'ungradable') throw new UngradableAnswerError(assessment.guidance);
  if (analysis.isCorrect !== (assessment.verdict === 'correct')) throw new Error('Analysis/answer mismatch');
  if (!analysis.isCorrect && analysis.errorType && analysis.errorType !== inferPracticeErrorType(problem, attempt.userAnswer)) {
    analysis = {...analysis, errorType: undefined, errorTitle: undefined, reason: '답이 정답과 다르지만 오답 원인은 확인되지 않았습니다.', correctionStrategy: '정답 해설과 풀이를 비교해주세요.', confidence: 0, recurrenceRisk: 0};
  }
  const userId = attempt.userId;
  const state = await repos.learning.update(userId, (s) => {
    if (s.mistakes.some((m) => m.attempt.id === attempt.id)) return s;
    const target = analysis.isCorrect ? problem.targetErrorType : analysis.errorType;
    const existing = target ? findEntry(s.dna, target, problem) : undefined;
    let dna = s.dna;
    if (target) {
      if (!analysis.isCorrect) {
        dna = upsertEntry(dna, applyMistake(existing, {
          userId, subject: problem.subject, educationLevel:problem.educationLevel, topic: problem.topic, errorType: target,
          severity: analysis.severity, confidence: analysis.confidence,
          errorDescription: analysis.reason, evidence: analysis.evidence, at: attempt.createdAt,
        }));
      } else if (existing) {
        dna = upsertEntry(dna, applyCorrection(existing, { confidence: attempt.confidence, at: attempt.createdAt }));
      }
    }
    const record: MistakeRecord = {
      id: `mistake:${attempt.id}`, problem, userId, problemId: problem.id, subject: problem.subject, educationLevel:problem.educationLevel,
      topic: problem.topic, isCorrect: analysis.isCorrect, errorType: analysis.errorType,
      analysis, attempt, createdAt: attempt.createdAt,
      beforeScore: target && (!analysis.isCorrect || existing) ? existing?.score ?? 0 : null,
      afterScore: target && (!analysis.isCorrect || existing) ? findEntry(dna, target, problem)?.score ?? 0 : null,
    };
    return { ...s, dna, mistakes: [...s.mistakes, record] };
  });
  return state.mistakes.find((m) => m.attempt.id === attempt.id)!;
}

export async function recordTrap(
  repos: Repositories, trap: TrapProblem, attempt: Attempt,
): Promise<TrapResult> {
  const assessment = assessAnswer(trap, attempt.userAnswer);
  if (assessment.verdict === 'ungradable') throw new UngradableAnswerError(assessment.guidance);
  const state = await repos.learning.update(attempt.userId, (s) => {
    if (s.traps.some((t) => t.id === attempt.id)) return s;
    const solvedCorrectly = assessment.verdict === 'correct';
    const actualErrorType = solvedCorrectly ? undefined : inferTrapErrorType(trap, attempt.userAnswer, attempt.userReasoning);
    const target = solvedCorrectly ? trap.targetErrorType : actualErrorType;
    const existing = target ? findEntry(s.dna, target, trap) : undefined;
    let dna = s.dna;
    if (solvedCorrectly && existing) {
      dna = upsertEntry(dna, applyCorrection(existing, { confidence: attempt.confidence, at: attempt.createdAt }));
    } else if (target) {
      dna = upsertEntry(dna, applyMistake(existing, {
        userId: attempt.userId, subject: trap.subject, educationLevel:trap.educationLevel, topic: trap.topic,
        errorType: target, severity: 3, at: attempt.createdAt,
      }));
    }
    const result: TrapResult = {
      id: attempt.id, userId: attempt.userId, subject: trap.subject, educationLevel: trap.educationLevel, trapProblemId: attempt.problemId,
      targetErrorType: trap.targetErrorType, topic: trap.topic, actualErrorType, solvedCorrectly,
      predictionHit: !solvedCorrectly && actualErrorType === trap.targetErrorType,
      createdAt: attempt.createdAt,
      beforeScore: target ? existing?.score ?? 0 : null,
      afterScore: target ? findEntry(dna, target, trap)?.score ?? 0 : null,
    };
    return { ...s, dna, traps: [...s.traps, result] };
  });
  return state.traps.find((t) => t.id === attempt.id)!;
}
