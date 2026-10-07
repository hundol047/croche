import type { Problem, Subject } from '@/domain/types';

/**
 * Pre-defined problem bank for the three demo subjects. Each problem embeds a
 * `targetErrorType`: the cognitive mistake it most readily triggers. This lets
 * the Mock (and a real model) reason about which error a wrong answer implies.
 */
export const PROBLEM_BANK: Problem[] = [
  // ───────────────────────── 공업수학 ─────────────────────────
  {
    id: 'eng-math-1',
    subject: '공업수학',
    topic: '급수의 수렴구간',
    prompt:
      '멱급수 Σ (xⁿ / n)  (n=1→∞) 의 수렴구간을 구하시오. 끝점 포함 여부까지 "구간" 형태로 답하시오. (예: [-1,1) )',
    answerType: 'text',
    correctAnswer: '[-1,1)',
    explanation:
      '비율판정으로 수렴반경 R=1. 끝점 검사: x=1이면 Σ1/n 발산, x=-1이면 교대급수로 수렴. 따라서 [-1,1).',
    difficulty: 'medium',
    source: 'bank',
    targetErrorType: 'edge_case_omission',
  },
  {
    id: 'eng-math-2',
    subject: '공업수학',
    topic: '1계 선형 미분방정식',
    prompt: "y' + 2y = 0, y(0)=3 의 해 y(x)를 구하시오.",
    answerType: 'text',
    correctAnswer: '3e^{-2x}',
    explanation: '특성방정식 r+2=0 → r=-2. 일반해 y=Ce^{-2x}, y(0)=3 → C=3.',
    difficulty: 'easy',
    source: 'bank',
    targetErrorType: 'sign_error',
  },

  {
    id: 'eng-math-3',
    subject: '공업수학',
    topic: '약분과 정의역',
    prompt: 'f(x) = (x²-1)/(x-1)에서 f(1)의 값은? "정의되지 않음" 또는 숫자로 답하세요.',
    answerType: 'text',
    correctAnswer: '정의되지 않음',
    explanation: 'x≠1일 때만 x+1로 약분할 수 있습니다. 원래 식의 분모가 0인 x=1에서는 정의되지 않습니다.',
    difficulty: 'easy',
    source: 'bank',
    targetErrorType: 'condition_omission',
  },

  // ───────────────────────── 일반물리 ─────────────────────────
  {
    id: 'phys-1',
    subject: '일반물리',
    topic: '등가속도 운동',
    prompt:
      '정지 상태에서 2 m/s² 로 가속하는 물체가 5초 후 이동한 거리는 몇 m 인가? (숫자만, 단위 제외)',
    answerType: 'numeric',
    correctAnswer: '25',
    explanation: 's = ½at² = ½·2·5² = 25 m.',
    difficulty: 'easy',
    source: 'bank',
    targetErrorType: 'calculation_error',
  },
  {
    id: 'phys-2',
    subject: '일반물리',
    topic: '단위 변환',
    prompt:
      '72 km/h 로 달리는 자동차의 속력은 몇 m/s 인가? (숫자만)',
    answerType: 'numeric',
    correctAnswer: '20',
    explanation: '72 km/h × (1000 m / 3600 s) = 20 m/s.',
    difficulty: 'easy',
    source: 'bank',
    targetErrorType: 'unit_error',
  },

  // ───────────────────────── Python ─────────────────────────
  {
    id: 'py-1',
    subject: 'Python 프로그래밍',
    topic: '반복문 경계',
    prompt:
      '다음 코드의 출력은?\n\n    total = 0\n    for i in range(1, 5):\n        total += i\n    print(total)',
    answerType: 'numeric',
    correctAnswer: '10',
    explanation: 'range(1,5) → 1,2,3,4 (5 미포함). 합 = 1+2+3+4 = 10.',
    difficulty: 'easy',
    source: 'bank',
    targetErrorType: 'edge_case_omission',
  },
  {
    id: 'py-2',
    subject: 'Python 프로그래밍',
    topic: '리스트 vs 튜플',
    prompt:
      '다음 중 "불변(immutable)" 자료형을 모두 고르시오.',
    answerType: 'mcq',
    options: ['list', 'tuple', 'dict', 'str'],
    correctAnswer: 'tuple, str',
    explanation: 'tuple과 str은 불변. list와 dict는 가변. (복수 정답 표기)',
    difficulty: 'medium',
    source: 'bank',
    targetErrorType: 'concept_confusion',
  },
];

export function problemsBySubject(subject: Subject): Problem[] {
  return PROBLEM_BANK.filter((p) => p.subject === subject);
}

export function problemById(id: string): Problem | undefined {
  return PROBLEM_BANK.find((p) => p.id === id);
}

export const DEMO_SUBJECTS: Subject[] = ['공업수학', '일반물리', 'Python 프로그래밍'];
