import type { EducationLevel, Subject, Problem } from '@/domain/types';
import type { SchoolSpec } from './schoolTypes';
/** Authored learning outline, not a certified national achievement-standard map.
 * Released unit/question IDs and text are immutable. Corrections need a new version.
 */
export const CURRICULUM_BANK_VERSION = 'curriculum-v1';
export interface CurriculumUnit {
  id: string; educationLevel: EducationLevel; subject: Subject; group: string;
  title: string; scope: string; items: (SchoolSpec & { difficulty: Problem['difficulty'] })[];
}
export const CURRICULUM_UNITS: CurriculumUnit[] = [
  {
    "id": "elementary-place",
    "educationLevel": "elementary",
    "subject": "수학",
    "group": "1–2학년",
    "title": "수와 자릿값",
    "scope": "백·십·일의 자릿값",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "백의 자리 3, 십의 자리 4, 일의 자리 2인 수는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "342",
        "explanation": "300+40+2=342입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "백의 자리 5, 십의 자리 0, 일의 자리 8인 수에 90을 더한 수는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "598",
        "explanation": "508+90=598입니다. 0이 있는 자리를 유지합니다."
      }
    ]
  },
  {
    "id": "elementary-operations",
    "educationLevel": "elementary",
    "subject": "수학",
    "group": "1–2학년",
    "title": "덧셈과 뺄셈",
    "scope": "받아올림·받아내림",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "47+28의 값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "75",
        "explanation": "7+8=15를 받아올려 75입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "도서 83권에서 27권을 빌려주고 16권을 돌려받았습니다. 남은 책은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "72",
        "explanation": "83−27+16=72권입니다."
      }
    ]
  },
  {
    "id": "elementary-remainder",
    "educationLevel": "elementary",
    "subject": "수학",
    "group": "3–4학년",
    "title": "나눗셈과 나머지",
    "scope": "나머지의 의미",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "29를 4로 나눌 때 나머지는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "1",
        "explanation": "29=4×7+1입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "사람 29명이 한 차에 4명씩 탑니다. 모두 타려면 차가 최소 몇 대 필요한가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "8",
        "explanation": "7대에는 28명만 탑니다. 나머지 1명도 타야 하므로 8대입니다."
      }
    ]
  },
  {
    "id": "elementary-fraction",
    "educationLevel": "elementary",
    "subject": "수학",
    "group": "3–4학년",
    "title": "분수와 소수",
    "scope": "같은 분모의 분수·소수 계산",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "3/8+2/8의 분자는? 약분 전 값을 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "5",
        "explanation": "분모가 같아 분자는 3+2=5입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "리본 2.5 m에서 0.75 m와 0.6 m를 잘랐습니다. 남은 길이를 m로 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "1.15",
        "explanation": "2.5−0.75−0.6=1.15 m입니다."
      }
    ]
  },
  {
    "id": "elementary-angle",
    "educationLevel": "elementary",
    "subject": "수학",
    "group": "3–4학년",
    "title": "각과 삼각형",
    "scope": "내각의 합·각의 분할",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "삼각형의 두 내각이 50°, 60°입니다. 나머지 각은 몇 도인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "70",
        "explanation": "180−50−60=70°입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "직각을 두 각으로 나눴습니다. 한 각이 다른 각의 2배이면 작은 각은 몇 도인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "30",
        "explanation": "작은 각을 x라 하면 x+2x=90이므로 x=30°입니다."
      }
    ]
  },
  {
    "id": "elementary-fraction-multiply",
    "educationLevel": "elementary",
    "subject": "수학",
    "group": "5–6학년",
    "title": "분수의 곱셈",
    "scope": "분수의 곱·전체 양",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "12의 3/4은 얼마인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "9",
        "explanation": "12×3/4=9입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "물통이 가득 차면 18 L입니다. 2/3만큼 있던 물에서 1/4을 썼습니다. 남은 물은 몇 L인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "9",
        "explanation": "처음 물은 12 L, 남은 비율은 3/4이므로 12×3/4=9 L입니다."
      }
    ]
  },
  {
    "id": "elementary-area",
    "educationLevel": "elementary",
    "subject": "수학",
    "group": "5–6학년",
    "title": "평면도형의 넓이",
    "scope": "삼각형·원",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "밑변 8 cm, 높이 5 cm인 삼각형의 넓이는 몇 cm²인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "20",
        "explanation": "8×5÷2=20 cm²입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "반지름 4 cm인 원에서 반지름 2 cm인 원을 잘랐습니다. 원주율을 3으로 할 때 남은 넓이는 몇 cm²인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "36",
        "explanation": "3×4²−3×2²=48−12=36 cm²입니다."
      }
    ]
  },
  {
    "id": "elementary-volume",
    "educationLevel": "elementary",
    "subject": "수학",
    "group": "5–6학년",
    "title": "부피와 단위",
    "scope": "직육면체·mL와 L",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "가로 3 cm, 세로 4 cm, 높이 5 cm인 직육면체의 부피는 몇 cm³인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "60",
        "explanation": "3×4×5=60 cm³입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "한 병에 750 mL인 음료 4병을 모았습니다. 총 몇 L인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "3",
        "explanation": "750×4=3000 mL이고 1000 mL=1 L이므로 3 L입니다."
      }
    ]
  },
  {
    "id": "elementary-proportion",
    "educationLevel": "elementary",
    "subject": "수학",
    "group": "5–6학년",
    "title": "비와 비례",
    "scope": "비례배분",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "빨강:파랑=2:3이고 전체가 25개입니다. 파란 구슬은 몇 개인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "15",
        "explanation": "전체 5묶음이 25개이므로 파란 구슬은 3×5=15개입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "축척 1:20000인 지도에서 거리가 3 cm입니다. 실제 거리를 m로 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "600",
        "explanation": "3×20000=60000 cm=600 m입니다."
      }
    ]
  },
  {
    "id": "elementary-data",
    "educationLevel": "elementary",
    "subject": "수학",
    "group": "5–6학년",
    "title": "평균과 자료",
    "scope": "합과 평균",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "점수 6, 8, 10의 평균은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "8",
        "explanation": "(6+8+10)÷3=8입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "네 수의 평균은 9입니다. 세 수가 7, 8, 12일 때 나머지 수는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "9",
        "explanation": "전체 합 36에서 27을 빼면 9입니다."
      }
    ]
  },
  {
    "id": "middle-prime",
    "educationLevel": "middle",
    "subject": "수학",
    "group": "1학년",
    "title": "소인수분해",
    "scope": "약수·지수",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "12=2²×3입니다. 양의 약수의 개수는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "6",
        "explanation": "2의 지수는 0~2, 3의 지수는 0~1이므로 3×2=6개입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "72=2³×3²입니다. 72의 양의 약수 중 홀수는 몇 개인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "3",
        "explanation": "홀수는 2의 인수가 없어야 합니다. 1, 3, 9의 3개입니다."
      }
    ]
  },
  {
    "id": "middle-rational",
    "educationLevel": "middle",
    "subject": "수학",
    "group": "1학년",
    "title": "정수와 유리수",
    "scope": "부호·연산 순서",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "−3×(−4)+2의 값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "14",
        "explanation": "음수끼리 곱하면 양수입니다. 12+2=14입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "−2²+(−2)³의 값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "-12",
        "explanation": "−2²=−4, (−2)³=−8이므로 합은 −12입니다."
      }
    ]
  },
  {
    "id": "middle-equation",
    "educationLevel": "middle",
    "subject": "수학",
    "group": "1학년",
    "title": "일차방정식",
    "scope": "이항·해의 검산",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "3x−5=10의 해 x는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "5",
        "explanation": "3x=15이므로 x=5입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "0.5x+3=0.2x+6의 해 x는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "10",
        "explanation": "0.3x=3이므로 x=10입니다."
      }
    ]
  },
  {
    "id": "middle-function",
    "educationLevel": "middle",
    "subject": "수학",
    "group": "2학년",
    "title": "일차함수",
    "scope": "기울기·교점",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "점 (1,3), (3,7)을 지나는 직선의 기울기는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "(7−3)/(3−1)=2입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "y=2x+1과 y=−x+7의 교점의 x좌표는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "2x+1=−x+7에서 3x=6이므로 x=2입니다."
      }
    ]
  },
  {
    "id": "middle-similarity",
    "educationLevel": "middle",
    "subject": "수학",
    "group": "2학년",
    "title": "닮음",
    "scope": "길이와 넓이의 비",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "닮은 두 도형의 길이 비는 2:3입니다. 작은 도형의 넓이가 12일 때 큰 도형의 넓이는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "27",
        "explanation": "넓이 비는 4:9이므로 12×9/4=27입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "직각삼각형의 두 직각변이 6, 8입니다. 닮은 삼각형의 빗변이 15라면 그 삼각형의 가장 짧은 변은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "9",
        "explanation": "원래 빗변은 10입니다. 닮음비 15/10=1.5이므로 6×1.5=9입니다."
      }
    ]
  },
  {
    "id": "middle-probability",
    "educationLevel": "middle",
    "subject": "수학",
    "group": "2학년",
    "title": "확률",
    "scope": "표본공간·비복원 추출",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "공정한 주사위 1개를 던집니다. 3의 배수가 나올 확률을 소수로 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "0.333333",
        "explanation": "2개(3,6)/6=1/3입니다. 소수점 아래 6자리 반올림은 0.333333입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "빨강 2개, 파랑 3개에서 2개를 되돌려 놓지 않고 뽑습니다. 둘 다 빨강일 확률을 소수로 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "0.1",
        "explanation": "(2/5)×(1/4)=1/10=0.1입니다."
      }
    ]
  },
  {
    "id": "middle-quadratic",
    "educationLevel": "middle",
    "subject": "수학",
    "group": "3학년",
    "title": "이차방정식",
    "scope": "근과 조건",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "x²−5x+6=0의 두 근의 합은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "5",
        "explanation": "(x−2)(x−3)=0이므로 근의 합은 5입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "x²−5x+6=0의 해 중 x<2.5를 만족하는 해는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "두 근 2,3 중 조건을 만족하는 것은 2입니다."
      }
    ]
  },
  {
    "id": "middle-pythagoras",
    "educationLevel": "middle",
    "subject": "수학",
    "group": "3학년",
    "title": "피타고라스 정리",
    "scope": "거리·대각선",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "직각변이 5, 12인 직각삼각형의 빗변 길이는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "13",
        "explanation": "5²+12²=169=13²입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "가로 8, 세로 6인 직사각형의 대각선 위 점이 대각선을 2:3으로 나눕니다. 짧은 쪽 길이는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "4",
        "explanation": "대각선은 10입니다. 짧은 쪽은 10×2/5=4입니다."
      }
    ]
  },
  {
    "id": "middle-trigonometry",
    "educationLevel": "middle",
    "subject": "수학",
    "group": "3학년",
    "title": "삼각비",
    "scope": "특수각·높이",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "직각삼각형에서 30°의 맞은편 변이 4입니다. 빗변의 길이는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "8",
        "explanation": "sin30°=1/2이므로 빗변은 4÷(1/2)=8입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "사다리 길이가 10 m이고 땅과 이루는 각이 30°입니다. 사다리 윗끝의 높이를 m로 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "5",
        "explanation": "높이=10sin30°=5 m입니다."
      }
    ]
  },
  {
    "id": "middle-variance",
    "educationLevel": "middle",
    "subject": "수학",
    "group": "3학년",
    "title": "통계",
    "scope": "중앙값·분산",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "자료 1, 2, 2, 5, 9의 중앙값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "오름차순으로 놓인 다섯 값 중 세 번째 값은 2입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자료 1, 3, 5의 분산은? 편차 제곱의 합을 자료 수 3으로 나누고 소수점 아래 6자리로 반올림하세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2.666667",
        "explanation": "평균 3, 편차 제곱의 합 4+0+4=8이므로 분산은 8/3입니다."
      }
    ]
  },
  {
    "id": "high-hs-complex",
    "educationLevel": "high",
    "subject": "수학",
    "group": "공통·선택 과목",
    "title": "복소수와 이차방정식",
    "scope": "복소수 연산·판별식",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "i²=−1일 때 (1+i)(1−i)의 값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "1−i²=2입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "x²−4x+k=0이 중근을 가집니다. k는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "4",
        "explanation": "판별식 16−4k=0이므로 k=4입니다."
      }
    ]
  },
  {
    "id": "high-hs-sets",
    "educationLevel": "high",
    "subject": "수학",
    "group": "공통·선택 과목",
    "title": "집합과 명제",
    "scope": "교집합·여집합",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "|A|=8, |B|=7, |A∩B|=3입니다. |A∪B|는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "12",
        "explanation": "8+7−3=12입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "전체 학생 30명, A는 18명, B는 16명, 둘 다 해당하는 학생은 9명입니다. 둘 다 해당하지 않는 학생은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "5",
        "explanation": "합집합 18+16−9=25명, 여집합은 30−25=5명입니다."
      }
    ]
  },
  {
    "id": "high-hs-exponent",
    "educationLevel": "high",
    "subject": "수학",
    "group": "공통·선택 과목",
    "title": "지수와 로그",
    "scope": "지수 방정식·로그 성질",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "2^(x+1)=16의 해 x는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "3",
        "explanation": "16=2⁴이므로 x+1=4, x=3입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "log₂8+log₂4−log₂16의 값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "1",
        "explanation": "3+2−4=1입니다."
      }
    ]
  },
  {
    "id": "high-hs-trig",
    "educationLevel": "high",
    "subject": "수학",
    "group": "공통·선택 과목",
    "title": "삼각함수",
    "scope": "특수각·주기",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "sin(π/6)+cos(π/3)의 값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "1",
        "explanation": "각 값은 1/2이므로 합은 1입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "0≤x<2π에서 sin x=0을 만족하는 x는 몇 개인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "x=0, π입니다. 2π는 열린 끝점이라 제외합니다."
      }
    ]
  },
  {
    "id": "high-hs-sequence",
    "educationLevel": "high",
    "subject": "수학",
    "group": "공통·선택 과목",
    "title": "수열",
    "scope": "합·점화식",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "첫 항 2, 공차 3인 등차수열의 제5항은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "14",
        "explanation": "2+4×3=14입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "a₁=1, aₙ₊₁=2aₙ+1입니다. a₄는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "15",
        "explanation": "a₂=3, a₃=7, a₄=15입니다."
      }
    ]
  },
  {
    "id": "high-hs-limit",
    "educationLevel": "high",
    "subject": "수학",
    "group": "공통·선택 과목",
    "title": "극한과 연속",
    "scope": "인수분해·연속 조건",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "x→2일 때 (x²−4)/(x−2)의 극한은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "4",
        "explanation": "x≠2에서 x+2로 약분하여 극한은 4입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "x≠1이면 f(x)=(x²−1)/(x−1), x=1이면 f(1)=k입니다. f가 x=1에서 연속이 되게 하는 k는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "x→1의 극한은 x+1의 극한 2이므로 k=2입니다."
      }
    ]
  },
  {
    "id": "high-hs-calculus",
    "educationLevel": "high",
    "subject": "수학",
    "group": "공통·선택 과목",
    "title": "미분과 적분",
    "scope": "접선·정적분",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "f(x)=x³일 때 f′(2)는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "12",
        "explanation": "f′(x)=3x²이므로 f′(2)=12입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "f(x)=x²의 x=2에서의 접선의 y절편은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "-4",
        "explanation": "기울기 4, 접점 (2,4)이므로 y=4x−4입니다."
      }
    ]
  },
  {
    "id": "high-hs-statistics",
    "educationLevel": "high",
    "subject": "수학",
    "group": "공통·선택 과목",
    "title": "확률과 통계",
    "scope": "독립 시행·조건부확률",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "공정한 동전을 두 번 던집니다. 모두 앞면일 확률을 소수로 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "0.25",
        "explanation": "독립 시행이므로 (1/2)²=1/4입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "동전을 세 번 던졌고 첫 번째는 앞면이었습니다. 세 번 중 앞면이 정확히 두 번일 조건부확률을 소수로 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "0.5",
        "explanation": "남은 두 번에서 앞면이 정확히 한 번인 경우 HT, TH의 2개/4개이므로 0.5입니다."
      }
    ]
  },
  {
    "id": "high-hs-geometry",
    "educationLevel": "high",
    "subject": "수학",
    "group": "공통·선택 과목",
    "title": "좌표와 벡터",
    "scope": "거리·내적",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "점 (0,0)과 (3,4) 사이의 거리는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "5",
        "explanation": "√(3²+4²)=5입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "벡터 a=(2,−1), b=(3,4)의 내적은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "2×3+(−1)×4=2입니다."
      }
    ]
  },
  {
    "id": "csat-cs-complex",
    "educationLevel": "csat",
    "subject": "수학",
    "group": "수학 공통·선택 연습",
    "title": "복소수와 이차방정식",
    "scope": "복소수 연산·판별식",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "i²=−1일 때 (1+i)(1−i)의 값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "1−i²=2입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "x²−4x+k=0이 중근을 가집니다. k는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "4",
        "explanation": "판별식 16−4k=0이므로 k=4입니다."
      }
    ]
  },
  {
    "id": "csat-cs-sets",
    "educationLevel": "csat",
    "subject": "수학",
    "group": "수학 공통·선택 연습",
    "title": "집합과 명제",
    "scope": "교집합·여집합",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "|A|=8, |B|=7, |A∩B|=3입니다. |A∪B|는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "12",
        "explanation": "8+7−3=12입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "전체 학생 30명, A는 18명, B는 16명, 둘 다 해당하는 학생은 9명입니다. 둘 다 해당하지 않는 학생은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "5",
        "explanation": "합집합 18+16−9=25명, 여집합은 30−25=5명입니다."
      }
    ]
  },
  {
    "id": "csat-cs-exponent",
    "educationLevel": "csat",
    "subject": "수학",
    "group": "수학 공통·선택 연습",
    "title": "지수와 로그",
    "scope": "지수 방정식·로그 성질",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "2^(x+1)=16의 해 x는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "3",
        "explanation": "16=2⁴이므로 x+1=4, x=3입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "log₂8+log₂4−log₂16의 값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "1",
        "explanation": "3+2−4=1입니다."
      }
    ]
  },
  {
    "id": "csat-cs-trig",
    "educationLevel": "csat",
    "subject": "수학",
    "group": "수학 공통·선택 연습",
    "title": "삼각함수",
    "scope": "특수각·주기",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "sin(π/6)+cos(π/3)의 값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "1",
        "explanation": "각 값은 1/2이므로 합은 1입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "0≤x<2π에서 sin x=0을 만족하는 x는 몇 개인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "x=0, π입니다. 2π는 열린 끝점이라 제외합니다."
      }
    ]
  },
  {
    "id": "csat-cs-sequence",
    "educationLevel": "csat",
    "subject": "수학",
    "group": "수학 공통·선택 연습",
    "title": "수열",
    "scope": "합·점화식",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "첫 항 2, 공차 3인 등차수열의 제5항은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "14",
        "explanation": "2+4×3=14입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "a₁=1, aₙ₊₁=2aₙ+1입니다. a₄는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "15",
        "explanation": "a₂=3, a₃=7, a₄=15입니다."
      }
    ]
  },
  {
    "id": "csat-cs-limit",
    "educationLevel": "csat",
    "subject": "수학",
    "group": "수학 공통·선택 연습",
    "title": "극한과 연속",
    "scope": "인수분해·연속 조건",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "x→2일 때 (x²−4)/(x−2)의 극한은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "4",
        "explanation": "x≠2에서 x+2로 약분하여 극한은 4입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "x≠1이면 f(x)=(x²−1)/(x−1), x=1이면 f(1)=k입니다. f가 x=1에서 연속이 되게 하는 k는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "x→1의 극한은 x+1의 극한 2이므로 k=2입니다."
      }
    ]
  },
  {
    "id": "csat-cs-calculus",
    "educationLevel": "csat",
    "subject": "수학",
    "group": "수학 공통·선택 연습",
    "title": "미분과 적분",
    "scope": "접선·정적분",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "f(x)=x³일 때 f′(2)는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "12",
        "explanation": "f′(x)=3x²이므로 f′(2)=12입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "f(x)=x²의 x=2에서의 접선의 y절편은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "-4",
        "explanation": "기울기 4, 접점 (2,4)이므로 y=4x−4입니다."
      }
    ]
  },
  {
    "id": "csat-cs-statistics",
    "educationLevel": "csat",
    "subject": "수학",
    "group": "수학 공통·선택 연습",
    "title": "확률과 통계",
    "scope": "독립 시행·조건부확률",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "공정한 동전을 두 번 던집니다. 모두 앞면일 확률을 소수로 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "0.25",
        "explanation": "독립 시행이므로 (1/2)²=1/4입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "동전을 세 번 던졌고 첫 번째는 앞면이었습니다. 세 번 중 앞면이 정확히 두 번일 조건부확률을 소수로 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "0.5",
        "explanation": "남은 두 번에서 앞면이 정확히 한 번인 경우 HT, TH의 2개/4개이므로 0.5입니다."
      }
    ]
  },
  {
    "id": "csat-cs-geometry",
    "educationLevel": "csat",
    "subject": "수학",
    "group": "수학 공통·선택 연습",
    "title": "좌표와 벡터",
    "scope": "거리·내적",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "점 (0,0)과 (3,4) 사이의 거리는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "5",
        "explanation": "√(3²+4²)=5입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "벡터 a=(2,−1), b=(3,4)의 내적은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "2×3+(−1)×4=2입니다."
      }
    ]
  },
  {
    "id": "elementary-science-measure",
    "educationLevel": "elementary",
    "subject": "과학",
    "group": "3–4학년",
    "title": "측정과 관찰",
    "scope": "길이 변화 기록",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "식물의 길이가 12 cm에서 17 cm로 자랐습니다. 증가량은 몇 cm인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "5",
        "explanation": "17−12=5 cm입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "같은 식물을 3일 간격으로 재니 12, 16, 20 cm였습니다. 전체 6일 동안 하루 평균 증가량을 cm로 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "1.333333",
        "explanation": "전체 증가량 8 cm를 6일로 나눕니다. 소수점 아래 6자리로 반올림하면 1.333333 cm/일입니다."
      }
    ]
  },
  {
    "id": "elementary-science-electric",
    "educationLevel": "elementary",
    "subject": "과학",
    "group": "5–6학년",
    "title": "전기 회로",
    "scope": "닫힌 회로·도체",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "전지와 전구를 전선으로 연결했습니다. 불이 켜지려면 회로가 어떤 상태여야 하나요?",
        "answerType": "mcq",
        "correctAnswer": "전류가 흐를 수 있도록 닫혀 있어야 한다",
        "options": [
          "전류가 흐를 수 있도록 닫혀 있어야 한다",
          "회로가 끊어져 있어야 한다",
          "전지가 없어야 한다",
          "전구를 빼야 한다"
        ],
        "explanation": "전지가 있고 회로가 닫혀 전류가 흐를 때 전구가 켜집니다."
      },
      {
        "difficulty": "hard",
        "prompt": "전지·전선·전구로 만든 회로의 전선 사이를 재료로 이어 봅니다. 전류가 흐르기 쉬운 도체인 것은? 건조하고 깨끗한 재료를 가정합니다.",
        "answerType": "mcq",
        "correctAnswer": "구리선",
        "options": [
          "구리선",
          "고무줄",
          "플라스틱 자",
          "유리 막대"
        ],
        "explanation": "구리는 전류가 잘 흐르는 도체입니다. 고무·플라스틱·유리는 보통 절연에 쓰입니다."
      }
    ]
  },
  {
    "id": "middle-science-density",
    "educationLevel": "middle",
    "subject": "과학",
    "group": "1–3학년",
    "title": "물질의 성질",
    "scope": "밀도·단위",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "질량 54 g, 부피 20 cm³인 물체의 밀도는 몇 g/cm³인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2.7",
        "explanation": "밀도=54÷20=2.7 g/cm³입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "밀도 2 g/cm³인 물질 30 cm³와 밀도 3 g/cm³인 물질 20 cm³의 질량 합은 몇 g인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "120",
        "explanation": "60 g+60 g=120 g입니다. 부피 변화는 묻지 않습니다."
      }
    ]
  },
  {
    "id": "middle-science-reaction",
    "educationLevel": "middle",
    "subject": "과학",
    "group": "1–3학년",
    "title": "화학 반응",
    "scope": "질량 보존·반응비",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "밀폐 용기에서 반응물 12 g과 8 g이 모두 반응했습니다. 생성물의 전체 질량은 몇 g인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "20",
        "explanation": "질량 보존에 의해 12+8=20 g입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "수소와 산소의 반응 질량비는 1:8입니다. 수소 3 g, 산소 16 g을 넣었을 때 반응 후 남은 수소는 몇 g인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "1",
        "explanation": "산소 16 g은 수소 2 g과 반응하므로 수소 1 g이 남습니다."
      }
    ]
  },
  {
    "id": "high-science-energy",
    "educationLevel": "high",
    "subject": "통합과학",
    "group": "공통 과목",
    "title": "에너지와 효율",
    "scope": "유효 에너지·전력",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "입력 에너지 200 J 중 유용한 에너지가 150 J입니다. 효율을 %로 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "75",
        "explanation": "150/200×100=75%입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "50 W 장치를 2분 사용했습니다. 소비 에너지는 몇 J인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "6000",
        "explanation": "2분=120초이므로 E=Pt=50×120=6000 J입니다."
      }
    ]
  },
  {
    "id": "high-science-genetics",
    "educationLevel": "high",
    "subject": "통합과학",
    "group": "공통 과목",
    "title": "유전 정보",
    "scope": "주어진 염기 대응 규칙",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "DNA 두 가닥에서 A는 T, G는 C와 대응합니다. 한 가닥 AGTC의 상보 가닥에서 T는 몇 개인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "1",
        "explanation": "대응 가닥 TCAG에는 T가 1개입니다. 방향은 개수에 영향을 주지 않습니다."
      },
      {
        "difficulty": "hard",
        "prompt": "이중 가닥 DNA 전체의 염기 중 A가 20%입니다. G는 전체의 몇 %인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "30",
        "explanation": "A=T=20%, G+C=60%, G=C이므로 G=30%입니다."
      }
    ]
  },
  {
    "id": "csat-science-force",
    "educationLevel": "csat",
    "subject": "물리학Ⅰ",
    "group": "선택 과목 연습",
    "title": "역학",
    "scope": "등가속도·알짜힘",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "질량 2 kg인 물체에 알짜힘 6 N이 작용합니다. 가속도는 몇 m/s²인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "3",
        "explanation": "F=ma에서 a=6/2=3 m/s²입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "정지 상태에서 일정한 가속도 2 m/s²로 3초간 움직입니다. 이동 거리는 몇 m인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "9",
        "explanation": "s=(1/2)at²=(1/2)×2×9=9 m입니다."
      }
    ]
  },
  {
    "id": "csat-science-waves",
    "educationLevel": "csat",
    "subject": "물리학Ⅰ",
    "group": "선택 과목 연습",
    "title": "파동",
    "scope": "진동수·파장",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "진동수 5 Hz, 파장 2 m인 파동의 속력은 몇 m/s인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "10",
        "explanation": "v=fλ=5×2=10 m/s입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "같은 매질에서 파동 속력은 12 m/s입니다. 진동수가 3 Hz에서 6 Hz로 변할 때 새 파장은 몇 m인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "같은 매질의 속력은 12 m/s이므로 λ=12/6=2 m입니다."
      }
    ]
  },
  {
    "id": "elementary-korean-evidence",
    "educationLevel": "elementary",
    "subject": "국어",
    "group": "3–6학년",
    "title": "독해와 근거",
    "scope": "주장·근거의 구별",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "다음은 학생이 쓴 글입니다. “도서관 운영 시간을 늘리자. 수업이 끝난 뒤 도서관에서 공부하고 싶다는 학생이 많기 때문이다.” 글의 주장은?",
        "answerType": "mcq",
        "correctAnswer": "도서관 운영 시간을 늘리자",
        "options": [
          "도서관 운영 시간을 늘리자",
          "학생이 많다",
          "수업이 끝났다",
          "책을 사자"
        ],
        "explanation": "필자가 독자에게 받아들이도록 제안한 내용이 주장입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 자료: A반 30명 중 18명, B반 60명 중 30명이 도서관 연장에 찬성했다. 이 자료만으로 타당한 판단은?",
        "answerType": "mcq",
        "correctAnswer": "A반의 찬성 비율이 B반보다 높다",
        "options": [
          "A반의 찬성 비율이 B반보다 높다",
          "B반의 찬성 비율이 더 높다",
          "모든 학생이 찬성한다",
          "연장하면 성적이 반드시 오른다"
        ],
        "explanation": "A반은 60%, B반은 50%입니다. 성적에 대한 인과 관계는 알 수 없습니다."
      }
    ]
  },
  {
    "id": "elementary-korean-expression",
    "educationLevel": "elementary",
    "subject": "국어",
    "group": "3–6학년",
    "title": "문학과 표현",
    "scope": "비유·직유",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "자체 작성 문장: “달은 밤길을 비추는 등불 같다.” 쓰인 표현법은?",
        "answerType": "mcq",
        "correctAnswer": "직유",
        "options": [
          "직유",
          "반어",
          "설의",
          "과장"
        ],
        "explanation": "“같다”로 서로 다른 두 대상을 직접 비교한 직유입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 글: “운동장이 바다처럼 넓어 보였다. 나는 그 한가운데 선 작은 섬 같았다.” 화자의 심리를 가장 잘 뒷받침하는 부분은?",
        "answerType": "mcq",
        "correctAnswer": "작은 섬 같았다",
        "options": [
          "작은 섬 같았다",
          "운동장이 있었다",
          "바다가 실제로 있었다",
          "운동장에 섬이 생겼다"
        ],
        "explanation": "작은 섬이라는 비유는 넓은 공간 속 홀로 있는 느낌을 드러냅니다. 실제 바다나 섬을 뜻하지 않습니다."
      }
    ]
  },
  {
    "id": "elementary-english-grammar",
    "educationLevel": "elementary",
    "subject": "영어",
    "group": "3–6학년",
    "title": "문법과 문장",
    "scope": "수 일치·시제",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "빈칸에 알맞은 말: She ___ to school every day.",
        "answerType": "mcq",
        "correctAnswer": "goes",
        "options": [
          "goes",
          "go",
          "going",
          "gone"
        ],
        "explanation": "일반동사 현재형에서 3인칭 단수 주어에는 -s를 붙입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "빈칸에 알맞은 말: Tom and I ___ friends.",
        "answerType": "mcq",
        "correctAnswer": "are",
        "options": [
          "are",
          "is",
          "am",
          "be"
        ],
        "explanation": "Tom and I는 두 사람을 뜻하는 복수 주어이므로 are를 씁니다."
      }
    ]
  },
  {
    "id": "elementary-english-reading",
    "educationLevel": "elementary",
    "subject": "영어",
    "group": "3–6학년",
    "title": "영어 독해",
    "scope": "공지·조건 확인",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "자체 작성 공지: “The library closes at 5 p.m. Please return books before closing.” What should readers do?",
        "answerType": "mcq",
        "correctAnswer": "Return books before the library closes",
        "options": [
          "Return books before the library closes",
          "Return books tomorrow morning",
          "Buy new books",
          "Leave books at school"
        ],
        "explanation": "공지의 Please return books before closing이 근거입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 공지: “The workshop is free for students aged 12 to 15. Registration closes on Friday. A parent must sign the form.” Who meets all conditions?",
        "answerType": "mcq",
        "correctAnswer": "A 14-year-old with a signed form who registers Thursday",
        "options": [
          "A 14-year-old with a signed form who registers Thursday",
          "A 16-year-old who registers Thursday",
          "A 14-year-old who registers Saturday",
          "A 14-year-old without a signed form"
        ],
        "explanation": "나이, 금요일까지 등록, 부모 서명 세 조건을 모두 확인합니다."
      }
    ]
  },
  {
    "id": "elementary-social-data",
    "educationLevel": "elementary",
    "subject": "사회",
    "group": "3–6학년",
    "title": "사회 자료와 비율",
    "scope": "표본·비율의 해석",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "자체 작성 설문: 60명 중 24명이 버스로 등교합니다. 버스 등교 비율을 %로 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "40",
        "explanation": "8/20×100=40%입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 조사: 도서관을 자주 방문한 학생의 평균 성적이 더 높았다. 이 자료만으로 내릴 수 있는 결론은?",
        "answerType": "mcq",
        "correctAnswer": "두 변수 사이의 관련성이 관찰되었다",
        "options": [
          "두 변수 사이의 관련성이 관찰되었다",
          "도서관 방문이 반드시 성적을 올린다",
          "성적이 높으면 반드시 도서관에 간다",
          "다른 요인의 영향은 없다"
        ],
        "explanation": "관찰된 관련성만으로 인과 관계나 다른 요인 배제를 단정할 수 없습니다."
      }
    ]
  },
  {
    "id": "elementary-social-choice",
    "educationLevel": "elementary",
    "subject": "사회",
    "group": "3–6학년",
    "title": "선택과 비용",
    "scope": "주어진 조건에서의 기회비용",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "돈이 5000원이고 빵과 우유 중 하나만 살 수 있습니다. 빵을 선택해 포기한 최선의 대안은 우유입니다. 기회비용에 해당하는 것은?",
        "answerType": "mcq",
        "correctAnswer": "포기한 우유의 가치",
        "options": [
          "포기한 우유의 가치",
          "빵의 색깔",
          "두 상품을 모두 산 가치",
          "이미 먹은 아침 식사"
        ],
        "explanation": "기회비용은 선택으로 포기한 대안 중 가장 가치가 큰 대안의 가치입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "용돈이 5000원입니다. 1500원짜리 공책 한 권과 800원짜리 연필 두 자루를 사면 남은 돈은 몇 원인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "1900",
        "explanation": "5000−1500−800×2=1900원입니다."
      }
    ]
  },
  {
    "id": "middle-korean-evidence",
    "educationLevel": "middle",
    "subject": "국어",
    "group": "1–3학년",
    "title": "독해와 근거",
    "scope": "주장·근거의 구별",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "다음은 학생이 쓴 글입니다. “도서관 운영 시간을 늘리자. 수업이 끝난 뒤 도서관에서 공부하고 싶다는 학생이 많기 때문이다.” 글의 주장은?",
        "answerType": "mcq",
        "correctAnswer": "도서관 운영 시간을 늘리자",
        "options": [
          "도서관 운영 시간을 늘리자",
          "학생이 많다",
          "수업이 끝났다",
          "책을 사자"
        ],
        "explanation": "필자가 독자에게 받아들이도록 제안한 내용이 주장입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 자료: A반 40명 중 24명, B반 80명 중 40명이 도서관 연장에 찬성했다. 이 자료만으로 타당한 판단은?",
        "answerType": "mcq",
        "correctAnswer": "A반의 찬성 비율이 B반보다 높다",
        "options": [
          "A반의 찬성 비율이 B반보다 높다",
          "B반의 찬성 비율이 더 높다",
          "모든 학생이 찬성한다",
          "연장하면 성적이 반드시 오른다"
        ],
        "explanation": "A반은 60%, B반은 50%입니다. 성적에 대한 인과 관계는 알 수 없습니다."
      }
    ]
  },
  {
    "id": "middle-korean-expression",
    "educationLevel": "middle",
    "subject": "국어",
    "group": "1–3학년",
    "title": "문학과 표현",
    "scope": "비유·직유",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "자체 작성 문장: “달은 밤길을 비추는 등불 같다.” 쓰인 표현법은?",
        "answerType": "mcq",
        "correctAnswer": "직유",
        "options": [
          "직유",
          "반어",
          "설의",
          "과장"
        ],
        "explanation": "“같다”로 서로 다른 두 대상을 직접 비교한 직유입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 글: “운동장이 바다처럼 넓어 보였다. 나는 그 한가운데 선 작은 섬 같았다.” 화자의 심리를 가장 잘 뒷받침하는 부분은?",
        "answerType": "mcq",
        "correctAnswer": "작은 섬 같았다",
        "options": [
          "작은 섬 같았다",
          "운동장이 있었다",
          "바다가 실제로 있었다",
          "운동장에 섬이 생겼다"
        ],
        "explanation": "작은 섬이라는 비유는 넓은 공간 속 홀로 있는 느낌을 드러냅니다. 실제 바다나 섬을 뜻하지 않습니다."
      }
    ]
  },
  {
    "id": "middle-english-grammar",
    "educationLevel": "middle",
    "subject": "영어",
    "group": "1–3학년",
    "title": "문법과 문장",
    "scope": "수 일치·시제",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "빈칸에 알맞은 말: She ___ to school every day.",
        "answerType": "mcq",
        "correctAnswer": "goes",
        "options": [
          "goes",
          "go",
          "going",
          "gone"
        ],
        "explanation": "일반동사 현재형에서 3인칭 단수 주어에는 -s를 붙입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "빈칸에 알맞은 말: I ___ my homework yesterday.",
        "answerType": "mcq",
        "correctAnswer": "did",
        "options": [
          "did",
          "do",
          "does",
          "doing"
        ],
        "explanation": "yesterday는 과거 시점이므로 do의 과거형 did가 맞습니다."
      }
    ]
  },
  {
    "id": "middle-english-reading",
    "educationLevel": "middle",
    "subject": "영어",
    "group": "1–3학년",
    "title": "영어 독해",
    "scope": "공지·조건 확인",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "자체 작성 공지: “The library closes at 6 p.m. Please return books before closing.” What should readers do?",
        "answerType": "mcq",
        "correctAnswer": "Return books before the library closes",
        "options": [
          "Return books before the library closes",
          "Return books tomorrow morning",
          "Buy new books",
          "Leave books at school"
        ],
        "explanation": "공지의 Please return books before closing이 근거입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 공지: “The workshop is free for students aged 12 to 15. Registration closes on Friday. A parent must sign the form.” Who meets all conditions?",
        "answerType": "mcq",
        "correctAnswer": "A 14-year-old with a signed form who registers Thursday",
        "options": [
          "A 14-year-old with a signed form who registers Thursday",
          "A 16-year-old who registers Thursday",
          "A 14-year-old who registers Saturday",
          "A 14-year-old without a signed form"
        ],
        "explanation": "나이, 금요일까지 등록, 부모 서명 세 조건을 모두 확인합니다."
      }
    ]
  },
  {
    "id": "middle-social-data",
    "educationLevel": "middle",
    "subject": "사회",
    "group": "1–3학년",
    "title": "사회 자료와 비율",
    "scope": "표본·비율의 해석",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "자체 작성 설문: 80명 중 32명이 버스로 등교합니다. 버스 등교 비율을 %로 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "40",
        "explanation": "8/20×100=40%입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 조사: 도서관을 자주 방문한 학생의 평균 성적이 더 높았다. 이 자료만으로 내릴 수 있는 결론은?",
        "answerType": "mcq",
        "correctAnswer": "두 변수 사이의 관련성이 관찰되었다",
        "options": [
          "두 변수 사이의 관련성이 관찰되었다",
          "도서관 방문이 반드시 성적을 올린다",
          "성적이 높으면 반드시 도서관에 간다",
          "다른 요인의 영향은 없다"
        ],
        "explanation": "관찰된 관련성만으로 인과 관계나 다른 요인 배제를 단정할 수 없습니다."
      }
    ]
  },
  {
    "id": "middle-social-choice",
    "educationLevel": "middle",
    "subject": "사회",
    "group": "1–3학년",
    "title": "선택과 비용",
    "scope": "주어진 조건에서의 기회비용",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "돈이 5000원이고 빵과 우유 중 하나만 살 수 있습니다. 빵을 선택해 포기한 최선의 대안은 우유입니다. 기회비용에 해당하는 것은?",
        "answerType": "mcq",
        "correctAnswer": "포기한 우유의 가치",
        "options": [
          "포기한 우유의 가치",
          "빵의 색깔",
          "두 상품을 모두 산 가치",
          "이미 먹은 아침 식사"
        ],
        "explanation": "기회비용은 선택으로 포기한 대안 중 가장 가치가 큰 대안의 가치입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 상황: 활동 A의 편익은 100, 비용은 40입니다. A를 고르면 포기하는 최선의 대안의 순편익은 20입니다. A의 경제적 순편익을 편익−명시적 비용−포기한 순편익으로 계산하세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "40",
        "explanation": "100−40−20=40입니다. 이 문제는 편익과 비용을 동일한 척도로 제시합니다."
      }
    ]
  },
  {
    "id": "high-korean-evidence",
    "educationLevel": "high",
    "subject": "국어",
    "group": "공통·선택 과목",
    "title": "독해와 근거",
    "scope": "주장·근거의 구별",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "다음은 학생이 쓴 글입니다. “도서관 운영 시간을 늘리자. 수업이 끝난 뒤 도서관에서 공부하고 싶다는 학생이 많기 때문이다.” 글의 주장은?",
        "answerType": "mcq",
        "correctAnswer": "도서관 운영 시간을 늘리자",
        "options": [
          "도서관 운영 시간을 늘리자",
          "학생이 많다",
          "수업이 끝났다",
          "책을 사자"
        ],
        "explanation": "필자가 독자에게 받아들이도록 제안한 내용이 주장입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 자료: A반 50명 중 30명, B반 100명 중 50명이 도서관 연장에 찬성했다. 이 자료만으로 타당한 판단은?",
        "answerType": "mcq",
        "correctAnswer": "A반의 찬성 비율이 B반보다 높다",
        "options": [
          "A반의 찬성 비율이 B반보다 높다",
          "B반의 찬성 비율이 더 높다",
          "모든 학생이 찬성한다",
          "연장하면 성적이 반드시 오른다"
        ],
        "explanation": "A반은 60%, B반은 50%입니다. 성적에 대한 인과 관계는 알 수 없습니다."
      }
    ]
  },
  {
    "id": "high-korean-expression",
    "educationLevel": "high",
    "subject": "국어",
    "group": "공통·선택 과목",
    "title": "문학과 표현",
    "scope": "비유·직유",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "자체 작성 문장: “달은 밤길을 비추는 등불 같다.” 쓰인 표현법은?",
        "answerType": "mcq",
        "correctAnswer": "직유",
        "options": [
          "직유",
          "반어",
          "설의",
          "과장"
        ],
        "explanation": "“같다”로 서로 다른 두 대상을 직접 비교한 직유입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 글: “운동장이 바다처럼 넓어 보였다. 나는 그 한가운데 선 작은 섬 같았다.” 화자의 심리를 가장 잘 뒷받침하는 부분은?",
        "answerType": "mcq",
        "correctAnswer": "작은 섬 같았다",
        "options": [
          "작은 섬 같았다",
          "운동장이 있었다",
          "바다가 실제로 있었다",
          "운동장에 섬이 생겼다"
        ],
        "explanation": "작은 섬이라는 비유는 넓은 공간 속 홀로 있는 느낌을 드러냅니다. 실제 바다나 섬을 뜻하지 않습니다."
      }
    ]
  },
  {
    "id": "high-english-grammar",
    "educationLevel": "high",
    "subject": "영어",
    "group": "공통·선택 과목",
    "title": "문법과 문장",
    "scope": "수 일치·시제",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "빈칸에 알맞은 말: She ___ to school every day.",
        "answerType": "mcq",
        "correctAnswer": "goes",
        "options": [
          "goes",
          "go",
          "going",
          "gone"
        ],
        "explanation": "일반동사 현재형에서 3인칭 단수 주어에는 -s를 붙입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "빈칸에 알맞은 말: By the time I arrived yesterday, the train ___ already left.",
        "answerType": "mcq",
        "correctAnswer": "had",
        "options": [
          "had",
          "has",
          "have",
          "is"
        ],
        "explanation": "어제 도착한 과거 시점보다 앞선 출발을 과거완료 had left로 표현합니다."
      }
    ]
  },
  {
    "id": "high-english-reading",
    "educationLevel": "high",
    "subject": "영어",
    "group": "공통·선택 과목",
    "title": "영어 독해",
    "scope": "공지·조건 확인",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "자체 작성 공지: “The library closes at 7 p.m. Please return books before closing.” What should readers do?",
        "answerType": "mcq",
        "correctAnswer": "Return books before the library closes",
        "options": [
          "Return books before the library closes",
          "Return books tomorrow morning",
          "Buy new books",
          "Leave books at school"
        ],
        "explanation": "공지의 Please return books before closing이 근거입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 공지: “The workshop is free for students aged 12 to 15. Registration closes on Friday. A parent must sign the form.” Who meets all conditions?",
        "answerType": "mcq",
        "correctAnswer": "A 14-year-old with a signed form who registers Thursday",
        "options": [
          "A 14-year-old with a signed form who registers Thursday",
          "A 16-year-old who registers Thursday",
          "A 14-year-old who registers Saturday",
          "A 14-year-old without a signed form"
        ],
        "explanation": "나이, 금요일까지 등록, 부모 서명 세 조건을 모두 확인합니다."
      }
    ]
  },
  {
    "id": "high-social-data",
    "educationLevel": "high",
    "subject": "통합사회",
    "group": "공통·선택 과목",
    "title": "사회 자료와 비율",
    "scope": "표본·비율의 해석",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "자체 작성 설문: 100명 중 40명이 버스로 등교합니다. 버스 등교 비율을 %로 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "40",
        "explanation": "8/20×100=40%입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 조사: 도서관을 자주 방문한 학생의 평균 성적이 더 높았다. 이 자료만으로 내릴 수 있는 결론은?",
        "answerType": "mcq",
        "correctAnswer": "두 변수 사이의 관련성이 관찰되었다",
        "options": [
          "두 변수 사이의 관련성이 관찰되었다",
          "도서관 방문이 반드시 성적을 올린다",
          "성적이 높으면 반드시 도서관에 간다",
          "다른 요인의 영향은 없다"
        ],
        "explanation": "관찰된 관련성만으로 인과 관계나 다른 요인 배제를 단정할 수 없습니다."
      }
    ]
  },
  {
    "id": "high-social-choice",
    "educationLevel": "high",
    "subject": "통합사회",
    "group": "공통·선택 과목",
    "title": "선택과 비용",
    "scope": "주어진 조건에서의 기회비용",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "돈이 5000원이고 빵과 우유 중 하나만 살 수 있습니다. 빵을 선택해 포기한 최선의 대안은 우유입니다. 기회비용에 해당하는 것은?",
        "answerType": "mcq",
        "correctAnswer": "포기한 우유의 가치",
        "options": [
          "포기한 우유의 가치",
          "빵의 색깔",
          "두 상품을 모두 산 가치",
          "이미 먹은 아침 식사"
        ],
        "explanation": "기회비용은 선택으로 포기한 대안 중 가장 가치가 큰 대안의 가치입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 상황: 활동 A의 편익은 100, 비용은 40입니다. A를 고르면 포기하는 최선의 대안의 순편익은 20입니다. A의 경제적 순편익을 편익−명시적 비용−포기한 순편익으로 계산하세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "40",
        "explanation": "100−40−20=40입니다. 이 문제는 편익과 비용을 동일한 척도로 제시합니다."
      }
    ]
  },
  {
    "id": "csat-korean-evidence",
    "educationLevel": "csat",
    "subject": "국어",
    "group": "공통 영역 연습",
    "title": "독해와 근거",
    "scope": "주장·근거의 구별",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "다음은 학생이 쓴 글입니다. “도서관 운영 시간을 늘리자. 수업이 끝난 뒤 도서관에서 공부하고 싶다는 학생이 많기 때문이다.” 글의 주장은?",
        "answerType": "mcq",
        "correctAnswer": "도서관 운영 시간을 늘리자",
        "options": [
          "도서관 운영 시간을 늘리자",
          "학생이 많다",
          "수업이 끝났다",
          "책을 사자"
        ],
        "explanation": "필자가 독자에게 받아들이도록 제안한 내용이 주장입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 자료: A반 60명 중 36명, B반 120명 중 60명이 도서관 연장에 찬성했다. 이 자료만으로 타당한 판단은?",
        "answerType": "mcq",
        "correctAnswer": "A반의 찬성 비율이 B반보다 높다",
        "options": [
          "A반의 찬성 비율이 B반보다 높다",
          "B반의 찬성 비율이 더 높다",
          "모든 학생이 찬성한다",
          "연장하면 성적이 반드시 오른다"
        ],
        "explanation": "A반은 60%, B반은 50%입니다. 성적에 대한 인과 관계는 알 수 없습니다."
      }
    ]
  },
  {
    "id": "csat-korean-expression",
    "educationLevel": "csat",
    "subject": "국어",
    "group": "공통 영역 연습",
    "title": "문학과 표현",
    "scope": "비유·직유",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "자체 작성 문장: “달은 밤길을 비추는 등불 같다.” 쓰인 표현법은?",
        "answerType": "mcq",
        "correctAnswer": "직유",
        "options": [
          "직유",
          "반어",
          "설의",
          "과장"
        ],
        "explanation": "“같다”로 서로 다른 두 대상을 직접 비교한 직유입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 글: “운동장이 바다처럼 넓어 보였다. 나는 그 한가운데 선 작은 섬 같았다.” 화자의 심리를 가장 잘 뒷받침하는 부분은?",
        "answerType": "mcq",
        "correctAnswer": "작은 섬 같았다",
        "options": [
          "작은 섬 같았다",
          "운동장이 있었다",
          "바다가 실제로 있었다",
          "운동장에 섬이 생겼다"
        ],
        "explanation": "작은 섬이라는 비유는 넓은 공간 속 홀로 있는 느낌을 드러냅니다. 실제 바다나 섬을 뜻하지 않습니다."
      }
    ]
  },
  {
    "id": "csat-english-grammar",
    "educationLevel": "csat",
    "subject": "영어",
    "group": "공통 영역 연습",
    "title": "문법과 문장",
    "scope": "수 일치·시제",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "빈칸에 알맞은 말: She ___ to school every day.",
        "answerType": "mcq",
        "correctAnswer": "goes",
        "options": [
          "goes",
          "go",
          "going",
          "gone"
        ],
        "explanation": "일반동사 현재형에서 3인칭 단수 주어에는 -s를 붙입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "빈칸에 알맞은 말: By the time I arrived yesterday, the train ___ already left.",
        "answerType": "mcq",
        "correctAnswer": "had",
        "options": [
          "had",
          "has",
          "have",
          "is"
        ],
        "explanation": "어제 도착한 과거 시점보다 앞선 출발을 과거완료 had left로 표현합니다."
      }
    ]
  },
  {
    "id": "csat-english-reading",
    "educationLevel": "csat",
    "subject": "영어",
    "group": "공통 영역 연습",
    "title": "영어 독해",
    "scope": "공지·조건 확인",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "자체 작성 공지: “The library closes at 8 p.m. Please return books before closing.” What should readers do?",
        "answerType": "mcq",
        "correctAnswer": "Return books before the library closes",
        "options": [
          "Return books before the library closes",
          "Return books tomorrow morning",
          "Buy new books",
          "Leave books at school"
        ],
        "explanation": "공지의 Please return books before closing이 근거입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 공지: “The workshop is free for students aged 12 to 15. Registration closes on Friday. A parent must sign the form.” Who meets all conditions?",
        "answerType": "mcq",
        "correctAnswer": "A 14-year-old with a signed form who registers Thursday",
        "options": [
          "A 14-year-old with a signed form who registers Thursday",
          "A 16-year-old who registers Thursday",
          "A 14-year-old who registers Saturday",
          "A 14-year-old without a signed form"
        ],
        "explanation": "나이, 금요일까지 등록, 부모 서명 세 조건을 모두 확인합니다."
      }
    ]
  },
  {
    "id": "csat-social-data",
    "educationLevel": "csat",
    "subject": "사회·문화",
    "group": "공통 영역 연습",
    "title": "사회 자료와 비율",
    "scope": "표본·비율의 해석",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "자체 작성 설문: 120명 중 48명이 버스로 등교합니다. 버스 등교 비율을 %로 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "40",
        "explanation": "8/20×100=40%입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 조사: 도서관을 자주 방문한 학생의 평균 성적이 더 높았다. 이 자료만으로 내릴 수 있는 결론은?",
        "answerType": "mcq",
        "correctAnswer": "두 변수 사이의 관련성이 관찰되었다",
        "options": [
          "두 변수 사이의 관련성이 관찰되었다",
          "도서관 방문이 반드시 성적을 올린다",
          "성적이 높으면 반드시 도서관에 간다",
          "다른 요인의 영향은 없다"
        ],
        "explanation": "관찰된 관련성만으로 인과 관계나 다른 요인 배제를 단정할 수 없습니다."
      }
    ]
  },
  {
    "id": "csat-social-choice",
    "educationLevel": "csat",
    "subject": "사회·문화",
    "group": "공통 영역 연습",
    "title": "선택과 비용",
    "scope": "주어진 조건에서의 기회비용",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "돈이 5000원이고 빵과 우유 중 하나만 살 수 있습니다. 빵을 선택해 포기한 최선의 대안은 우유입니다. 기회비용에 해당하는 것은?",
        "answerType": "mcq",
        "correctAnswer": "포기한 우유의 가치",
        "options": [
          "포기한 우유의 가치",
          "빵의 색깔",
          "두 상품을 모두 산 가치",
          "이미 먹은 아침 식사"
        ],
        "explanation": "기회비용은 선택으로 포기한 대안 중 가장 가치가 큰 대안의 가치입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "자체 작성 상황: 활동 A의 편익은 100, 비용은 40입니다. A를 고르면 포기하는 최선의 대안의 순편익은 20입니다. A의 경제적 순편익을 편익−명시적 비용−포기한 순편익으로 계산하세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "40",
        "explanation": "100−40−20=40입니다. 이 문제는 편익과 비용을 동일한 척도로 제시합니다."
      }
    ]
  },
  {
    "id": "university-eng-ode",
    "educationLevel": "university",
    "subject": "공업수학",
    "group": "기초 전공",
    "title": "미분방정식",
    "scope": "미분방정식",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "y′+2y=0, y(0)=3입니다. y′(0)는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "-6",
        "explanation": "y′(0)=−2y(0)=−6입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "y′+2y=4, y(0)=1입니다. y″(0)는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "-4",
        "explanation": "y′(0)=2이고 y″=−2y′이므로 −4입니다."
      }
    ]
  },
  {
    "id": "university-eng-matrix",
    "educationLevel": "university",
    "subject": "공업수학",
    "group": "기초 전공",
    "title": "행렬과 연립방정식",
    "scope": "행렬과 연립방정식",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "행렬 [[2,1],[3,4]]의 행렬식은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "5",
        "explanation": "2×4−1×3=5입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "2x+y=5, x−y=1의 해에서 x는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "두 식을 더하면 3x=6이므로 x=2입니다."
      }
    ]
  },
  {
    "id": "university-eng-laplace",
    "educationLevel": "university",
    "subject": "공업수학",
    "group": "기초 전공",
    "title": "라플라스 변환",
    "scope": "라플라스 변환",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "s>0에서 상수 함수 f(t)=1의 라플라스 변환 F(s)=1/s입니다. F(2)는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "0.5",
        "explanation": "1/2=0.5입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "f(t)=t의 라플라스 변환은 F(s)=1/s² (s>0)입니다. F(2)는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "0.25",
        "explanation": "1/2²=1/4=0.25입니다."
      }
    ]
  },
  {
    "id": "university-eng-complex",
    "educationLevel": "university",
    "subject": "공업수학",
    "group": "기초 전공",
    "title": "복소수",
    "scope": "복소수",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "z=3+4i일 때 |z|는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "5",
        "explanation": "|z|=√(9+16)=5입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "z=1+i입니다. z²의 허수부는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "(1+i)²=1+2i+i²=2i이므로 허수부는 2입니다."
      }
    ]
  },
  {
    "id": "university-eng-partial",
    "educationLevel": "university",
    "subject": "공업수학",
    "group": "기초 전공",
    "title": "다변수 미분",
    "scope": "다변수 미분",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "f(x,y)=x²y에서 (1,2)의 x에 대한 편미분 값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "4",
        "explanation": "∂f/∂x=2xy이므로 4입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "f(x,y)=x²y+xy²입니다. (1,2)에서 혼합 편미분 ∂²f/∂y∂x는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "6",
        "explanation": "∂f/∂x=2xy+y²를 y로 미분하면 2x+2y=6입니다."
      }
    ]
  },
  {
    "id": "university-physics-kinematics",
    "educationLevel": "university",
    "subject": "일반물리",
    "group": "기초 전공",
    "title": "운동학",
    "scope": "운동학",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "정지 상태에서 가속도 3 m/s²로 2초간 움직인 물체의 속력은 몇 m/s인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "6",
        "explanation": "v=at=6 m/s입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "초기 속도 10 m/s, 일정한 가속도 −2 m/s²로 3초간 움직일 때 변위는 몇 m인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "21",
        "explanation": "s=v₀t+at²/2=30−9=21 m입니다."
      }
    ]
  },
  {
    "id": "university-physics-energy",
    "educationLevel": "university",
    "subject": "일반물리",
    "group": "기초 전공",
    "title": "일과 에너지",
    "scope": "일과 에너지",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "질량 2 kg, 속력 3 m/s인 물체의 운동 에너지는 몇 J인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "9",
        "explanation": "K=mv²/2=2×9/2=9 J입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "질량 2 kg인 물체를 5 m 들어 올립니다. g=10 m/s²일 때 중력 위치 에너지 증가량은 몇 J인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "100",
        "explanation": "mgh=2×10×5=100 J입니다."
      }
    ]
  },
  {
    "id": "university-physics-momentum",
    "educationLevel": "university",
    "subject": "일반물리",
    "group": "기초 전공",
    "title": "운동량 보존",
    "scope": "운동량 보존",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "질량 3 kg, 속도 4 m/s인 물체의 운동량은 몇 kg·m/s인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "12",
        "explanation": "p=mv=12 kg·m/s입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "질량 2 kg인 물체가 3 m/s로 움직이다 정지한 1 kg 물체와 붙습니다. 외력이 없을 때 충돌 후 속도는 몇 m/s인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "초기 운동량 6=(2+1)v이므로 v=2 m/s입니다."
      }
    ]
  },
  {
    "id": "university-physics-electric",
    "educationLevel": "university",
    "subject": "일반물리",
    "group": "기초 전공",
    "title": "전기와 자기",
    "scope": "전기와 자기",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "전압 12 V, 저항 4 Ω인 회로의 전류는 몇 A인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "3",
        "explanation": "I=V/R=3 A입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "저항 6 Ω 두 개를 병렬로 연결해 12 V를 걸었습니다. 전체 전류는 몇 A인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "4",
        "explanation": "합성 저항 3 Ω이므로 I=12/3=4 A입니다."
      }
    ]
  },
  {
    "id": "university-physics-heat",
    "educationLevel": "university",
    "subject": "일반물리",
    "group": "기초 전공",
    "title": "열역학",
    "scope": "열역학",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "물체가 열 100 J를 받고 외부에 일 30 J를 했습니다. 내부 에너지 증가량은 몇 J인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "70",
        "explanation": "ΔU=Q−W=100−30=70 J입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "이상적인 열기관이 고온 열원에서 500 J를 받아 저온 열원에 350 J를 버립니다. 효율을 %로 쓰세요.\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "30",
        "explanation": "일은 150 J, 효율은 150/500×100=30%입니다."
      }
    ]
  },
  {
    "id": "university-python-index",
    "educationLevel": "university",
    "subject": "Python 프로그래밍",
    "group": "기초 전공",
    "title": "인덱스와 슬라이스",
    "scope": "인덱스와 슬라이스",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "a=[10,20,30]입니다. a[1]의 값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "20",
        "explanation": "인덱스는 0부터 시작하므로 a[1]=20입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "a=[0,1,2,3,4,5]입니다. len(a[1:5:2])의 값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "슬라이스 인덱스 1,3의 두 원소를 선택합니다. 끝점 5는 제외합니다."
      }
    ]
  },
  {
    "id": "university-python-loop",
    "educationLevel": "university",
    "subject": "Python 프로그래밍",
    "group": "기초 전공",
    "title": "반복과 범위",
    "scope": "반복과 범위",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "len(range(2,7))의 값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "5",
        "explanation": "2,3,4,5,6의 다섯 값입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "sum(range(1,8,2))의 값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "16",
        "explanation": "1+3+5+7=16입니다. 코드를 실행하지 않고 수열을 확인합니다."
      }
    ]
  },
  {
    "id": "university-python-function",
    "educationLevel": "university",
    "subject": "Python 프로그래밍",
    "group": "기초 전공",
    "title": "함수와 반환값",
    "scope": "함수와 반환값",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "def double(x): return 2*x\ndouble(4)의 반환값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "8",
        "explanation": "함수 정의에 x=4를 대입하면 8입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "def f(x): return x+1\nf(f(3))의 반환값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "5",
        "explanation": "안쪽 f(3)=4를 구한 뒤 f(4)=5입니다."
      }
    ]
  },
  {
    "id": "university-python-alias",
    "educationLevel": "university",
    "subject": "Python 프로그래밍",
    "group": "기초 전공",
    "title": "가변 객체와 참조",
    "scope": "가변 객체와 참조",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "a=[1,2]; b=a; b.append(3)\nlen(a)의 값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "3",
        "explanation": "a와 b는 같은 리스트를 가리킵니다. append 후 길이는 3입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "a=[1,2]; b=a.copy(); b.append(3)\nlen(a)의 값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "2",
        "explanation": "copy로 만든 별도 리스트 b만 변경되므로 a의 길이는 2입니다."
      }
    ]
  },
  {
    "id": "university-python-complexity",
    "educationLevel": "university",
    "subject": "Python 프로그래밍",
    "group": "기초 전공",
    "title": "탐색과 계산량",
    "scope": "탐색과 계산량",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "정렬하지 않은 리스트 [7,3,9,1]에서 최솟값은?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "1",
        "explanation": "네 원소 중 가장 작은 값은 1입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "길이 8인 리스트의 모든 원소를 한 번씩 검사하는 선형 탐색이 최악의 경우 검사하는 원소 수는?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "8",
        "explanation": "끝까지 찾지 못하면 8개를 모두 검사합니다."
      }
    ]
  },
  {
    "id": "elementary-history-ancient",
    "educationLevel": "elementary",
    "subject": "한국사",
    "group": "5–6학년 · 사회의 역사 영역",
    "title": "삼국·남북국",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "삼국·남북국의 연표 자료를 읽으세요.\n가. 신라의 삼국 통일 (676년)\n나. 발해 건국 (698년)\n다. 백제 멸망 (660년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "660년의 백제 멸망이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "삼국·남북국의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 나당 연합군의 공격으로 백제가 멸망했다.\n나. 대조영이 고구려 유민 등을 이끌고 발해를 세웠다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "38",
        "explanation": "가: 백제 멸망(660년), 나: 발해 건국(698년)이므로 차는 38년입니다."
      }
    ]
  },
  {
    "id": "elementary-history-goryeo",
    "educationLevel": "elementary",
    "subject": "한국사",
    "group": "5–6학년 · 사회의 역사 영역",
    "title": "고려",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "고려의 연표 자료를 읽으세요.\n가. 서희의 외교 담판 (993년)\n나. 위화도 회군 (1388년)\n다. 고려 건국 (918년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "918년의 고려 건국이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "고려의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 왕건이 고려를 세웠다.\n나. 이성계가 위화도에서 군대를 돌려 개경으로 향했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "470",
        "explanation": "가: 고려 건국(918년), 나: 위화도 회군(1388년)이므로 차는 470년입니다."
      }
    ]
  },
  {
    "id": "elementary-history-joseon-early",
    "educationLevel": "elementary",
    "subject": "한국사",
    "group": "5–6학년 · 사회의 역사 영역",
    "title": "조선 전기",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "조선 전기의 연표 자료를 읽으세요.\n가. 임진왜란 발발 (1592년)\n나. 병자호란 (1636년)\n다. 조선 건국 (1392년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1392년의 조선 건국이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "조선 전기의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 이성계가 조선을 세웠다.\n나. 청이 조선을 침략해 조선이 남한산성에서 항전했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "244",
        "explanation": "가: 조선 건국(1392년), 나: 병자호란(1636년)이므로 차는 244년입니다."
      }
    ]
  },
  {
    "id": "elementary-history-joseon-late",
    "educationLevel": "elementary",
    "subject": "한국사",
    "group": "5–6학년 · 사회의 역사 영역",
    "title": "조선 후기",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "조선 후기의 연표 자료를 읽으세요.\n가. 병인양요 (1866년)\n나. 신미양요 (1871년)\n다. 균역법 실시 (1750년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1750년의 균역법 실시이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "조선 후기의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 영조가 군포 부담을 1년에 2필에서 1필로 줄였다.\n나. 미국 함대가 강화도를 침략했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "121",
        "explanation": "가: 균역법 실시(1750년), 나: 신미양요(1871년)이므로 차는 121년입니다."
      }
    ]
  },
  {
    "id": "elementary-history-opening",
    "educationLevel": "elementary",
    "subject": "한국사",
    "group": "5–6학년 · 사회의 역사 영역",
    "title": "개항·대한 제국",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "개항·대한 제국의 연표 자료를 읽으세요.\n가. 대한 제국 수립 (1897년)\n나. 국권 피탈 (1910년)\n다. 강화도 조약 체결 (1876년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1876년의 강화도 조약 체결이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "개항·대한 제국의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 조선이 일본과 강화도 조약을 체결했다.\n나. 일본이 한국을 강제로 병합했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "34",
        "explanation": "가: 강화도 조약 체결(1876년), 나: 국권 피탈(1910년)이므로 차는 34년입니다."
      }
    ]
  },
  {
    "id": "elementary-history-colonial",
    "educationLevel": "elementary",
    "subject": "한국사",
    "group": "5–6학년 · 사회의 역사 영역",
    "title": "일제 강점기",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "일제 강점기의 연표 자료를 읽으세요.\n가. 광주 학생 항일 운동 (1929년)\n나. 한국 광복군 창설 (1940년)\n다. 3·1 운동 (1919년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1919년의 3·1 운동이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "일제 강점기의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 독립 선언을 계기로 전국에서 만세 시위가 확산되었다.\n나. 대한민국 임시 정부가 충칭에서 한국 광복군을 창설했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "21",
        "explanation": "가: 3·1 운동(1919년), 나: 한국 광복군 창설(1940년)이므로 차는 21년입니다."
      }
    ]
  },
  {
    "id": "elementary-history-modern",
    "educationLevel": "elementary",
    "subject": "한국사",
    "group": "5–6학년 · 사회의 역사 영역",
    "title": "현대",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "현대의 연표 자료를 읽으세요.\n가. 4·19 혁명 (1960년)\n나. 남북한 유엔 동시 가입 (1991년)\n다. 광복 (1945년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1945년의 광복이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "현대의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 일본의 패전으로 한국이 식민 지배에서 해방되었다.\n나. 대한민국과 북한이 유엔에 함께 가입했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "46",
        "explanation": "가: 광복(1945년), 나: 남북한 유엔 동시 가입(1991년)이므로 차는 46년입니다."
      }
    ]
  },
  {
    "id": "middle-history-ancient",
    "educationLevel": "middle",
    "subject": "한국사",
    "group": "역사 연표 연습",
    "title": "삼국·남북국",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "삼국·남북국의 연표 자료를 읽으세요.\n가. 신라의 삼국 통일 (676년)\n나. 발해 건국 (698년)\n다. 백제 멸망 (660년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "660년의 백제 멸망이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "삼국·남북국의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 나당 연합군의 공격으로 백제가 멸망했다.\n나. 대조영이 고구려 유민 등을 이끌고 발해를 세웠다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "38",
        "explanation": "가: 백제 멸망(660년), 나: 발해 건국(698년)이므로 차는 38년입니다."
      }
    ]
  },
  {
    "id": "middle-history-goryeo",
    "educationLevel": "middle",
    "subject": "한국사",
    "group": "역사 연표 연습",
    "title": "고려",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "고려의 연표 자료를 읽으세요.\n가. 서희의 외교 담판 (993년)\n나. 위화도 회군 (1388년)\n다. 고려 건국 (918년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "918년의 고려 건국이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "고려의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 왕건이 고려를 세웠다.\n나. 이성계가 위화도에서 군대를 돌려 개경으로 향했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "470",
        "explanation": "가: 고려 건국(918년), 나: 위화도 회군(1388년)이므로 차는 470년입니다."
      }
    ]
  },
  {
    "id": "middle-history-joseon-early",
    "educationLevel": "middle",
    "subject": "한국사",
    "group": "역사 연표 연습",
    "title": "조선 전기",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "조선 전기의 연표 자료를 읽으세요.\n가. 임진왜란 발발 (1592년)\n나. 병자호란 (1636년)\n다. 조선 건국 (1392년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1392년의 조선 건국이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "조선 전기의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 이성계가 조선을 세웠다.\n나. 청이 조선을 침략해 조선이 남한산성에서 항전했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "244",
        "explanation": "가: 조선 건국(1392년), 나: 병자호란(1636년)이므로 차는 244년입니다."
      }
    ]
  },
  {
    "id": "middle-history-joseon-late",
    "educationLevel": "middle",
    "subject": "한국사",
    "group": "역사 연표 연습",
    "title": "조선 후기",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "조선 후기의 연표 자료를 읽으세요.\n가. 병인양요 (1866년)\n나. 신미양요 (1871년)\n다. 균역법 실시 (1750년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1750년의 균역법 실시이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "조선 후기의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 영조가 군포 부담을 1년에 2필에서 1필로 줄였다.\n나. 미국 함대가 강화도를 침략했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "121",
        "explanation": "가: 균역법 실시(1750년), 나: 신미양요(1871년)이므로 차는 121년입니다."
      }
    ]
  },
  {
    "id": "middle-history-opening",
    "educationLevel": "middle",
    "subject": "한국사",
    "group": "역사 연표 연습",
    "title": "개항·대한 제국",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "개항·대한 제국의 연표 자료를 읽으세요.\n가. 대한 제국 수립 (1897년)\n나. 국권 피탈 (1910년)\n다. 강화도 조약 체결 (1876년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1876년의 강화도 조약 체결이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "개항·대한 제국의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 조선이 일본과 강화도 조약을 체결했다.\n나. 일본이 한국을 강제로 병합했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "34",
        "explanation": "가: 강화도 조약 체결(1876년), 나: 국권 피탈(1910년)이므로 차는 34년입니다."
      }
    ]
  },
  {
    "id": "middle-history-colonial",
    "educationLevel": "middle",
    "subject": "한국사",
    "group": "역사 연표 연습",
    "title": "일제 강점기",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "일제 강점기의 연표 자료를 읽으세요.\n가. 광주 학생 항일 운동 (1929년)\n나. 한국 광복군 창설 (1940년)\n다. 3·1 운동 (1919년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1919년의 3·1 운동이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "일제 강점기의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 독립 선언을 계기로 전국에서 만세 시위가 확산되었다.\n나. 대한민국 임시 정부가 충칭에서 한국 광복군을 창설했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "21",
        "explanation": "가: 3·1 운동(1919년), 나: 한국 광복군 창설(1940년)이므로 차는 21년입니다."
      }
    ]
  },
  {
    "id": "middle-history-modern",
    "educationLevel": "middle",
    "subject": "한국사",
    "group": "역사 연표 연습",
    "title": "현대",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "현대의 연표 자료를 읽으세요.\n가. 4·19 혁명 (1960년)\n나. 남북한 유엔 동시 가입 (1991년)\n다. 광복 (1945년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1945년의 광복이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "현대의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 일본의 패전으로 한국이 식민 지배에서 해방되었다.\n나. 대한민국과 북한이 유엔에 함께 가입했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "46",
        "explanation": "가: 광복(1945년), 나: 남북한 유엔 동시 가입(1991년)이므로 차는 46년입니다."
      }
    ]
  },
  {
    "id": "high-history-ancient",
    "educationLevel": "high",
    "subject": "한국사",
    "group": "한국사 연표 연습",
    "title": "삼국·남북국",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "삼국·남북국의 연표 자료를 읽으세요.\n가. 신라의 삼국 통일 (676년)\n나. 발해 건국 (698년)\n다. 백제 멸망 (660년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "660년의 백제 멸망이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "삼국·남북국의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 나당 연합군의 공격으로 백제가 멸망했다.\n나. 대조영이 고구려 유민 등을 이끌고 발해를 세웠다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "38",
        "explanation": "가: 백제 멸망(660년), 나: 발해 건국(698년)이므로 차는 38년입니다."
      }
    ]
  },
  {
    "id": "high-history-goryeo",
    "educationLevel": "high",
    "subject": "한국사",
    "group": "한국사 연표 연습",
    "title": "고려",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "고려의 연표 자료를 읽으세요.\n가. 서희의 외교 담판 (993년)\n나. 위화도 회군 (1388년)\n다. 고려 건국 (918년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "918년의 고려 건국이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "고려의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 왕건이 고려를 세웠다.\n나. 이성계가 위화도에서 군대를 돌려 개경으로 향했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "470",
        "explanation": "가: 고려 건국(918년), 나: 위화도 회군(1388년)이므로 차는 470년입니다."
      }
    ]
  },
  {
    "id": "high-history-joseon-early",
    "educationLevel": "high",
    "subject": "한국사",
    "group": "한국사 연표 연습",
    "title": "조선 전기",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "조선 전기의 연표 자료를 읽으세요.\n가. 임진왜란 발발 (1592년)\n나. 병자호란 (1636년)\n다. 조선 건국 (1392년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1392년의 조선 건국이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "조선 전기의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 이성계가 조선을 세웠다.\n나. 청이 조선을 침략해 조선이 남한산성에서 항전했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "244",
        "explanation": "가: 조선 건국(1392년), 나: 병자호란(1636년)이므로 차는 244년입니다."
      }
    ]
  },
  {
    "id": "high-history-joseon-late",
    "educationLevel": "high",
    "subject": "한국사",
    "group": "한국사 연표 연습",
    "title": "조선 후기",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "조선 후기의 연표 자료를 읽으세요.\n가. 병인양요 (1866년)\n나. 신미양요 (1871년)\n다. 균역법 실시 (1750년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1750년의 균역법 실시이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "조선 후기의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 영조가 군포 부담을 1년에 2필에서 1필로 줄였다.\n나. 미국 함대가 강화도를 침략했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "121",
        "explanation": "가: 균역법 실시(1750년), 나: 신미양요(1871년)이므로 차는 121년입니다."
      }
    ]
  },
  {
    "id": "high-history-opening",
    "educationLevel": "high",
    "subject": "한국사",
    "group": "한국사 연표 연습",
    "title": "개항·대한 제국",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "개항·대한 제국의 연표 자료를 읽으세요.\n가. 대한 제국 수립 (1897년)\n나. 국권 피탈 (1910년)\n다. 강화도 조약 체결 (1876년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1876년의 강화도 조약 체결이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "개항·대한 제국의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 조선이 일본과 강화도 조약을 체결했다.\n나. 일본이 한국을 강제로 병합했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "34",
        "explanation": "가: 강화도 조약 체결(1876년), 나: 국권 피탈(1910년)이므로 차는 34년입니다."
      }
    ]
  },
  {
    "id": "high-history-colonial",
    "educationLevel": "high",
    "subject": "한국사",
    "group": "한국사 연표 연습",
    "title": "일제 강점기",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "일제 강점기의 연표 자료를 읽으세요.\n가. 광주 학생 항일 운동 (1929년)\n나. 한국 광복군 창설 (1940년)\n다. 3·1 운동 (1919년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1919년의 3·1 운동이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "일제 강점기의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 독립 선언을 계기로 전국에서 만세 시위가 확산되었다.\n나. 대한민국 임시 정부가 충칭에서 한국 광복군을 창설했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "21",
        "explanation": "가: 3·1 운동(1919년), 나: 한국 광복군 창설(1940년)이므로 차는 21년입니다."
      }
    ]
  },
  {
    "id": "high-history-modern",
    "educationLevel": "high",
    "subject": "한국사",
    "group": "한국사 연표 연습",
    "title": "현대",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "현대의 연표 자료를 읽으세요.\n가. 4·19 혁명 (1960년)\n나. 남북한 유엔 동시 가입 (1991년)\n다. 광복 (1945년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1945년의 광복이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "현대의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 일본의 패전으로 한국이 식민 지배에서 해방되었다.\n나. 대한민국과 북한이 유엔에 함께 가입했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "46",
        "explanation": "가: 광복(1945년), 나: 남북한 유엔 동시 가입(1991년)이므로 차는 46년입니다."
      }
    ]
  },
  {
    "id": "csat-history-ancient",
    "educationLevel": "csat",
    "subject": "한국사",
    "group": "한국사 공통 연습",
    "title": "삼국·남북국",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "삼국·남북국의 연표 자료를 읽으세요.\n가. 신라의 삼국 통일 (676년)\n나. 발해 건국 (698년)\n다. 백제 멸망 (660년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "660년의 백제 멸망이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "삼국·남북국의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 나당 연합군의 공격으로 백제가 멸망했다.\n나. 대조영이 고구려 유민 등을 이끌고 발해를 세웠다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "38",
        "explanation": "가: 백제 멸망(660년), 나: 발해 건국(698년)이므로 차는 38년입니다."
      }
    ]
  },
  {
    "id": "csat-history-goryeo",
    "educationLevel": "csat",
    "subject": "한국사",
    "group": "한국사 공통 연습",
    "title": "고려",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "고려의 연표 자료를 읽으세요.\n가. 서희의 외교 담판 (993년)\n나. 위화도 회군 (1388년)\n다. 고려 건국 (918년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "918년의 고려 건국이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "고려의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 왕건이 고려를 세웠다.\n나. 이성계가 위화도에서 군대를 돌려 개경으로 향했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "470",
        "explanation": "가: 고려 건국(918년), 나: 위화도 회군(1388년)이므로 차는 470년입니다."
      }
    ]
  },
  {
    "id": "csat-history-joseon-early",
    "educationLevel": "csat",
    "subject": "한국사",
    "group": "한국사 공통 연습",
    "title": "조선 전기",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "조선 전기의 연표 자료를 읽으세요.\n가. 임진왜란 발발 (1592년)\n나. 병자호란 (1636년)\n다. 조선 건국 (1392년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1392년의 조선 건국이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "조선 전기의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 이성계가 조선을 세웠다.\n나. 청이 조선을 침략해 조선이 남한산성에서 항전했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "244",
        "explanation": "가: 조선 건국(1392년), 나: 병자호란(1636년)이므로 차는 244년입니다."
      }
    ]
  },
  {
    "id": "csat-history-joseon-late",
    "educationLevel": "csat",
    "subject": "한국사",
    "group": "한국사 공통 연습",
    "title": "조선 후기",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "조선 후기의 연표 자료를 읽으세요.\n가. 병인양요 (1866년)\n나. 신미양요 (1871년)\n다. 균역법 실시 (1750년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1750년의 균역법 실시이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "조선 후기의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 영조가 군포 부담을 1년에 2필에서 1필로 줄였다.\n나. 미국 함대가 강화도를 침략했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "121",
        "explanation": "가: 균역법 실시(1750년), 나: 신미양요(1871년)이므로 차는 121년입니다."
      }
    ]
  },
  {
    "id": "csat-history-opening",
    "educationLevel": "csat",
    "subject": "한국사",
    "group": "한국사 공통 연습",
    "title": "개항·대한 제국",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "개항·대한 제국의 연표 자료를 읽으세요.\n가. 대한 제국 수립 (1897년)\n나. 국권 피탈 (1910년)\n다. 강화도 조약 체결 (1876년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1876년의 강화도 조약 체결이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "개항·대한 제국의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 조선이 일본과 강화도 조약을 체결했다.\n나. 일본이 한국을 강제로 병합했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "34",
        "explanation": "가: 강화도 조약 체결(1876년), 나: 국권 피탈(1910년)이므로 차는 34년입니다."
      }
    ]
  },
  {
    "id": "csat-history-colonial",
    "educationLevel": "csat",
    "subject": "한국사",
    "group": "한국사 공통 연습",
    "title": "일제 강점기",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "일제 강점기의 연표 자료를 읽으세요.\n가. 광주 학생 항일 운동 (1929년)\n나. 한국 광복군 창설 (1940년)\n다. 3·1 운동 (1919년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1919년의 3·1 운동이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "일제 강점기의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 독립 선언을 계기로 전국에서 만세 시위가 확산되었다.\n나. 대한민국 임시 정부가 충칭에서 한국 광복군을 창설했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "21",
        "explanation": "가: 3·1 운동(1919년), 나: 한국 광복군 창설(1940년)이므로 차는 21년입니다."
      }
    ]
  },
  {
    "id": "csat-history-modern",
    "educationLevel": "csat",
    "subject": "한국사",
    "group": "한국사 공통 연습",
    "title": "현대",
    "scope": "일부 사건의 연표·학습용 설명(전문가 감수 전)",
    "items": [
      {
        "difficulty": "easy",
        "prompt": "현대의 연표 자료를 읽으세요.\n가. 4·19 혁명 (1960년)\n나. 남북한 유엔 동시 가입 (1991년)\n다. 광복 (1945년)\n가장 먼저 일어난 사건의 기호는?",
        "answerType": "mcq",
        "correctAnswer": "다",
        "options": [
          "다",
          "가",
          "나",
          "세 사건은 같은 해이다"
        ],
        "explanation": "1945년의 광복이 가장 먼저입니다."
      },
      {
        "difficulty": "hard",
        "prompt": "현대의 학습용 요약입니다. 사료 인용이 아닙니다.\n가. 일본의 패전으로 한국이 식민 지배에서 해방되었다.\n나. 대한민국과 북한이 유엔에 함께 가입했다.\n두 사건이 일어난 연도의 차는 몇 년인가요?\n숫자만 입력하세요.",
        "answerType": "numeric",
        "correctAnswer": "46",
        "explanation": "가: 광복(1945년), 나: 남북한 유엔 동시 가입(1991년)이므로 차는 46년입니다."
      }
    ]
  }
];
export function curriculumUnits(level: EducationLevel, subject: Subject) {
  return CURRICULUM_UNITS.filter(u => u.educationLevel === level && u.subject === subject);
}
export function curriculumProblem(unit: CurriculumUnit, index: number): Problem {
  const item = unit.items[index];
  if (!Number.isInteger(index) || !item) throw new Error('단원 문항 범위를 벗어났습니다.');
  const seed = [...unit.id].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, index);
  const shift = item.options ? seed % item.options.length : 0;
  const options = item.options ? [...item.options.slice(shift), ...item.options.slice(0, shift)] : undefined;
  return { ...item, options, id: `${CURRICULUM_BANK_VERSION}:${unit.id}:${index}`, educationLevel: unit.educationLevel,
    subject: unit.subject, topic: unit.title, source: 'bank', contentOrigin: 'curriculum-original', curriculumUnitId: unit.id,
    targetErrorType: ['국어', '영어', '한국사', '사회', '통합사회', '사회·문화', 'Python 프로그래밍'].includes(unit.subject) ? 'concept_confusion' : 'calculation_error' };
}
