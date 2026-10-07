import { clamp, round1 } from '@/utils/clamp';
import { daysBetween, nowIso } from '@/utils/date';
import { errorTypeLabel } from './errorTypes';
import type { ErrorDnaEntry, Prediction } from './types';

/**
 * Deterministic baseline prediction derived purely from Error DNA.
 *
 * This is used:
 *  - as the Home dashboard's "next likely mistake" summary,
 *  - as a fallback when the AI prediction fails validation,
 *  - as a reference the AI prediction is reconciled against.
 *
 * IMPORTANT (R5.2): riskScore is an "AI/heuristic prediction score", NOT a
 * statistically validated probability. The UI labels it as such.
 */
export function predictFromDna(
  entries: ErrorDnaEntry[],
  ctx: { subject?: string; topic?: string } = {},
  at: string = nowIso(),
): Prediction | null {
  if (entries.length === 0) return null;

  const ranked = [...entries]
    .map((e) => ({ e, weight: weightOf(e, ctx, at) }))
    .sort((a, b) => b.weight - a.weight);

  const top = ranked[0]!.e;
  // Risk score blends the entry score with recency/recurrence, lightly.
  const days = daysBetween(top.recentOccurrence, at);
  const recencyBoost = Math.max(0, 8 - days * 0.5);
  const recurrenceBoost = Math.min(top.occurrenceCount, 4) * 2;
  const riskScore = round1(clamp(top.score * 0.85 + recencyBoost + recurrenceBoost, 0, 100));

  const related = ranked
    .slice(1, 4)
    .filter((x) => x.e.score > 0)
    .map((x) => `${errorTypeLabel(x.e.errorType)} ${Math.round(x.e.score)}`);

  return {
    predictedErrorType: top.errorType,
    riskScore,
    reason: buildReason(top, ctx),
    relatedMemories: related,
  };
}

function weightOf(
  e: ErrorDnaEntry,
  ctx: { subject?: string; topic?: string },
  at: string,
): number {
  let w = e.score;
  if (ctx.subject && e.subject === ctx.subject) w += 10;
  if (ctx.topic && e.topic === ctx.topic) w += 15;
  const days = daysBetween(e.recentOccurrence, at);
  w += Math.max(0, 10 - days * 0.5);
  return w;
}

function buildReason(top: ErrorDnaEntry, ctx: { subject?: string; topic?: string }): string {
  const label = errorTypeLabel(top.errorType);
  const where = ctx.topic ?? ctx.subject ?? '유사한 문제';
  const freq =
    top.occurrenceCount >= 2
      ? `관련 풀이에서 ${label} 패턴이 ${top.occurrenceCount}회 관찰되었습니다.`
      : `${where}에서 ${label} 경향이 관찰되었습니다.`;
  return `${freq} ${where}의 조건을 확인할 때 주의하세요. Error DNA 점수 ${Math.round(top.score)}를 바탕으로, 다음 문제에서 같은 실수가 재발할 가능성이 높습니다.`;
}
