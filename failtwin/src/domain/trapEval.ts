import type { TrapProblem, ErrorType } from './types';
import { assessAnswer } from './answerAssessment';

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '');
}

export function checkAnswer(trap: Pick<TrapProblem, 'answerType' | 'correctAnswer'>, answer: string): boolean {
  return assessAnswer(trap, answer).verdict === 'correct';
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
