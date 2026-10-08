import type { ErrorType, Problem } from './types';
import { assessAnswer, exponential } from './answerAssessment';
import { problemById } from '@/content/problems';

/** A wrong outcome does not establish its cause. Only bounded, checkable differences qualify. */
export function inferPracticeErrorType(problem: Problem, answer: string): ErrorType | undefined {
  if (assessAnswer(problem, answer).verdict !== 'incorrect') return undefined;
  const expected = exponential(problem.correctAnswer), actual = exponential(answer);
  if (expected && actual) {
    if ((expected.coefficient !== 0 && actual.coefficient === -expected.coefficient && actual.exponent === expected.exponent)
      || (expected.exponent !== 0 && actual.exponent === -expected.exponent && actual.coefficient === expected.coefficient)) return 'sign_error';
    return undefined;
  }
  const canonical = problemById(problem.id);
  if (!canonical || canonical.prompt !== problem.prompt || canonical.correctAnswer !== problem.correctAnswer) return undefined;
  const normalized = answer.replace(/\s/g, '').toLowerCase();
  const known: Record<string, string[]> = {
    'eng-math-1': ['(-1,1)', '[-1,1]', '(-1,1]'],
    'eng-math-3': ['2', '+2', '2.0'],
    'phys-2': ['72'],
    'py-1': ['15'],
  };
  return known[problem.id]?.includes(normalized) ? problem.targetErrorType : undefined;
}
