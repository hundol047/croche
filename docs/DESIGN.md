# FailTwin 디자인 정리 · 2026-10-08

학생의 반복 실수와 다음 연습이 먼저 보이는 학습 도구로 정리했습니다.
잉크 블루, DNA의 얇은 눈금 선, 풀이 피드백의 읽기 순서를 공통 언어로 사용합니다.

## 전후 기준

이번 비교 기준은 `19df17b`입니다. 화면을 작은 패널과 장식으로 계속 나누는 대신, 실제 노트처럼
제목·본문·구분선·정렬로 읽는 순서를 정리했습니다.

| 이전 | 현재 | 이유 |
|---|---|---|
| 온보딩의 큰 홍보 제목과 AI 예측 문구 | ‘학습 기록 시작하기’와 바로 이어지는 필드 | 첫 작업과 필요한 입력을 명확하게 안내 |
| 홈 DNA를 감싼 둥근 카드 | 발생 횟수와 점수가 정렬된 기록 영역 | 기록 자체에 집중 |
| 풀이·분석 전체를 감싼 패널 | 문제와 피드백을 구분선으로 구성 | 긴 내용을 노트처럼 읽게 함 |
| 분석 아래쪽에 묻히는 주 버튼 | 다음 행동을 하단에 고정 | 작은 화면에서도 다음 동작을 쉽게 찾음 |
| 예측의 큰 실수 제목과 꽉 찬 위험 막대 | 관찰된 패턴·근거와 작은 점수 | 검증되지 않은 위험도를 과도하게 강조하지 않음 |
| Trap의 큰 어두운 홍보 패널·결과 fade | 확인할 조건과 짧은 설명, 정적인 결과 | 훈련 내용이 먼저 보이게 함 |
| 한 점뿐인 리포트 차트 | 해당 주의 수치와 추이 표시 조건 | 기록이 부족할 때 선 그래프로 변화가 있는 것처럼 보이지 않게 함 |
| ‘교정 완료 실수 N개’ | ‘정답으로 마친 연습 N회’ | 기존 집계가 정답 풀이 횟수임을 정확히 표현 |
| DNA 장식과 반복 pulse 로딩 | 표준 진행 표시와 수행 중인 작업 | 기다리는 이유를 간단히 알림 |

[이전 홈](screenshots/before-review/dashboard-375.png) → [현재 홈](screenshots/dashboard-375.png)
· [이전 분석](screenshots/before-review/analysis-375.png) → [현재 분석](screenshots/analysis-375.png)
· [이전 Trap](screenshots/before-review/trap-intro-375.png) → [현재 Trap](screenshots/trap-intro-375.png)
· [이전 리포트](screenshots/before-review/report-375.png) → [현재 리포트](screenshots/report-375.png).
`before-review/`는 기준 커밋의 실제 캡처와 이번 작업 전에 재현한 오채점 화면입니다.
이전 단계의 `before/` 캡처도 보존했습니다.

## 공통 기준

- 기존 잉크 블루 `#243F63`, 본문 `#202B3B`, 배경 `#F4F5F6` 유지.
  주의는 갈색, 정답·교정은 초록으로 표현하며 텍스트로 결과를 함께 안내합니다.
- 선택·버튼 8px, 입력 10px, 필요한 패널 12px. 일반 내용에는 그림자가 없습니다.
  대형 Trap 패널은 제거했습니다.
- 시스템 글꼴, 제목 24px·단락 제목 16px·본문 15px·보조 정보 12px.
  4px 기반 간격과 최대 600px 읽기 폭을 유지합니다.
- 최소 44px 선택·탐색 행, 48px 버튼·입력. 주요 글자·컨트롤 색은 이전에 계산한 대비를 유지합니다.
- 주 행동 한 개, 보조 동작은 탐색 행. 예시 데이터와 Mock 연결 상태는 읽을 수 있는 보조 텍스트로 공개합니다.
- 새 사용자에게 과거 기록이나 통계를 만들지 않습니다. 판정 불가 입력은 재입력 형식과 기록 미반영을 안내합니다.
- 외부 폰트·UI 프레임워크·아이콘 라이브러리는 추가하지 않았습니다.

DNA 점수 엔진과 리포트 집계는 유지했습니다. 채점과 출제 변경은 [채점 문서](GRADING.md)를 참고하세요.
심사 루프는 **83→100→91 / Trap 적중 1회·2회 중 50% / 정답으로 마친 연습 1회**입니다.

## 최종 프로덕션 캡처

2026-10-08의 최종 Web export를 실제 Chromium에서 실행한 화면입니다. 375/430px와 1440px 데스크톱을
나란히 검토했고, 데스크톱 앱의 최대 600px 열을 확인했습니다. 768px도 같은 기능·넘침 검사를
통과했습니다. 긴 분석의 [375px 아래쪽](screenshots/analysis-end-375.png)은 별도로 확인했습니다.

| 화면 | 375px | 430px | 1440px |
|---|---|---|---|
| 온보딩 | [375px](screenshots/onboarding-375.png) | [430px](screenshots/onboarding-430.png) | [1440px](screenshots/onboarding-1440.png) |
| 홈 · Error DNA | [375px](screenshots/dashboard-375.png) | [430px](screenshots/dashboard-430.png) | [1440px](screenshots/dashboard-1440.png) |
| 문제 목록 | [375px](screenshots/practice-375.png) | [430px](screenshots/practice-430.png) | [1440px](screenshots/practice-1440.png) |
| 답·풀이 입력 | [375px](screenshots/solve-375.png) | [430px](screenshots/solve-430.png) | [1440px](screenshots/solve-1440.png) |
| 풀이 분석 | [375px](screenshots/analysis-375.png) | [430px](screenshots/analysis-430.png) | [1440px](screenshots/analysis-1440.png) |
| 다음 실수 예측 | [375px](screenshots/prediction-375.png) | [430px](screenshots/prediction-430.png) | [1440px](screenshots/prediction-1440.png) |
| Trap 소개 | [375px](screenshots/trap-intro-375.png) | [430px](screenshots/trap-intro-430.png) | [1440px](screenshots/trap-intro-1440.png) |
| Prediction HIT | [375px](screenshots/trap-hit-375.png) | [430px](screenshots/trap-hit-430.png) | [1440px](screenshots/trap-hit-1440.png) |
| Trap 교정 | [375px](screenshots/trap-overcome-375.png) | [430px](screenshots/trap-overcome-430.png) | [1440px](screenshots/trap-overcome-1440.png) |
| 학습 리포트 | [375px](screenshots/report-375.png) | [430px](screenshots/report-430.png) | [1440px](screenshots/report-1440.png) |

보조 설정·긴 피드백은 세로 스크롤로 이어지지만 첫 화면에서 핵심 실수와 DNA 변화를 확인할 수 있습니다.
같은 데이터라도 기본 글꼴은 플랫폼에 따라 조금 다르게 보입니다. 네이티브 키보드·SafeArea와 실기기
동작은 이번 검증 범위에 포함되지 않았습니다. Real Croche는 NOT CONNECTED입니다.

검사 결과는 [QA 기록](QA.md), 정확한 발표 동작은 [심사 가이드](JUDGE_DEMO.md)를 참고하세요.

## 난이도별 문제 은행 화면 · 2026-10-08

이번 문제 목록 비교 기준은 `0a0e98f`입니다.
[이전 · 과목당 18개](screenshots/before-bank/practice-375.png) →
[현재 · 난이도·유형 선택](screenshots/practice-375.png).

기존에는 기본 문제를 다 읽은 뒤 아래의 생성 버튼을 찾았습니다. 지금은 과목·난이도를 고른 직후
‘새 문제 풀기’를 누를 수 있습니다. 난이도 설명과 남은 수를 짧게 표시하고,
원하는 유형은 얇은 구분선의 목록에서 고릅니다. 기본 문제 다시 풀기는 별도 영역에 유지했습니다.
전체 90,000개의 행이나 큰 숫자 카드 대신 선택한 난이도의 5개 유형만 보여줍니다.
조건 조합 문제의 출처와 Mock 상태는 보조 본문으로 밝힙니다.

| 화면 | 375px | 430px | 1440px |
|---|---|---|---|
| 쉬움 선택 | [375px](screenshots/bank-easy-375.png) | [430px](screenshots/bank-easy-430.png) | [1440px](screenshots/bank-easy-1440.png) |
| 어려움 선택 | [375px](screenshots/bank-hard-375.png) | [430px](screenshots/bank-hard-430.png) | [1440px](screenshots/bank-hard-1440.png) |
| Python 어려움 풀이 | [375px](screenshots/bank-python-hard-solve-375.png) | [430px](screenshots/bank-python-hard-solve-430.png) | [1440px](screenshots/bank-python-hard-solve-1440.png) |
| 난이도 소진 | [375px](screenshots/practice-exhausted-375.png) | [430px](screenshots/practice-exhausted-430.png) | [1440px](screenshots/practice-exhausted-1440.png) |

소진 화면은 9,999개를 이미 열어본 테스트 이력에서 마지막 문제를 실제로 출제·정답 제출한 뒤 캡처합니다.
실제 사용자의 10,000회 풀이 기록이 아닙니다. [문제 은행](PROBLEM_BANK.md)에 구성과 저장 정책을 기록했습니다.
