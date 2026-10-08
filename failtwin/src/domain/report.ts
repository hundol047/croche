import { clamp, round1 } from '@/utils/clamp';
import { daysBetween, nowIso } from '@/utils/date';
import { errorTypeLabel } from './errorTypes';
import type {
  ErrorDnaEntry,
  LearningReport,
  MistakeRecord,
  TrapResult,
  WeeklyRecurrence,
  ErrorType,
} from './types';

/**
 * Aggregate the learning report from stored history. All deterministic.
 */
export function buildReport(
  mistakes: MistakeRecord[],
  trapResults: TrapResult[],
  entries: ErrorDnaEntry[],
  weeks = 4,
  at: string = nowIso(),
): LearningReport {
  entries = entries.filter(e=>!e.legacyAggregate);
  const recurrenceTrend = weeklyRecurrence([
    ...mistakes,
    ...trapResults.map((t) => ({ isCorrect: t.solvedCorrectly, errorType: t.actualErrorType, subject: t.subject, educationLevel: t.educationLevel, createdAt: t.createdAt })),
  ], weeks, at);
  const predictionHitRate = hitRate(trapResults);
  const correctedCount = countCorrected(mistakes, trapResults);
  const improved = mostImproved(entries);
  const dangerous = mostDangerous(entries);

  return {
    recurrenceTrend,
    predictionHitRate,
    correctedCount,
    mostImprovedErrorType: improved?.errorType,
    mostImprovedDelta: improved?.delta ?? 0,
    mostDangerousErrorType: dangerous?.errorType,
    mostDangerousScore: dangerous?.score ?? 0,
    insight: buildInsight(entries, trapResults),
  };
}

/** Recurrence rate per week = (repeat mistakes) / (total mistakes) that week. */
export function weeklyRecurrence(
  mistakes: (Pick<MistakeRecord, 'isCorrect' | 'errorType' | 'createdAt'> & Partial<Pick<MistakeRecord, 'subject' | 'educationLevel'>>)[],
  weeks: number,
  at: string = nowIso(),
): WeeklyRecurrence[] {
  const out: WeeklyRecurrence[] = [];
  const seenTypes = new Set<ErrorType>();
  const nowMs = new Date(at).getTime();

  for (let w = weeks - 1; w >= 0; w -= 1) {
    const start = nowMs - (w + 1) * 7 * 24 * 60 * 60 * 1000;
    const end = nowMs - w * 7 * 24 * 60 * 60 * 1000;
    const inWeek = mistakes.filter((m) => {
      const t = new Date(m.createdAt).getTime();
      return t >= start && (w === 0 ? t <= end : t < end) && !m.isCorrect && m.errorType;
    });
    inWeek.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (inWeek.length === 0) continue;
    let repeats = 0;
    for (const m of inWeek) {
      const key = `${m.educationLevel ?? 'university'}:${m.subject ?? 'legacy'}:${m.errorType}`;
      if (m.errorType && seenTypes.has(key)) repeats += 1;
      if (m.errorType) seenTypes.add(key);
    }
    const rate = inWeek.length === 0 ? 0 : repeats / inWeek.length;
    out.push({ weekLabel: `W${weeks - w}`, recurrenceRate: rate });
  }
  return out;
}

export function hitRate(trapResults: TrapResult[]): number {
  if (trapResults.length === 0) return 0;
  const hits = trapResults.filter((t) => t.predictionHit).length;
  return hits / trapResults.length;
}

function countCorrected(mistakes: MistakeRecord[], trapResults: TrapResult[]): number {
  const fromTrap = trapResults.filter((t) => t.solvedCorrectly).length;
  const fromPractice = mistakes.filter((m) => m.isCorrect).length;
  return fromTrap + fromPractice;
}

function mostImproved(entries: ErrorDnaEntry[]): { errorType: ErrorType; delta: number } | undefined {
  const withImprovement = entries.filter((e) => e.improvementScore > 0);
  if (withImprovement.length === 0) return undefined;
  const top = [...withImprovement].sort((a, b) => b.improvementScore - a.improvementScore)[0]!;
  return { errorType: top.errorType, delta: round1(top.improvementScore) };
}

function mostDangerous(entries: ErrorDnaEntry[]): { errorType: ErrorType; score: number } | undefined {
  if (entries.length === 0) return undefined;
  const top = [...entries].sort((a, b) => b.score - a.score)[0]!;
  return { errorType: top.errorType, score: round1(top.score) };
}

/**
 * Non-blaming learning note. Describes mistakes as correctable behaviour patterns,
 * never as a judgement of the person's ability (R10 safety).
 */
export function buildInsight(entries: ErrorDnaEntry[], trapResults: TrapResult[]): string {
  entries = entries.filter(e=>!e.legacyAggregate);
  if (entries.length === 0) {
    return '풀이 기록이 쌓이면 반복되는 실수 패턴과 다음 연습을 확인할 수 있어요.';
  }
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  const top = sorted[0]!;
  const topLabel = errorTypeLabel(top.errorType);

  const conceptEntry = entries.find((e) => e.errorType === 'concept_confusion');
  const verifyLike = entries.find(
    (e) => e.errorType === 'verification_omission' || e.errorType === 'edge_case_omission' || e.errorType === 'condition_omission',
  );

  let line1: string;
  if (verifyLike && conceptEntry && verifyLike.score > conceptEntry.score + 10) {
    line1 = `개념 혼동보다 ${errorTypeLabel(verifyLike.errorType)} 패턴이 두드러집니다.`;
  } else {
    line1 = `현재 가장 두드러진 패턴은 ${topLabel}입니다. 다음 풀이에서 먼저 확인해보세요.`;
  }

  const hits = trapResults.filter((t) => t.predictionHit).length;
  const line2 =
    hits > 0
      ? `Trap 훈련에서 예측한 패턴이 ${hits}회 확인됐어요. 다음 답을 확정하기 전에 ${topLabel} 여부를 점검해보세요.`
      : `다음 문제를 풀고 ${topLabel} 여부를 확인해보세요.`;

  return `${line1} ${line2}`;
}

/** Snapshot used to detect improvement after a trap/correction cycle. */
export function totalRisk(entries: ErrorDnaEntry[]): number {
  entries = entries.filter(e=>!e.legacyAggregate);
  if (entries.length === 0) return 0;
  const sum = entries.reduce((acc, e) => acc + e.score, 0);
  return round1(clamp(sum / entries.length, 0, 100));
}

export function freshnessDays(entries: ErrorDnaEntry[], at: string = nowIso()): number {
  if (entries.length === 0) return 0;
  const newest = entries.reduce((min, e) => {
    const d = daysBetween(e.lastUpdated, at);
    return Math.min(min, d);
  }, Number.POSITIVE_INFINITY);
  return round1(newest);
}
