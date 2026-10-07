import { DNA_CONFIG, CONFIDENCE_LEVEL } from '@/constants/errorDna';
import { clamp, round1 } from '@/utils/clamp';
import { nowIso, daysBetween } from '@/utils/date';
import type { ErrorDnaEntry, ErrorType, Confidence } from './types';
import { errorTypeDescription } from './errorTypes';

/**
 * DETERMINISTIC Error DNA scoring. No randomness here. The LLM only supplies
 * `errorType` + `severity`; all score math lives in this module so results are
 * reproducible and testable.
 */

export interface MistakeInput {
  userId: string;
  subject: string;
  topic: string;
  errorType: ErrorType;
  errorDescription?: string;
  evidence?: string[];
  severity: number; // 1..5
  confidence?: number; // 0..1 (AI confidence)
  at?: string; // ISO, defaults to now
}

function emptyEntry(input: MistakeInput): ErrorDnaEntry {
  const at = input.at ?? nowIso();
  return {
    userId: input.userId,
    subject: input.subject,
    topic: input.topic,
    errorType: input.errorType,
    errorDescription: input.errorDescription ?? errorTypeDescription(input.errorType),
    evidence: [],
    occurrenceCount: 0,
    recentOccurrence: at,
    severity: 1,
    confidence: input.confidence ?? 0.5,
    score: 0,
    improvementScore: 0,
    lastUpdated: at,
  };
}

/**
 * Apply a new mistake to the matching entry (creating it if missing).
 * Returns a NEW entry (pure function) — callers persist it.
 */
export function applyMistake(
  existing: ErrorDnaEntry | undefined,
  input: MistakeInput,
): ErrorDnaEntry {
  const at = input.at ?? nowIso();
  const base = existing ?? emptyEntry(input);
  const severity = clamp(Math.round(input.severity), 1, 5);
  const isRecurrence = base.occurrenceCount > 0;

  const nextOccurrence = base.occurrenceCount + 1;
  const recurrenceWeight = isRecurrence
    ? DNA_CONFIG.RECUR_STEP * Math.min(base.occurrenceCount, DNA_CONFIG.RECUR_CAP)
    : DNA_CONFIG.BASE_STEP;
  const severityWeight = DNA_CONFIG.SEVERITY_UNIT * severity;
  const delta = recurrenceWeight + severityWeight;

  return {
    ...base,
    subject: input.subject,
    topic: input.topic,
    errorDescription: input.errorDescription ?? base.errorDescription,
    evidence: mergeEvidence(base.evidence, input.evidence),
    occurrenceCount: nextOccurrence,
    recentOccurrence: at,
    severity,
    confidence: input.confidence ?? base.confidence,
    score: round1(clamp(base.score + delta, DNA_CONFIG.SCORE_MIN, DNA_CONFIG.SCORE_MAX)),
    lastUpdated: at,
  };
}

export interface CorrectionInput {
  confidence: Confidence;
  at?: string;
}

/**
 * Apply a successful correction (user solved a problem of this error type).
 * Lowers the score and raises improvementScore.
 */
export function applyCorrection(entry: ErrorDnaEntry, input: CorrectionInput): ErrorDnaEntry {
  const at = input.at ?? nowIso();
  const confLevel = CONFIDENCE_LEVEL[input.confidence];
  const correctionWeight = DNA_CONFIG.CORRECTION_STEP + DNA_CONFIG.CONFIDENCE_UNIT * confLevel;

  return {
    ...entry,
    score: round1(clamp(entry.score - correctionWeight, DNA_CONFIG.SCORE_MIN, DNA_CONFIG.SCORE_MAX)),
    improvementScore: entry.improvementScore + DNA_CONFIG.IMPROVEMENT_UNIT,
    lastUpdated: at,
  };
}

/**
 * Gentle recency decay for an entry that has not recurred. Score never falls
 * below a floor proportional to occurrenceCount (a persistent pattern keeps
 * some residual risk). Pure function.
 */
export function applyDecay(entry: ErrorDnaEntry, at: string = nowIso()): ErrorDnaEntry {
  const days = daysBetween(entry.recentOccurrence, at);
  if (days <= 0) return entry;
  const floor = clamp(
    entry.occurrenceCount * DNA_CONFIG.OCCURRENCE_FLOOR_UNIT,
    DNA_CONFIG.SCORE_MIN,
    DNA_CONFIG.SCORE_MAX,
  );
  const decayed = entry.score - DNA_CONFIG.DECAY_PER_DAY * days;
  const next = round1(clamp(decayed, floor, DNA_CONFIG.SCORE_MAX));
  if (next === entry.score) return entry;
  return { ...entry, score: next, lastUpdated: at };
}

function mergeEvidence(prev: string[], add?: string[]): string[] {
  if (!add || add.length === 0) return prev;
  const merged = [...prev, ...add];
  // keep last 6 distinct evidence snippets
  const seen = new Set<string>();
  const out: string[] = [];
  for (let i = merged.length - 1; i >= 0 && out.length < 6; i -= 1) {
    const e = merged[i]!;
    if (!seen.has(e)) {
      seen.add(e);
      out.unshift(e);
    }
  }
  return out;
}

/** Find the matching entry for an error type (across subjects/topics). */
export function findEntry(
  entries: ErrorDnaEntry[],
  errorType: ErrorType,
): ErrorDnaEntry | undefined {
  return entries.find((e) => e.errorType === errorType);
}

/** The strongest (highest-score) error type — the Trap Mode target. */
export function strongestErrorType(entries: ErrorDnaEntry[]): ErrorDnaEntry | undefined {
  if (entries.length === 0) return undefined;
  return [...entries].sort((a, b) => b.score - a.score)[0];
}

/** Upsert an entry into a list by (errorType) key, returning a new array. */
export function upsertEntry(entries: ErrorDnaEntry[], next: ErrorDnaEntry): ErrorDnaEntry[] {
  const idx = entries.findIndex((e) => e.errorType === next.errorType);
  if (idx === -1) return [...entries, next];
  const copy = [...entries];
  copy[idx] = next;
  return copy;
}
