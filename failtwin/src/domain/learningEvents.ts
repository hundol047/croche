import type { Repositories } from '@/storage/repositories';
import type { Problem, Attempt, MistakeAnalysis, TrapProblem, TrapResult, MistakeRecord } from './types';
import { applyMistake, applyCorrection, findEntry, upsertEntry } from './errorDnaEngine';
import { checkAnswer, inferTrapErrorType } from './trapEval';

/** One submitted attempt = one durable event, even after reload or retry. */
export async function recordPractice(
  repos: Repositories, problem: Problem, attempt: Attempt, analysis: MistakeAnalysis,
): Promise<MistakeRecord> {
  if (attempt.problemId !== problem.id) throw new Error('Problem/attempt mismatch');
  const userId = attempt.userId;
  const state = await repos.learning.update(userId, (s) => {
    if (s.mistakes.some((m) => m.attempt.id === attempt.id)) return s;
    const target = analysis.isCorrect ? problem.targetErrorType : analysis.errorType;
    const existing = target ? findEntry(s.dna, target) : undefined;
    let dna = s.dna;
    if (target) {
      if (!analysis.isCorrect) {
        dna = upsertEntry(dna, applyMistake(existing, {
          userId, subject: problem.subject, topic: problem.topic, errorType: target,
          severity: analysis.severity, confidence: analysis.confidence,
          errorDescription: analysis.reason, evidence: analysis.evidence, at: attempt.createdAt,
        }));
      } else if (existing) {
        dna = upsertEntry(dna, applyCorrection(existing, { confidence: attempt.confidence, at: attempt.createdAt }));
      }
    }
    const record: MistakeRecord = {
      id: `mistake:${attempt.id}`, userId, problemId: problem.id, subject: problem.subject,
      topic: problem.topic, isCorrect: analysis.isCorrect, errorType: analysis.errorType,
      analysis, attempt, createdAt: attempt.createdAt,
      beforeScore: target && (!analysis.isCorrect || existing) ? existing?.score ?? 0 : null,
      afterScore: target && (!analysis.isCorrect || existing) ? findEntry(dna, target)?.score ?? 0 : null,
    };
    return { ...s, dna, mistakes: [...s.mistakes, record] };
  });
  return state.mistakes.find((m) => m.attempt.id === attempt.id)!;
}

export async function recordTrap(
  repos: Repositories, trap: TrapProblem, attempt: Attempt,
): Promise<TrapResult> {
  const state = await repos.learning.update(attempt.userId, (s) => {
    if (s.traps.some((t) => t.id === attempt.id)) return s;
    const solvedCorrectly = checkAnswer(trap, attempt.userAnswer);
    const actualErrorType = solvedCorrectly ? undefined : inferTrapErrorType(trap, attempt.userAnswer, attempt.userReasoning);
    const target = solvedCorrectly ? trap.targetErrorType : actualErrorType;
    const existing = target ? findEntry(s.dna, target) : undefined;
    let dna = s.dna;
    if (solvedCorrectly && existing) {
      dna = upsertEntry(dna, applyCorrection(existing, { confidence: attempt.confidence, at: attempt.createdAt }));
    } else if (target) {
      dna = upsertEntry(dna, applyMistake(existing, {
        userId: attempt.userId, subject: trap.subject, topic: trap.topic,
        errorType: target, severity: 3, at: attempt.createdAt,
      }));
    }
    const result: TrapResult = {
      id: attempt.id, userId: attempt.userId, trapProblemId: attempt.problemId,
      targetErrorType: trap.targetErrorType, topic: trap.topic, actualErrorType, solvedCorrectly,
      predictionHit: !solvedCorrectly && actualErrorType === trap.targetErrorType,
      createdAt: attempt.createdAt,
      beforeScore: target ? existing?.score ?? 0 : null,
      afterScore: target ? findEntry(dna, target)?.score ?? 0 : null,
    };
    return { ...s, dna, traps: [...s.traps, result] };
  });
  return state.traps.find((t) => t.id === attempt.id)!;
}
