import type { TrapProblem, ErrorType } from './types';

/**
 * Deterministic evaluation of a trap attempt. Pure functions (no LLM) so the
 * HIT/극복 outcome is reproducible and testable.
 */

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '');
}

export function checkAnswer(trap: Pick<TrapProblem, 'answerType' | 'correctAnswer'>, answer: string): boolean {
  const type = trap.answerType;
  const correct = trap.correctAnswer;
  if (type === 'numeric') {
    const na = parseFloat(answer.replace(/[^0-9.+-eE]/g, ''));
    const nc = parseFloat(correct.replace(/[^0-9.+-eE]/g, ''));
    if (Number.isNaN(na) || Number.isNaN(nc)) return normalize(answer) === normalize(correct);
    return Math.abs(na - nc) < 1e-6;
  }
  if (type === 'mcq') {
    const a = new Set(answer.split(/[,/\s]+/).map(normalize).filter(Boolean));
    const c = new Set(correct.split(/[,/\s]+/).map(normalize).filter(Boolean));
    if (a.size !== c.size) return false;
    for (const x of c) if (!a.has(x)) return false;
    return true;
  }
  return normalize(answer) === normalize(correct);
}

/**
 * When the trap answer is wrong, infer which cognitive mistake the learner
 * made. For a trap the default assumption is that the learner fell for the
 * targeted mistake, unless the reasoning text clearly signals another pattern.
 * This drives the "Prediction HIT" judgement.
 */
export function inferTrapErrorType(
  trap: Pick<TrapProblem, 'targetErrorType'>,
  _answer: string,
  reasoning?: string,
): ErrorType {
  const text = (reasoning ?? '').toLowerCase();
  if (/빨리|급하게|대충|quick|rush/.test(text)) return 'rushed_reasoning';
  if (/단위|unit/.test(text)) return 'unit_error';
  if (/부호|sign|음수|negative/.test(text)) return 'sign_error';
  // Default: the learner fell for exactly the trap the problem was designed for.
  return trap.targetErrorType;
}
