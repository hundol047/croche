import type { AnswerType } from './types';

export type AnswerVerdict = 'correct' | 'incorrect' | 'ungradable';
export interface AnswerAssessment { verdict: AnswerVerdict; guidance: string }
type Question = { answerType: AnswerType; correctAnswer: string; options?: string[] };

const DECIMAL = '[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?';
const NUMBER = new RegExp(`^${DECIMAL}$`, 'i');
const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '');
const judged = (correct: boolean): AnswerAssessment => ({ verdict: correct ? 'correct' : 'incorrect', guidance: '' });
const unknown = (guidance: string): AnswerAssessment => ({ verdict: 'ungradable', guidance });

export class UngradableAnswerError extends Error {
  constructor(readonly guidance: string) { super('Answer cannot be graded safely'); }
}

function numeric(s: string): number | null {
  const text = s.trim();
  const fraction = text.match(new RegExp(`^(${DECIMAL})\\s*/\\s*(${DECIMAL})$`, 'i'));
  if (fraction) {
    const numerator = numeric(fraction[1]!), denominator = numeric(fraction[2]!);
    if (numerator === null || denominator === null || denominator === 0) return null;
    const value = numerator / denominator;
    return Number.isFinite(value) && (value !== 0 || numerator === 0) ? value : null;
  }
  if (!NUMBER.test(text)) return null;
  if (text.split(/[eE]/)[0]!.replace(/[^0-9]/g, '').replace(/^0+/, '').length > 15) return null;
  const n = Number(text);
  if (n === 0 && /[1-9]/.test(text.split(/[eE]/)[0]!)) return null;
  return Number.isFinite(n) ? n : null;
}

function interval(s: string): string | null {
  const m = s.trim().match(/^([[(])\s*([^,]+)\s*,\s*([^,]+)\s*([\])])$/);
  if (!m) return null;
  const left = numeric(m[2]!); const right = numeric(m[3]!);
  if (left === null || right === null || left > right) return null;
  return `${m[1]}${left},${right}${m[4]}`;
}

/** A bounded grammar for c*e^(k*x), NOT a general symbolic calculator. */
export function exponential(s: string): { coefficient: number; exponent: number } | null {
  // Removing whitespace must never join two numeric tokens ("3 0" → "30").
  if (/\d\s+\d/.test(s)) return null;
  const t = s.trim().replace(/\s+/g, '').replace(/−/g, '-');
  const m = t.match(/^([+-]?(?:(?:\d+(?:\.\d*)?|\.\d+)\*?)?)(?:e\^|exp)(\([^(){}]+\)|\{[^(){}]+\})$/i);
  if (!m) return null;
  const raw = m[1]!.replace(/\*$/, '');
  const coefficient = raw === '' || raw === '+' ? 1 : raw === '-' ? -1 : numeric(raw);
  const exponentText = m[2]!.slice(1, -1);
  const linear = exponentText.match(/^([+-]?(?:(?:\d+(?:\.\d*)?|\.\d+)\*?)?)x$/i);
  if (!linear) return null;
  const k = linear[1]!.replace(/\*$/, '');
  const exponent = k === '' || k === '+' ? 1 : k === '-' ? -1 : numeric(k);
  return coefficient === null || exponent === null ? null : { coefficient, exponent };
}

/** Only supported, fully parsed answers can be wrong; unsupported input is neutral. */
export function assessAnswer(question: Question, answer: string): AnswerAssessment {
  if (!answer.trim() || answer.length > 256) return unknown('답을 256자 이내로 입력해주세요.');
  if (question.answerType === 'numeric') {
    const a = numeric(answer); const c = numeric(question.correctAnswer);
    if (a === null || c === null) return unknown('단위를 제외한 숫자 또는 분수를 입력해주세요. 예: 20, 2e1, 1/2 (분모는 0이 될 수 없습니다)');
    return judged(a === c || Math.abs(a - c) < Math.min(1e-6, Math.abs(c) * 1e-6));
  }
  if (question.answerType === 'mcq') {
    if (normalize(answer) === normalize(question.correctAnswer)) return judged(true);
    const choices = (value: string) => value.split(/[,/\s]+/).map(normalize).filter(Boolean);
    // Full options may themselves contain spaces/commas; recognize them first.
    const option = question.options?.find((o) => normalize(o) === normalize(answer));
    if (option) return judged(normalize(option) === normalize(question.correctAnswer));
    const a = new Set(choices(answer)); const c = new Set(choices(question.correctAnswer));
    if (question.options && [...a].some((x) => !question.options!.some((o) => normalize(o) === x))) {
      return unknown('보기의 답을 그대로 입력해주세요. 복수 정답은 쉼표로 구분하세요.');
    }
    return judged(a.size === c.size && [...c].every((x) => a.has(x)));
  }
  const expectedExp = exponential(question.correctAnswer);
  if (expectedExp) {
    const actual = exponential(answer);
    if (!actual) return unknown('지수함수 답은 3e^(-2x) 또는 3*e^{-2*x} 형식으로 입력해주세요. 현재 복합 수식은 판정하지 않습니다.');
    return judged(actual.coefficient === expectedExp.coefficient && actual.exponent === expectedExp.exponent);
  }
  const expectedInterval = interval(question.correctAnswer);
  if (expectedInterval) {
    const actual = interval(answer);
    // A scalar is a valid, clearly different answer to an interval question.
    if (numeric(answer) !== null) return judged(false);
    return actual === null ? unknown('구간은 [-1,1)처럼 입력해주세요. 열린 끝점은 (), 닫힌 끝점은 []로 표시합니다.') : judged(actual === expectedInterval);
  }
  if (normalize(question.correctAnswer) === '정의되지않음') {
    if (['undefined', '정의안됨', '정의되지않음'].includes(normalize(answer))) return judged(true);
    if (numeric(answer) !== null) return judged(false);
    return unknown('숫자 또는 “정의되지 않음”으로 답해주세요.');
  }
  if (normalize(answer) === normalize(question.correctAnswer)) return judged(true);
  // Literal-output exercises (Python slicing) accept plain output strings.
  if (/^[a-z0-9_]+$/i.test(question.correctAnswer) && /^[a-z0-9_]+$/i.test(answer.trim())) return judged(false);
  return unknown('현재 이 답의 표기를 판정할 수 없습니다. 문제에 안내된 형식으로 다시 입력해주세요.');
}
