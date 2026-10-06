import { useCallback } from 'react';
import { useApp } from './AppContext';
import {
  applyMistake,
  applyCorrection,
  findEntry,
  upsertEntry,
  strongestErrorType,
} from '@/domain/errorDnaEngine';
import { buildMemoryContext } from '@/domain/memorySelect';
import type {
  MistakeAnalysis,
  Problem,
  Attempt,
  ErrorType,
  Confidence,
  MistakeRecord,
} from '@/domain/types';
import { uid } from '@/utils/id';
import { nowIso } from '@/utils/date';

/**
 * Encapsulates all Error-DNA state transitions that follow an analysis, keeping
 * the deterministic engine + persistence in one place (screens never touch the
 * engine directly).
 */
export function useErrorDNA() {
  const { profile, dna, repos, refresh } = useApp();

  const recordAnalysis = useCallback(
    async (problem: Problem, attempt: Attempt, analysis: MistakeAnalysis) => {
      if (!profile) return;
      const userId = profile.userId;

      // 1) Persist the mistake record (history).
      const record: MistakeRecord = {
        id: uid('mistake'),
        userId,
        problemId: problem.id,
        subject: problem.subject,
        topic: problem.topic,
        isCorrect: analysis.isCorrect,
        errorType: analysis.errorType,
        analysis,
        attempt,
        createdAt: nowIso(),
      };
      await repos.mistakes.add(userId, record);

      // 2) Update Error DNA deterministically.
      let entries = await repos.dna.get(userId);
      if (!analysis.isCorrect && analysis.errorType) {
        const existing = findEntry(entries, analysis.errorType);
        const next = applyMistake(existing, {
          userId,
          subject: problem.subject,
          topic: problem.topic,
          errorType: analysis.errorType,
          errorDescription: analysis.reason,
          evidence: analysis.evidence,
          severity: analysis.severity,
          confidence: analysis.confidence,
        });
        entries = upsertEntry(entries, next);
      } else if (analysis.isCorrect) {
        // Correct answer: if this problem targeted an error type the user has,
        // treat it as a correction and lower that score.
        const target = problem.targetErrorType;
        if (target) {
          const existing = findEntry(entries, target);
          if (existing) {
            const next = applyCorrection(existing, { confidence: attempt.confidence });
            entries = upsertEntry(entries, next);
          }
        }
      }
      await repos.dna.save(userId, entries);
      await refresh();
    },
    [profile, repos, refresh],
  );

  const recordCorrection = useCallback(
    async (errorType: ErrorType, confidence: Confidence) => {
      if (!profile) return;
      const userId = profile.userId;
      const entries = await repos.dna.get(userId);
      const existing = findEntry(entries, errorType);
      if (!existing) return;
      const next = applyCorrection(existing, { confidence });
      await repos.dna.save(userId, upsertEntry(entries, next));
      await refresh();
    },
    [profile, repos, refresh],
  );

  const strongest = strongestErrorType(dna);

  const memoryContextFor = useCallback(
    (problem: Pick<Problem, 'subject' | 'topic'>) => buildMemoryContext(dna, problem),
    [dna],
  );

  return { dna, strongest, recordAnalysis, recordCorrection, memoryContextFor };
}
