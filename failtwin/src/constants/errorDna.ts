/**
 * Error DNA scoring coefficients.
 *
 * The score update is DETERMINISTIC code (not the LLM). The LLM only classifies
 * the errorType and writes natural-language explanations. Tune these freely.
 *
 * Design goals:
 *  - A single first-time mistake should NOT spike the score (gentle BASE_STEP).
 *  - Repeated (recurrent) mistakes should grow faster.
 *  - Successful corrections lower the score.
 *  - Everything is clamped to [0, 100].
 */
export const DNA_CONFIG = {
  /** Added when a mistake happens for the first time (per entry). */
  BASE_STEP: 8,
  /** Extra per-recurrence step, multiplied by capped occurrenceCount. */
  RECUR_STEP: 6,
  /** Max occurrences counted toward recurrence weight (prevents runaway). */
  RECUR_CAP: 4,
  /** Multiplier for AI-reported severity (1..5). */
  SEVERITY_UNIT: 3,

  /** Base decrease when the user successfully corrects this error type. */
  CORRECTION_STEP: 7,
  /** Extra decrease scaled by the user's confidence level (0..2). */
  CONFIDENCE_UNIT: 2,
  /** improvementScore increment per successful correction. */
  IMPROVEMENT_UNIT: 5,

  /** Gentle daily decay when an error type has not recurred recently. */
  DECAY_PER_DAY: 0.5,
  /** Decay never pushes score below this floor while occurrences remain. */
  OCCURRENCE_FLOOR_UNIT: 4,

  SCORE_MIN: 0,
  SCORE_MAX: 100,
} as const;

/** Confidence label → numeric level used by the engine. */
export const CONFIDENCE_LEVEL: Record<'low' | 'medium' | 'high', number> = {
  low: 0,
  medium: 1,
  high: 2,
};
