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
  const recurrenceTrend = weeklyRecurrence(mistakes, weeks, at);
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
  mistakes: MistakeRecord[],
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
      return t >= start && t < end && !m.isCorrect && m.errorType;
    });
    let repeats = 0;
    for (const m of inWeek) {
      if (m.errorType && seenTypes.has(m.errorType)) repeats += 1;
      if (m.errorType) seenTypes.add(m.errorType);
    }
    const rate = inWeek.length === 0 ? 0 : round1(repeats / inWeek.length);
    out.push({ weekLabel: `W${weeks - w}`, recurrenceRate: rate });
  }
  return out;
}

export function hitRate(trapResults: TrapResult[]): number {
  if (trapResults.length === 0) return 0;
  const hits = trapResults.filter((t) => t.predictionHit).length;
  return round1(hits / trapResults.length);
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
 * Non-blaming AI Insight. Describes mistakes as correctable behaviour patterns,
 * never as a judgement of the person's ability (R10 safety).
 */
export function buildInsight(entries: ErrorDnaEntry[], trapResults: TrapResult[]): string {
  if (entries.length === 0) {
    return '아직 데이터가 충분하지 않아요. 몇 문제를 풀면 당신만의 실수 패턴을 분석해 드릴게요.';
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
    line1 = `당신은 개념 부족보다 ${errorTypeLabel(verifyLike.errorType)}을(를) 반복하는 경향이 더 크게 나타납니다.`;
  } else {
    line1 = `현재 당신에게 가장 두드러지는 패턴은 ${topLabel}입니다. 이는 능력의 문제가 아니라 교정 가능한 습관입니다.`;
  }

  const hits = trapResults.filter((t) => t.predictionHit).length;
  const line2 =
    hits > 0
      ? `Trap Mode에서 예측이 ${hits}회 적중한 만큼, 답을 확정하기 전에 한 번 더 ${topLabel} 여부를 점검하는 습관을 만들어보세요.`
      : `문제를 푼 뒤 답을 확정하기 전에 ${topLabel}이(가) 없는지 다시 확인하는 습관을 만들어보세요.`;

  return `${line1} ${line2}`;
}

/** Snapshot used to detect improvement after a trap/correction cycle. */
export function totalRisk(entries: ErrorDnaEntry[]): number {
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
