import type { TrapProblem, ErrorType } from './types';

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '');
}

/** Accept complete numeric literals, never partial answers such as "20+1". */
function numericValue(s: string): number | null {
  const text = s.trim();
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

export function checkAnswer(trap: Pick<TrapProblem, 'answerType' | 'correctAnswer'>, answer: string): boolean {
  if (trap.answerType === 'numeric') {
    const a = numericValue(answer);
    const c = numericValue(trap.correctAnswer);
    return a !== null && c !== null && Math.abs(a - c) < 1e-6;
  }
  if (normalize(answer) === normalize(trap.correctAnswer)) return true;
  if (trap.answerType === 'mcq') {
    const a = new Set(answer.split(/[,/\s]+/).map(normalize).filter(Boolean));
    const c = new Set(trap.correctAnswer.split(/[,/\s]+/).map(normalize).filter(Boolean));
    return a.size === c.size && [...c].every((x) => a.has(x));
  }
  return false;
}

/** Only claim a HIT with evidence; a wrong answer alone proves no error type. */
export function inferTrapErrorType(
  trap: Pick<TrapProblem, 'targetErrorType' | 'targetedWrongAnswers'>,
  answer: string,
  reasoning?: string,
): ErrorType | undefined {
  const text = (reasoning ?? '').toLowerCase();
  if (/빨리|급하게|대충|quick|rush/.test(text)) return 'rushed_reasoning';
  if (/단위.*(?:생략|빠뜨|안|그대로)|unit.*(?:omit|ignore)/.test(text)) return 'unit_error';
  if (/부호.*(?:반대|빠뜨|실수)|sign.*(?:wrong|omit)/.test(text)) return 'sign_error';
  if (trap.targetedWrongAnswers?.some((a) => normalize(a) === normalize(answer))) {
    return trap.targetErrorType;
  }
  return undefined;
}
