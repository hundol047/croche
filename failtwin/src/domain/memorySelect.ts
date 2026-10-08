import { daysBetween, nowIso } from '@/utils/date';
import { errorTypeLabel } from './errorTypes';
import type { ErrorDnaEntry, MemorySnippet, Problem } from './types';

/**
 * Croche Context minimization: instead of sending the whole conversation /
 * every memory to the LLM, select only the memories RELEVANT to the current
 * problem. This keeps context small, cheap, and on-topic.
 *
 * Scoring blends:
 *  - subject/topic relevance to the current problem
 *  - the entry's own risk score
 *  - recency (recent mistakes weigh more)
 *  - recurrence (repeated mistakes weigh more)
 */
export interface RelevanceContext {
  subject?: string;
  topic?: string;
}

export function scoreRelevance(
  entry: ErrorDnaEntry,
  ctx: RelevanceContext,
  at: string = nowIso(),
): number {
  let s = entry.score * 0.6; // base risk

  if (ctx.subject && entry.subject === ctx.subject) s += 20;
  if (ctx.topic && entry.topic === ctx.topic) s += 25;

  const days = daysBetween(entry.recentOccurrence, at);
  s += Math.max(0, 15 - days); // recency bonus, fades over ~15 days

  s += Math.min(entry.occurrenceCount, 4) * 4; // recurrence bonus (capped)

  return s;
}

export function selectRelevantMemories(
  entries: ErrorDnaEntry[],
  ctx: RelevanceContext,
  limit = 4,
  at: string = nowIso(),
): ErrorDnaEntry[] {
  return [...entries]
    .map((e) => ({ e, r: scoreRelevance(e, ctx, at) }))
    .sort((a, b) => b.r - a.r)
    .slice(0, limit)
    .map((x) => x.e);
}

export function toMemorySnippet(entry: ErrorDnaEntry, at: string = nowIso()): MemorySnippet {
  const days = Math.round(daysBetween(entry.recentOccurrence, at));
  const recencyNote =
    days <= 1 ? '최근 발생' : days <= 7 ? `${days}일 전 발생` : `${days}일 전 마지막 발생`;
  const note =
    entry.occurrenceCount >= 2
      ? `${recencyNote} · 유사 상황 ${entry.occurrenceCount}회 반복`
      : recencyNote;
  return {
    errorType: entry.errorType,
    label: errorTypeLabel(entry.errorType),
    score: entry.score,
    occurrenceCount: entry.occurrenceCount,
    recentOccurrence: entry.recentOccurrence,
    note,
  };
}

/** Build the compact context block that gets inserted into the AI prompt. */
export function buildMemoryContext(
  entries: ErrorDnaEntry[],
  problem: Pick<Problem, 'subject' | 'topic' | 'educationLevel'>,
  limit = 4,
): MemorySnippet[] {
  const relevant = selectRelevantMemories(entries.filter(e => !e.legacyAggregate && e.subject === problem.subject && (e.educationLevel ?? 'university') === (problem.educationLevel ?? 'university')), {
    subject: problem.subject,
    topic: problem.topic,
  }, limit);
  return relevant.map((e) => toMemorySnippet(e));
}
