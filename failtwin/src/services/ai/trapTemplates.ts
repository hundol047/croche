import type { Subject, AnswerType, ErrorType } from '@/domain/types';

/**
 * Trap problem templates grouped by the cognitive mistake they target.
 *
 * Key design rule (R6.3): a trap for `condition_omission` must trigger the SAME
 * cognitive mistake but with genuinely NEW content — not the previous problem
 * with different numbers. Each target type below holds several distinct
 * scenarios across subjects so repeated taps surface different problems.
 */
export interface TrapTemplate {
  subject: Subject;
  topic: string;
  question: string;
  answerType: AnswerType;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  trapExplanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const TRAP_TEMPLATES: Record<ErrorType, TrapTemplate[]> = {
  condition_omission: [
    {
      subject: '공업수학',
      topic: '정의역 제약',
      question:
        'ln(x-2) + ln(5-x) 가 정의되는 x의 범위를 구하시오. (구간 형태, 예: (a,b) )',
      answerType: 'text',
      correctAnswer: '(2,5)',
      explanation: '두 로그 모두 진수>0 이어야 하므로 x-2>0 그리고 5-x>0 → 2<x<5.',
      trapExplanation:
        '한쪽 로그의 조건만 보고 범위를 넓게 잡기 쉽습니다. 두 조건의 교집합을 모두 반영해야 합니다.',
      difficulty: 'medium',
    },
    {
      subject: 'Python 프로그래밍',
      topic: '함수 전제조건',
      question:
        '다음 함수는 어떤 입력에서 예외가 납니까?\n\n    def avg(xs):\n        return sum(xs) / len(xs)\n\n보기 중 고르시오.',
      answerType: 'mcq',
      options: ['빈 리스트 []', '정수 리스트', '실수 리스트', '길이 1 리스트'],
      correctAnswer: '빈 리스트 []',
      explanation: '빈 리스트는 len==0 → ZeroDivisionError. 전제조건(비어있지 않음) 누락.',
      trapExplanation:
        '정상 입력만 떠올리고 "빈 입력" 조건을 빠뜨리기 쉬운 전형적인 조건 누락 상황입니다.',
      difficulty: 'medium',
    },
  ],
  edge_case_omission: [
    {
      subject: '공업수학',
      topic: '멱급수 끝점',
      question:
        'Σ ((-1)ⁿ xⁿ / √n) (n=1→∞)의 수렴구간을 끝점 포함 여부까지 구하시오.',
      answerType: 'text',
      correctAnswer: '(-1,1]',
      explanation:
        'R=1. x=1: 교대급수 Σ(-1)ⁿ/√n 수렴. x=-1: Σ1/√n 발산. 따라서 (-1,1].',
      trapExplanation:
        '수렴반경만 구하고 두 끝점 검사를 생략하면 틀립니다. 끝점을 각각 대입해 판정해야 합니다.',
      difficulty: 'hard',
    },
    {
      subject: 'Python 프로그래밍',
      topic: '슬라이스 경계',
      question:
        '다음 코드의 출력은?\n\n    s = "FAILTWIN"\n    print(s[2:7])',
      answerType: 'text',
      correctAnswer: 'ILTW',
      explanation: 's[2:7]은 인덱스 2,3,4,5,6 → "ILTW" (7은 미포함).',
      trapExplanation:
        '끝 인덱스가 포함된다고 착각하기 쉬운 경계 상황입니다. 슬라이스 끝은 배타적입니다.',
      difficulty: 'medium',
    },
    {
      subject: '일반물리',
      topic: '최고점 조건',
      question:
        '연직 위로 던진 공의 "최고점"에서 속도와 가속도는? 보기 중 고르시오.',
      answerType: 'mcq',
      options: ['v=0, a=0', 'v=0, a=g', 'v=g, a=0', 'v=g, a=g'],
      correctAnswer: 'v=0, a=g',
      explanation: '최고점에서 속도는 0이지만 중력가속도 g는 계속 작용합니다.',
      trapExplanation:
        '"멈췄으니 가속도도 0"이라는 경계 상황 오해를 유발합니다. 속도=0이어도 가속도는 g입니다.',
      difficulty: 'medium',
    },
  ],
  rushed_reasoning: [
    {
      subject: '일반물리',
      topic: '상대속도',
      question:
        '같은 방향으로 각각 60 km/h, 40 km/h로 달리는 두 차의 상대속도 크기는? (숫자만, km/h)',
      answerType: 'numeric',
      correctAnswer: '20',
      explanation: '같은 방향이므로 60-40=20 km/h. (반대 방향이면 100)',
      trapExplanation:
        '급하게 "두 수를 더한다"고 반응하기 쉽습니다. 방향 조건을 먼저 확인해야 합니다.',
      difficulty: 'easy',
    },
    {
      subject: '공업수학',
      topic: '0/0 극한',
      question: 'lim(x→0) sin(3x)/x 의 값을 구하시오. (숫자만)',
      answerType: 'numeric',
      correctAnswer: '3',
      explanation: 'sin(3x)/x = 3·sin(3x)/(3x) → 3·1 = 3.',
      trapExplanation:
        '성급하게 1이라고 답하기 쉽습니다. 계수 3을 반영해야 합니다.',
      difficulty: 'medium',
    },
  ],
  calculation_error: [
    {
      subject: '일반물리',
      topic: '운동에너지',
      question: '질량 2 kg, 속력 3 m/s인 물체의 운동에너지는? (숫자만, J)',
      answerType: 'numeric',
      correctAnswer: '9',
      explanation: 'KE = ½mv² = ½·2·9 = 9 J.',
      trapExplanation: 'v²을 빠뜨리거나 ½을 누락하기 쉬운 계산 단계가 포함되어 있습니다.',
      difficulty: 'easy',
    },
    {
      subject: '공업수학',
      topic: '합성함수 미분',
      question: 'f(x) = (2x+1)³ 일 때 f\'(x)를 구하시오.',
      answerType: 'text',
      correctAnswer: '6(2x+1)^2',
      explanation: '연쇄법칙: 3(2x+1)²·2 = 6(2x+1)².',
      trapExplanation: '내부 도함수 ×2를 빠뜨리는 계산 실수를 유발합니다.',
      difficulty: 'medium',
    },
  ],
  sign_error: [
    {
      subject: '공업수학',
      topic: '부정적분',
      question: '∫ (-2x) dx 를 구하시오. (C 포함, 예: -x^2 + C)',
      answerType: 'text',
      correctAnswer: '-x^2 + C',
      explanation: '∫-2x dx = -x² + C.',
      trapExplanation: '부호를 반대로 적기 쉬운 전형적 부호 오류 상황입니다.',
      difficulty: 'easy',
    },
  ],
  unit_error: [
    {
      subject: '일반물리',
      topic: '밀도 단위',
      question: '1 g/cm³ 는 몇 kg/m³ 인가? (숫자만)',
      answerType: 'numeric',
      correctAnswer: '1000',
      explanation: '1 g/cm³ = 1000 kg/m³.',
      trapExplanation: '단위 변환 배율(1000)을 빠뜨리기 쉬운 상황입니다.',
      difficulty: 'medium',
    },
  ],
  formula_selection_error: [
    {
      subject: '일반물리',
      topic: '에너지 보존 vs 운동방정식',
      question:
        '높이 h에서 자유낙하한 물체의 지면 도달 속력을 가장 간단히 구하는 식은? 보기 중 고르시오.',
      answerType: 'mcq',
      options: ['v=gt', 'v=√(2gh)', 'v=h/t', 'v=½gt²'],
      correctAnswer: 'v=√(2gh)',
      explanation: '시간 t를 모를 때는 에너지 보존 v=√(2gh)가 적절합니다.',
      trapExplanation: '습관적으로 v=gt를 고르게 되는, 공식 선택 오류 유발 문제입니다.',
      difficulty: 'medium',
    },
  ],
  concept_confusion: [
    {
      subject: 'Python 프로그래밍',
      topic: '얕은 복사 vs 깊은 복사',
      question:
        '다음 코드의 출력은?\n\n    a = [[0], [0]]\n    b = a[:]\n    b[0].append(1)\n    print(a[0])',
      answerType: 'text',
      correctAnswer: '[0, 1]',
      explanation: 'a[:]는 얕은 복사라 내부 리스트는 공유됩니다. a[0]도 [0,1].',
      trapExplanation: '"복사했으니 독립"이라는 개념 혼동을 유발합니다.',
      difficulty: 'hard',
    },
  ],
  misread_question: [
    {
      subject: '일반물리',
      topic: '묻는 값 확인',
      question:
        '10 m/s로 등속 운동하는 물체의 5초 "동안의 가속도"는? (숫자만, m/s²)',
      answerType: 'numeric',
      correctAnswer: '0',
      explanation: '등속 운동이므로 가속도는 0. (거리를 묻는 것이 아님)',
      trapExplanation: '거리(50)를 반사적으로 답하게 만드는, 문제 오독 유발 상황입니다.',
      difficulty: 'easy',
    },
  ],
  verification_omission: [
    {
      subject: '공업수학',
      topic: '무연근 검산',
      question: '√(x+6) = x 의 해를 모두 구하시오. (쉼표로 구분)',
      answerType: 'text',
      correctAnswer: '3',
      explanation: '양변 제곱: x²-x-6=0 → x=3 또는 x=-2. 검산하면 x=-2는 무연근. 해는 3.',
      trapExplanation:
        '제곱 후 검산을 생략하면 무연근 -2를 답에 포함하게 됩니다. 반드시 대입 검산이 필요합니다.',
      difficulty: 'medium',
    },
  ],
};
