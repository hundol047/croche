# FailTwin 디자인 정리 · 2026-10-07

학생의 반복 실수와 다음 연습이 먼저 보이는 학습 도구로 정리했습니다.
잉크 블루, DNA의 얇은 눈금 선, 풀이 피드백의 읽기 순서를 공통 언어로 사용합니다.

## 전후 기준

| 이전 | 변경 | 이유 |
|---|---|---|
| 파랑·인디고·보라를 동등한 브랜드 색으로 사용 | 잉크 블루 한 가지, 보라는 Trap의 얇은 경계에만 사용 | 점수와 학습 행동이 색보다 먼저 보이게 함 |
| 내용마다 큰 모서리·그림자가 있는 카드 | 주 정보만 테두리 패널, 보조 내용은 구분선·정렬 | 분석을 한 장의 피드백으로 읽고 리포트를 실제 기록으로 비교 |
| 굵은 진행 막대와 빨간 점수 | 얇은 분절 선, 작은 점수와 저장된 발생 횟수 | Error DNA를 식별 가능한 제품 요소로 만들고 위험을 차분하게 안내 |
| 56px 예측 숫자·같은 이유를 두 번 설명 | 실수 이름 → 근거 → 0–100 점수 → 훈련 | 다음에 무엇을 확인할지 빠르게 결정 |
| 똑같이 큰 CTA 여러 개 | 주 버튼 한 개, 보조·프로필 동작은 탐색 행 | 진행과 설정의 중요도를 구분 |
| AI Insight·AI 오답 분석·Sparkle·이모지 | 최근 학습 패턴·풀이 분석·일관된 SVG 아이콘 | 학습자가 내용을 읽게 하고 AI는 작은 상태 표시로 공개 |
| 과장된 결과 배너·축하 이모지·spring 확대 | 내용에 맞는 결과 텍스트와 180ms fade | 훈련 결과를 차분하게 읽게 함 |

[이전 홈](screenshots/before/dashboard-375.png) → [현재 홈](screenshots/dashboard-375.png)
· [이전 분석](screenshots/before/analysis-375.png) → [현재 분석](screenshots/analysis-375.png)
· [이전 리포트](screenshots/before/report-375.png) → [현재 리포트](screenshots/report-375.png).
이전 화면은 기준 커밋 `5f31360`의 실제 심사 캡처입니다.

## 공통 토큰과 컴포넌트

- 브랜드 `#243F63`, 본문 `#202B3B`, 배경 `#F4F5F6`, 종이 패널 `#FFFFFF`.
  주의는 따뜻한 갈색, 교정은 초록. 점수 계산과 구간 데이터는 변경하지 않았습니다.
- 모서리: 선택·버튼 8px, 입력 10px, 기본 패널 12px, Trap 집중 훈련 패널만 16px.
  일반 내용의 그림자는 없습니다.
- 4px 기반 여백, 28/24/16/15/12px 글자 체계. 본문은 regular, 제목·중요 값은 semibold.
  시스템 글꼴을 사용하고 상용·외부 글꼴이나 UI·아이콘 패키지는 추가하지 않았습니다.
- 최소 44px 선택·탐색 행과 48px 버튼·입력. 주요 글자 조합은 대비 4.5:1 이상,
  입력·선택 경계는 3:1 이상을 계산 확인했습니다. 전체 WCAG 인증을 의미하지 않습니다.
- DNA·타깃·이동·리포트·오류는 같은 24px / 1.8px 선의 SVG 아이콘입니다.
  `Card`, `Section`, `ActionRow`가 패널·읽기 단락·보조 행동을 구분합니다.

## 화면과 데이터

온보딩은 작은 브랜드와 왼쪽 정렬 제목, 바로 이어지는 필드로 시작합니다. 홈은 학습자 맥락과
Error DNA, 문제 풀기, 패턴 훈련 순서입니다. 분석은 결과와 점수 변화 다음에 원인·근거·다음 확인점을
한 문서로 읽습니다. 리포트는 기록 날짜·실제 지표·추이·변화와 짧은 학습 메모로 구성합니다.

막대의 `기록 N회`는 저장된 occurrenceCount입니다. 리포트 날짜도 저장 사건에서 읽습니다.
새 사용자에게 과거 데이터나 새 통계를 만들지 않습니다. 예시 DNA는 홈과 리포트에 표시하고,
`Mock AI · Croche 미연결` 상태는 홈의 작은 보조 텍스트로 유지합니다.

Error DNA 엔진, 원자적 저장, 중복 차단, 세션 복원, Trap 판정·문제 템플릿, 심사 시나리오는
변경하지 않았습니다. 리포트 도메인 변경은 학습 메모의 문장뿐이며 집계·선택 조건은 동일합니다.
심사 루프는 여전히 **83→100→91 / Trap 적중 1회·2회 중 50% / 교정 1개**입니다.

## 최종 프로덕션 캡처

최종 Web export를 실제 Chromium에서 실행한 화면입니다. 375/430px와 1440px 데스크톱을
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
