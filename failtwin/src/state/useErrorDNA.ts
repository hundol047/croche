import { useCallback } from 'react';
import { useApp } from './AppContext';
import {
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
} from '@/domain/types';
import { recordPractice } from '@/domain/learningEvents';

/**
 * Encapsulates all Error-DNA state transitions that follow an analysis, keeping
 * the deterministic engine + persistence in one place (screens never touch the
 * engine directly).
 */
export function useErrorDNA() {
  const { profile, dna, repos, refresh } = useApp();

  const recordAnalysis = useCallback(
    async (problem: Problem, attempt: Attempt, analysis: MistakeAnalysis) => {
      if (!profile || attempt.userId !== profile.userId) throw new Error('User/attempt mismatch');
      const result = await recordPractice(repos, problem, attempt, analysis);
      await refresh();
      return result;
    },
    [profile, repos, refresh],
  );

  const recordCorrection = useCallback(
    async (errorType: ErrorType, confidence: Confidence, scope: Pick<Problem, 'subject' | 'educationLevel'>) => {
      if (!profile) return;
      const userId = profile.userId;
      await repos.learning.update(userId,state=>{
        const existing = findEntry(state.dna,errorType,scope);
        return existing ? {...state,dna:upsertEntry(state.dna,applyCorrection(existing,{confidence}))} : state;
      });
      await refresh();
    },
    [profile, repos, refresh],
  );

  const strongest = strongestErrorType(dna);

  const memoryContextFor = useCallback(
    (problem: Pick<Problem, 'subject' | 'topic' | 'educationLevel'>) => buildMemoryContext(dna, problem),
    [dna],
  );

  return { dna, strongest, recordAnalysis, recordCorrection, memoryContextFor };
}
