import type { CurriculumUnit } from './curriculumUnits';
/** Original supplemental items; not official exams or certified coverage. Released IDs are append-only. */
export const CURRICULUM_SUPPLEMENTS: CurriculumUnit[] = [
  {
    "id": "supplement-20261008-elementary-data",
    "educationLevel": "elementary",
    "subject": "수학",
    "group": "3–4학년",
    "title": "표의 합계와 비교",
    "scope": "자료의 합·차이를 근거로 설명하기",
    "items": [
      {
        "prompt": "도서관 대출 권수는 월요일 18권, 화요일 24권, 수요일 21권입니다. 세 날의 대출 권수 합계는?",
        "correctAnswer": "63",
        "explanation": "18+24+21=63권입니다.",
        "answerType": "numeric",
        "difficulty": "easy"
      },
      {
        "prompt": "학급 설문 표: 사과 12명, 배 8명, 귤 10명. 한 명씩 응답했습니다. 사과 또는 배를 고른 학생이 전체에서 차지하는 비율을 분수 또는 소수로 쓰세요.",
        "correctAnswer": "0.666666666666667",
        "explanation": "전체 30명 중 20명입니다. 20/30=2/3≈0.666666666666667입니다.",
        "answerType": "numeric",
        "difficulty": "hard"
      }
    ]
  },
  {
    "id": "supplement-20261008-middle-coordinate",
    "educationLevel": "middle",
    "subject": "수학",
    "group": "1학년",
    "title": "좌표와 도형의 넓이",
    "scope": "좌표 차이·직각삼각형 넓이",
    "items": [
      {
        "prompt": "점 A(1,2)와 B(7,2)를 잇는 선분의 길이는? 좌표 한 칸의 길이는 1입니다.",
        "correctAnswer": "6",
        "explanation": "y좌표가 같으므로 x좌표 차이 7−1=6입니다.",
        "answerType": "numeric",
        "difficulty": "easy"
      },
      {
        "prompt": "A(−2,1), B(4,1), C(−2,5)가 만드는 삼각형의 넓이는? 좌표 한 칸의 길이는 1입니다.",
        "correctAnswer": "12.0",
        "explanation": "AB=6, AC=4이며 두 선분이 수직입니다. 넓이=6×4÷2=12입니다.",
        "answerType": "numeric",
        "difficulty": "hard"
      }
    ]
  },
  {
    "id": "supplement-20261008-high-piecewise",
    "educationLevel": "high",
    "subject": "수학",
    "group": "자료·독해 보충",
    "title": "구간별 함수와 경계값",
    "scope": "정의된 구간 확인·연속 조건",
    "items": [
      {
        "prompt": "f(x)=2x+1 (x<2), f(x)=x² (x≥2)입니다. f(2)의 값은?",
        "correctAnswer": "4",
        "explanation": "x=2는 x≥2 구간에 있으므로 2²=4입니다.",
        "answerType": "numeric",
        "difficulty": "easy"
      },
      {
        "prompt": "f(x)=ax+1 (x<2), f(x)=x² (x≥2)가 x=2에서 연속입니다. a의 값은?",
        "correctAnswer": "1.5",
        "explanation": "왼쪽 극한 2a+1과 f(2)=4가 같아야 합니다. 2a+1=4에서 a=3/2입니다.",
        "answerType": "numeric",
        "difficulty": "hard"
      }
    ]
  },
  {
    "id": "supplement-20261008-csat-conditional",
    "educationLevel": "csat",
    "subject": "수학",
    "group": "자료·독해 보충",
    "title": "조건부확률 자료 해석",
    "scope": "표의 전체와 조건 집단 구분",
    "items": [
      {
        "prompt": "학생 40명 중 동아리 A 가입자는 16명입니다. 무작위로 한 명을 뽑을 때 A 가입자일 확률은? 분수 또는 소수로 쓰세요.",
        "correctAnswer": "0.4",
        "explanation": "가입자 16명을 전체 40명으로 나누면 2/5=0.4입니다.",
        "answerType": "numeric",
        "difficulty": "easy"
      },
      {
        "prompt": "학생 50명 중 동아리 A 가입자는 20명, B 가입자는 15명, 둘 다 가입한 학생은 6명입니다. 뽑은 학생이 A 가입자임을 알 때 B에도 가입했을 확률은?",
        "correctAnswer": "0.3",
        "explanation": "조건 집단은 A 가입자 20명입니다. 그중 B 가입자 6명이므로 6/20=3/10=0.3입니다.",
        "answerType": "numeric",
        "difficulty": "hard"
      }
    ]
  },
  {
    "id": "supplement-20261008-middle-argument",
    "educationLevel": "middle",
    "subject": "국어",
    "group": "2학년",
    "title": "주장과 근거 구분",
    "scope": "짧은 글의 논거·반례",
    "items": [
      {
        "prompt": "학교는 운동장에 나무를 심으면 그늘이 늘어난다는 이유로 식재를 제안했다. 학생들은 나무를 심을 위치에 따라 달리기 공간이 줄 수 있다고 말했다. 식재 제안의 직접 근거는?",
        "correctAnswer": "그늘이 늘어남",
        "explanation": "식재 제안은 그늘 증가를 이유로 들었습니다. 달리기 공간 감소는 학생들의 우려입니다.",
        "answerType": "mcq",
        "difficulty": "easy",
        "options": [
          "그늘이 늘어남",
          "달리기 공간이 줄어듦",
          "학생 수가 늘어남",
          "나무의 이름을 알 수 없음"
        ]
      },
      {
        "prompt": "반장이 “도서관을 늦게까지 열면 책 대출이 늘어난다”고 주장했다. 친구는 “지난달 연장 운영 때 방문자는 늘었지만 대출은 그대로였다”고 말했다. 친구가 제시한 자료의 역할은?",
        "correctAnswer": "주장이 항상 성립하지 않는 사례",
        "explanation": "방문 증가와 대출 증가를 구분하여 원래 주장이 항상 맞는지 검토하는 반례입니다.",
        "answerType": "mcq",
        "difficulty": "hard",
        "options": [
          "주장을 그대로 반복한 사례",
          "주장이 항상 성립하지 않는 사례",
          "연장 운영을 법으로 금지한 근거",
          "자료 없이 상대를 비난한 표현"
        ]
      }
    ]
  },
  {
    "id": "supplement-20261008-high-longreading",
    "educationLevel": "high",
    "subject": "국어",
    "group": "자료·독해 보충",
    "title": "장문 논증의 구조",
    "scope": "지표의 한계와 보완 절차",
    "items": [
      {
        "prompt": "한 마을은 여름철 물 사용을 줄이기 위해 가구별 절약률을 공개하려고 했다. 담당자는 절약률이 높은 가구에 같은 크기의 보상을 주면 참여가 늘 것이라고 생각했다. 그러나 주민들은 지난해 많이 사용한 가구가 조금만 줄여도 큰 절약량을 기록할 수 있고, 이미 적게 사용하던 가구는 더 줄이기 어렵다고 지적했다.\n\n회의에서는 두 가지 제안이 나왔다. 첫째는 전년 사용량 대비 감소율을 비교하는 방식이었다. 둘째는 가구원 수를 반영한 기준 사용량보다 얼마나 적게 사용하는지를 보는 방식이었다. 전자는 각 가구의 변화를 보기 쉽지만 과거 낭비가 보상의 출발점이 될 수 있었다. 후자는 현재 효율을 비교할 수 있지만 집에 머무는 시간이나 돌봄에 필요한 물 사용을 충분히 반영하지 못할 수 있었다.\n\n마을은 어느 한 지표가 곧 공정함을 뜻하지는 않는다고 결론 내렸다. 우선 각 지표로 결과를 따로 공개하고, 예외 조건을 설명할 수 있는 절차를 마련한 뒤 제도를 시범 운영하기로 했다. 이는 측정을 포기한 것이 아니라 지표가 놓치는 조건을 함께 검토하기 위한 선택이었다.\n\n두 번째 제안에서 비교하려는 것은?",
        "correctAnswer": "가구원 수를 반영한 기준 대비 현재 사용량",
        "explanation": "둘째 제안은 가구원 수를 반영한 기준 사용량보다 얼마나 적게 사용하는지를 비교합니다.",
        "answerType": "mcq",
        "difficulty": "easy",
        "options": [
          "지난해의 낭비량만",
          "가구원 수를 반영한 기준 대비 현재 사용량",
          "모든 가구의 보상 액수만",
          "나무가 만드는 그늘의 크기"
        ]
      },
      {
        "prompt": "한 마을은 여름철 물 사용을 줄이기 위해 가구별 절약률을 공개하려고 했다. 담당자는 절약률이 높은 가구에 같은 크기의 보상을 주면 참여가 늘 것이라고 생각했다. 그러나 주민들은 지난해 많이 사용한 가구가 조금만 줄여도 큰 절약량을 기록할 수 있고, 이미 적게 사용하던 가구는 더 줄이기 어렵다고 지적했다.\n\n회의에서는 두 가지 제안이 나왔다. 첫째는 전년 사용량 대비 감소율을 비교하는 방식이었다. 둘째는 가구원 수를 반영한 기준 사용량보다 얼마나 적게 사용하는지를 보는 방식이었다. 전자는 각 가구의 변화를 보기 쉽지만 과거 낭비가 보상의 출발점이 될 수 있었다. 후자는 현재 효율을 비교할 수 있지만 집에 머무는 시간이나 돌봄에 필요한 물 사용을 충분히 반영하지 못할 수 있었다.\n\n마을은 어느 한 지표가 곧 공정함을 뜻하지는 않는다고 결론 내렸다. 우선 각 지표로 결과를 따로 공개하고, 예외 조건을 설명할 수 있는 절차를 마련한 뒤 제도를 시범 운영하기로 했다. 이는 측정을 포기한 것이 아니라 지표가 놓치는 조건을 함께 검토하기 위한 선택이었다.\n\n마을이 시범 운영과 예외 설명 절차를 함께 택한 이유로 가장 적절한 것은?",
        "correctAnswer": "지표가 놓칠 수 있는 생활 조건을 함께 검토하려고",
        "explanation": "마지막 문단에서 지표가 놓치는 조건을 함께 검토하기 위한 선택임을 설명합니다.",
        "answerType": "mcq",
        "difficulty": "hard",
        "options": [
          "측정 결과를 모두 폐기하려고",
          "과거에 물을 많이 쓴 가구만 보상하려고",
          "지표가 놓칠 수 있는 생활 조건을 함께 검토하려고",
          "절약률 하나로 공정함을 확정했기 때문에"
        ]
      }
    ]
  },
  {
    "id": "supplement-20261008-csat-longreading",
    "educationLevel": "csat",
    "subject": "국어",
    "group": "자료·독해 보충",
    "title": "설명문의 사례 연결",
    "scope": "지도·평균 사례의 공통 논지",
    "items": [
      {
        "prompt": "지도는 복잡한 공간을 줄여 보여주는 도구다. 실제 크기 그대로의 지도는 세부를 모두 담을 수 있어도 사용자가 길을 찾기 어렵다. 따라서 지도 제작자는 무엇을 남기고 무엇을 생략할지 결정한다. 생략은 무조건 오류가 아니라 목적에 맞는 정보를 선택하는 과정이기도 하다.\n\n하지만 같은 생략도 사용 목적에 따라 다른 결과를 낳는다. 지하철 노선도에서는 역 사이의 실제 거리를 줄이고 연결 관계를 강조해도 환승 경로를 찾는 데 도움이 된다. 반면 그 노선도로 도보 시간을 계산하면 역 사이 거리가 비슷하다는 잘못된 인상을 줄 수 있다. 정보가 적다는 사실보다, 남긴 정보가 사용자의 질문에 적합한지가 중요하다.\n\n이 원리는 통계 요약에도 적용된다. 평균은 여러 값을 하나로 줄이지만 분포의 모양까지 전달하지 않는다. 평균 임금이 같은 두 집단도 일부 사람에게 임금이 집중된 정도는 다를 수 있다. 그러므로 요약값의 효용은 모든 정보를 대신하는 데 있지 않다. 어떤 비교에 유용하고 어떤 질문에는 추가 자료가 필요한지를 밝히는 데 있다.\n\n지하철 노선도에서 강조하는 정보는?",
        "correctAnswer": "역 사이의 연결 관계",
        "explanation": "두 번째 문단은 노선도가 실제 거리보다 연결 관계를 강조한다고 설명합니다.",
        "answerType": "mcq",
        "difficulty": "easy",
        "options": [
          "모든 건물의 높이",
          "역 사이의 연결 관계",
          "도보 시간의 정확한 값",
          "승객의 임금 분포"
        ]
      },
      {
        "prompt": "지도는 복잡한 공간을 줄여 보여주는 도구다. 실제 크기 그대로의 지도는 세부를 모두 담을 수 있어도 사용자가 길을 찾기 어렵다. 따라서 지도 제작자는 무엇을 남기고 무엇을 생략할지 결정한다. 생략은 무조건 오류가 아니라 목적에 맞는 정보를 선택하는 과정이기도 하다.\n\n하지만 같은 생략도 사용 목적에 따라 다른 결과를 낳는다. 지하철 노선도에서는 역 사이의 실제 거리를 줄이고 연결 관계를 강조해도 환승 경로를 찾는 데 도움이 된다. 반면 그 노선도로 도보 시간을 계산하면 역 사이 거리가 비슷하다는 잘못된 인상을 줄 수 있다. 정보가 적다는 사실보다, 남긴 정보가 사용자의 질문에 적합한지가 중요하다.\n\n이 원리는 통계 요약에도 적용된다. 평균은 여러 값을 하나로 줄이지만 분포의 모양까지 전달하지 않는다. 평균 임금이 같은 두 집단도 일부 사람에게 임금이 집중된 정도는 다를 수 있다. 그러므로 요약값의 효용은 모든 정보를 대신하는 데 있지 않다. 어떤 비교에 유용하고 어떤 질문에는 추가 자료가 필요한지를 밝히는 데 있다.\n\n글의 논지에 부합하는 판단은?",
        "correctAnswer": "요약 정보가 답할 수 있는 질문과 추가 자료가 필요한 질문을 구분한다",
        "explanation": "지도와 평균 모두 목적에 맞게 정보를 줄이는 도구이며 모든 질문을 대신할 수 없다는 것이 공통 논지입니다.",
        "answerType": "mcq",
        "difficulty": "hard",
        "options": [
          "생략된 정보가 있으면 그 요약은 언제나 쓸모없다",
          "평균 임금이 같으면 임금 분포도 반드시 같다",
          "노선도에 표시된 역 간 간격은 도보 시간을 정확히 나타낸다",
          "요약 정보가 답할 수 있는 질문과 추가 자료가 필요한 질문을 구분한다"
        ]
      }
    ]
  },
  {
    "id": "supplement-20261008-middle-english-reading",
    "educationLevel": "middle",
    "subject": "영어",
    "group": "2학년",
    "title": "안내문 정보 연결",
    "scope": "계획·일정·조건 확인",
    "items": [
      {
        "prompt": "The art club meets on Tuesday after school. Bring a pencil. Paint and paper are provided. What should a student bring?",
        "correctAnswer": "A pencil",
        "explanation": "안내문은 연필을 가져오고 물감과 종이는 제공된다고 말합니다.",
        "answerType": "mcq",
        "difficulty": "easy",
        "options": [
          "Paint",
          "Paper",
          "A pencil",
          "A projector"
        ]
      },
      {
        "prompt": "The museum opens at 10 a.m. The bus leaves at 9:30 and takes 20 minutes. Visitors wait outside until the museum opens. How long do visitors wait?",
        "correctAnswer": "10 minutes",
        "explanation": "9:30에 출발해 20분 뒤인 9:50 도착합니다. 10:00까지 10분 기다립니다.",
        "answerType": "mcq",
        "difficulty": "hard",
        "options": [
          "5 minutes",
          "10 minutes",
          "20 minutes",
          "30 minutes"
        ]
      }
    ]
  },
  {
    "id": "supplement-20261008-high-english-long",
    "educationLevel": "high",
    "subject": "영어",
    "group": "자료·독해 보충",
    "title": "장문 독해와 조사 해석",
    "scope": "조사 응답과 실제 이용의 차이",
    "items": [
      {
        "prompt": "A town library tested a new way to lend equipment. Instead of lending only books, it offered sewing machines, small tools, and board games. Before the trial, staff asked residents what they would borrow. Many people named a projector. Yet during the first month, projectors were borrowed only twice, while small repair tools were borrowed almost every day.\n\nThe staff did not conclude that the survey was useless. They noticed that the survey asked what people liked, but borrowing required a specific plan and a free afternoon. A projector sounded attractive even to residents who had no event scheduled. A screwdriver solved a problem that had already appeared at home. The library therefore added a question about when a resident expected to use an item.\n\nFor the second month, it also recorded unsuccessful requests. If every sewing machine was already borrowed, a resident could leave a request even without completing a loan. This gave staff information that completed loans alone could not show. They decided to compare the survey, completed loans, and unsuccessful requests before buying more equipment. No single count would be treated as a complete measure of demand.\n\nWhy did the library add a question about when an item would be used?",
        "correctAnswer": "To connect interest with a specific plan",
        "explanation": "둘째 문단에서 좋아하는 것과 구체적인 사용 계획이 다를 수 있어 사용 시점을 추가로 묻습니다.",
        "answerType": "mcq",
        "difficulty": "easy",
        "options": [
          "To stop lending all tools",
          "To connect interest with a specific plan",
          "To measure the weight of equipment",
          "To count only books"
        ]
      },
      {
        "prompt": "A town library tested a new way to lend equipment. Instead of lending only books, it offered sewing machines, small tools, and board games. Before the trial, staff asked residents what they would borrow. Many people named a projector. Yet during the first month, projectors were borrowed only twice, while small repair tools were borrowed almost every day.\n\nThe staff did not conclude that the survey was useless. They noticed that the survey asked what people liked, but borrowing required a specific plan and a free afternoon. A projector sounded attractive even to residents who had no event scheduled. A screwdriver solved a problem that had already appeared at home. The library therefore added a question about when a resident expected to use an item.\n\nFor the second month, it also recorded unsuccessful requests. If every sewing machine was already borrowed, a resident could leave a request even without completing a loan. This gave staff information that completed loans alone could not show. They decided to compare the survey, completed loans, and unsuccessful requests before buying more equipment. No single count would be treated as a complete measure of demand.\n\nWhat information could unsuccessful requests provide?",
        "correctAnswer": "Demand not represented by completed loans",
        "explanation": "이미 대출 중인 기기를 원하는 사람의 요청은 완료된 대출만으로 드러나지 않는 수요를 보여줍니다.",
        "answerType": "mcq",
        "difficulty": "hard",
        "options": [
          "Demand not represented by completed loans",
          "The color of every borrowed item",
          "Proof that all survey answers were false",
          "The exact cost of repairing homes"
        ]
      }
    ]
  },
  {
    "id": "supplement-20261008-csat-english-evidence",
    "educationLevel": "csat",
    "subject": "영어",
    "group": "자료·독해 보충",
    "title": "장문 독해와 결론의 범위",
    "scope": "통제 조건·일반화의 한계",
    "items": [
      {
        "prompt": "Students compared two gardens at their school. Garden A received more sunlight and had taller plants. Several students claimed that sunlight alone explained the difference. Their teacher asked them to list other differences. Garden A had also been watered more often, and the two gardens contained different kinds of plants.\n\nThe class designed a smaller experiment. They used plants of the same kind and age, gave each the same amount of water, and used the same soil. Half were placed in full sunlight and half in partial shade. They measured growth each week rather than only at the end. One plant in full sunlight was damaged by a ball, so they recorded the damage instead of silently removing its measurements.\n\nThe experiment could help answer a question about these plants under these conditions. It would not establish that every species grows best in full sunlight. The students agreed to report the controlled conditions and the unusual event along with their results. They also planned to repeat the experiment with another species before making a broader claim.\n\nWhy was the original comparison insufficient to isolate sunlight?",
        "correctAnswer": "Watering and plant types also differed",
        "explanation": "첫 문단에서는 두 정원의 물 주기와 식물 종류도 달랐다고 지적합니다.",
        "answerType": "mcq",
        "difficulty": "easy",
        "options": [
          "Both gardens had identical conditions",
          "Watering and plant types also differed",
          "No plant received any sunlight",
          "The teacher measured only soil color"
        ]
      },
      {
        "prompt": "Students compared two gardens at their school. Garden A received more sunlight and had taller plants. Several students claimed that sunlight alone explained the difference. Their teacher asked them to list other differences. Garden A had also been watered more often, and the two gardens contained different kinds of plants.\n\nThe class designed a smaller experiment. They used plants of the same kind and age, gave each the same amount of water, and used the same soil. Half were placed in full sunlight and half in partial shade. They measured growth each week rather than only at the end. One plant in full sunlight was damaged by a ball, so they recorded the damage instead of silently removing its measurements.\n\nThe experiment could help answer a question about these plants under these conditions. It would not establish that every species grows best in full sunlight. The students agreed to report the controlled conditions and the unusual event along with their results. They also planned to repeat the experiment with another species before making a broader claim.\n\nWhich conclusion is best supported by the passage?",
        "correctAnswer": "Results should be reported with their conditions and limits",
        "explanation": "마지막 문단은 통제 조건과 특이 사건을 보고하고 더 넓은 주장 전에 다른 종으로 반복해야 한다고 설명합니다.",
        "answerType": "mcq",
        "difficulty": "hard",
        "options": [
          "Every species must grow best in full sunlight",
          "Unusual measurements should always be hidden",
          "The original two gardens proved a universal rule",
          "Results should be reported with their conditions and limits"
        ]
      }
    ]
  },
  {
    "id": "supplement-20261008-middle-experiment",
    "educationLevel": "middle",
    "subject": "과학",
    "group": "2학년",
    "title": "실험의 변인과 자료",
    "scope": "통제 변인·증가량 비교",
    "items": [
      {
        "prompt": "같은 종류의 식물 두 화분에 같은 흙과 물을 주고 빛의 양만 다르게 했습니다. 성장 차이를 조사할 때 의도적으로 바꾼 변인은?",
        "correctAnswer": "빛의 양",
        "explanation": "흙, 물, 식물 종류는 같게 유지하고 빛의 양만 바꾸었으므로 조작 변인은 빛의 양입니다.",
        "answerType": "mcq",
        "difficulty": "easy",
        "options": [
          "물의 양",
          "흙의 종류",
          "식물의 종류",
          "빛의 양"
        ]
      },
      {
        "prompt": "높이가 처음에 모두 5 cm인 식물을 같은 조건에서 키웠습니다. 7일 뒤 밝은 곳 식물은 12 cm, 그늘 식물은 9 cm입니다. 밝은 곳의 증가량은 그늘의 증가량보다 몇 cm 큰가요?",
        "correctAnswer": "3",
        "explanation": "밝은 곳 증가량 7 cm, 그늘 증가량 4 cm이므로 차이는 3 cm입니다.",
        "answerType": "numeric",
        "difficulty": "hard"
      }
    ]
  },
  {
    "id": "supplement-20261008-high-experiment",
    "educationLevel": "high",
    "subject": "통합과학",
    "group": "자료·독해 보충",
    "title": "실험 자료와 해석 범위",
    "scope": "반복 측정·통제 조건·결론 범위",
    "items": [
      {
        "prompt": "같은 용액의 온도를 세 번 측정해 19°C, 20°C, 21°C를 얻었습니다. 측정값의 산술평균은?",
        "correctAnswer": "20.0",
        "explanation": "(19+20+21)÷3=20°C입니다. 평균이 모든 측정 오차를 없애는 것은 아닙니다.",
        "answerType": "numeric",
        "difficulty": "easy"
      },
      {
        "prompt": "실험에서 재료 A의 길이는 온도 10°C, 20°C, 30°C일 때 각각 100 mm, 102 mm, 104 mm였습니다. 다른 조건은 같았습니다. 자료만으로 뒷받침되는 해석은?",
        "correctAnswer": "측정한 온도 범위에서 A의 길이가 증가했다",
        "explanation": "자료는 A를 측정한 세 온도에서의 증가를 보여줍니다. 모든 재료나 측정 밖 온도에 같은 관계가 성립한다고 일반화할 수 없습니다.",
        "answerType": "mcq",
        "difficulty": "hard",
        "options": [
          "모든 재료는 어떤 온도에서도 길이가 반드시 증가한다",
          "온도 이외의 변인은 언제나 아무 영향이 없다",
          "측정한 온도 범위에서 A의 길이가 증가했다",
          "A는 100°C에서도 반드시 118 mm가 된다"
        ]
      }
    ]
  },
  {
    "id": "supplement-20261008-university-exception",
    "educationLevel": "university",
    "subject": "Python 프로그래밍",
    "group": "기초 전공",
    "title": "예외 처리와 자원 관리",
    "scope": "실행 흐름 추적·with 사용",
    "items": [
      {
        "prompt": "다음 Python 코드의 출력 숫자는? 코드를 실행하지 말고 흐름을 따라가세요.\ntry:\n    value = int(\"not-a-number\")\nexcept ValueError:\n    value = 7\nprint(value)",
        "correctAnswer": "7",
        "explanation": "int 변환이 ValueError를 발생시켜 except 블록에서 value=7이 됩니다.",
        "answerType": "numeric",
        "difficulty": "easy"
      },
      {
        "prompt": "파일을 열어 읽는 작업에서 with open(...) as f: 구문을 사용하는 이유로 적절한 것은?",
        "correctAnswer": "블록을 벗어날 때 파일 자원을 정리하기 위해",
        "explanation": "with는 컨텍스트 관리자를 통해 블록을 벗어날 때 자원 정리를 수행하도록 합니다. 읽기 성공이나 파일 존재를 보장하지는 않습니다.",
        "answerType": "mcq",
        "difficulty": "hard",
        "options": [
          "파일이 반드시 존재하도록 보장하기 위해",
          "모든 예외를 자동으로 무시하기 위해",
          "블록을 벗어날 때 파일 자원을 정리하기 위해",
          "파일 내용을 자동으로 암호화하기 위해"
        ]
      }
    ]
  }
];
