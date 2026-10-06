import type { ErrorDnaEntry, MemorySnippet } from '@/domain/types';
import { selectRelevantMemories, toMemorySnippet } from '@/domain/memorySelect';

/**
 * Croche Memory abstraction.
 *
 * In this build, Error DNA entries ARE the local projection of Croche Memory
 * records (same fields: userId, subject, topic, errorType, errorDescription,
 * evidence, occurrenceCount, recentOccurrence, severity, confidence,
 * improvementScore, lastUpdated). This module encapsulates the "retrieve only
 * relevant memories for the current problem" policy so a real Croche Memory
 * backend can be dropped in without touching callers.
 *
 * ⚠️ REAL CROCHE INTEGRATION POINT ⚠️
 * Replace the local selection with Croche Memory's semantic retrieval when the
 * SDK is available — the method signatures should stay the same.
 */
export interface MemoryStore {
  /** Retrieve only the memories relevant to the current problem context. */
  retrieveRelevant(
    userId: string,
    ctx: { subject?: string; topic?: string },
    limit?: number,
  ): Promise<MemorySnippet[]>;
}

export class LocalMemoryStore implements MemoryStore {
  constructor(private readEntries: (userId: string) => Promise<ErrorDnaEntry[]>) {}

  async retrieveRelevant(
    userId: string,
    ctx: { subject?: string; topic?: string },
    limit = 4,
  ): Promise<MemorySnippet[]> {
    const entries = await this.readEntries(userId);
    const relevant = selectRelevantMemories(entries, ctx, limit);
    return relevant.map((e) => toMemorySnippet(e));
  }
}
