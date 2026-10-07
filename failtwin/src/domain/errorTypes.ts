/**
 * Error Type taxonomy for Error DNA.
 * These are the common, built-in cognitive-mistake categories. The system is
 * extensible: the AI may surface a new errorType string not listed here, and
 * the engine/storage treat any string as a valid key (see ErrorType in types).
 */

export const KNOWN_ERROR_TYPES = [
  'condition_omission',
  'calculation_error',
  'concept_confusion',
  'sign_error',
  'unit_error',
  'formula_selection_error',
  'edge_case_omission',
  'rushed_reasoning',
  'misread_question',
  'verification_omission',
] as const;

export type KnownErrorType = (typeof KNOWN_ERROR_TYPES)[number];

/** AI may extend with new string keys; keep the open union. */
export type ErrorType = KnownErrorType | (string & {});

export interface ErrorTypeMeta {
  key: KnownErrorType;
  labelKo: string;
  description: string;
}

export const ERROR_TYPE_META: Record<KnownErrorType, ErrorTypeMeta> = {
  condition_omission: {
    key: 'condition_omission',
    labelKo: '조건 누락',
    description: '문제에 주어진 조건이나 제약을 빠뜨리고 풀이에 반영하지 않음',
  },
  calculation_error: {
    key: 'calculation_error',
    labelKo: '계산 실수',
    description: '개념은 맞지만 산술/대수 계산 과정에서 실수가 발생함',
  },
  concept_confusion: {
    key: 'concept_confusion',
    labelKo: '개념 혼동',
    description: '유사하지만 다른 개념을 혼동하여 잘못 적용함',
  },
  sign_error: {
    key: 'sign_error',
    labelKo: '부호 오류',
    description: '부호(+/-) 처리를 잘못하여 결과가 달라짐',
  },
  unit_error: {
    key: 'unit_error',
    labelKo: '단위 오류',
    description: '단위 변환/표기를 빠뜨리거나 잘못 적용함',
  },
  formula_selection_error: {
    key: 'formula_selection_error',
    labelKo: '공식 선택 오류',
    description: '상황에 맞지 않는 공식/정리를 선택함',
  },
  edge_case_omission: {
    key: 'edge_case_omission',
    labelKo: '경계조건 누락',
    description: '끝점·경계·특수값 검토를 생략함',
  },
  rushed_reasoning: {
    key: 'rushed_reasoning',
    labelKo: '성급한 판단',
    description: '충분히 검토하지 않고 답을 빠르게 확정함',
  },
  misread_question: {
    key: 'misread_question',
    labelKo: '문제 오독',
    description: '문제에서 요구하는 바를 잘못 읽거나 해석함',
  },
  verification_omission: {
    key: 'verification_omission',
    labelKo: '검산 생략',
    description: '답을 확정하기 전 검산/검증 단계를 생략함',
  },
};

const KNOWN_SET = new Set<string>(KNOWN_ERROR_TYPES);

export function isKnownErrorType(key: string): key is KnownErrorType {
  return KNOWN_SET.has(key);
}

/** Human-readable Korean label for any errorType, including AI-extended ones. */
export function errorTypeLabel(key: ErrorType): string {
  if (isKnownErrorType(key)) return ERROR_TYPE_META[key].labelKo;
  return '새로운 실수 패턴';
}

export function errorTypeDescription(key: ErrorType): string {
  if (isKnownErrorType(key)) return ERROR_TYPE_META[key].description;
  return 'AI가 새로 발견한 실수 유형입니다.';
}
