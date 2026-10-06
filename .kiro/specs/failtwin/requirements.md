# FailTwin — Requirements

> **서비스명:** FailTwin
> **핵심 문구:** AI가 당신의 실수를 먼저 예측합니다
> **대상:** SNU × Croche AI Hackathon 2026

## 1. 서비스 개요

FailTwin은 "사용자가 무엇을 모르는지"가 아니라 **"사용자가 어떻게 반복해서 틀리는지"**를 학습하는
AI 학습 앱이다. 사용자의 풀이 과정과 오답을 분석해 개인별 **Error DNA**(구조화된 실수 패턴 상태)를
누적하고, 다음 문제에서 발생할 가능성이 높은 실수 유형을 예측하며, 그 사용자가 가장 실수하기 쉬운
조건을 포함한 맞춤 문제(**Trap Mode**)를 생성한다.

## 2. 핵심 사용자 루프 (반드시 end-to-end로 동작)

```
문제 풀이
→ 답변 제출
→ AI 오답/풀이 분석 (MistakeAnalysis)
→ Error DNA 업데이트 (deterministic score)
→ 다음 실수 위험도 예측 (Prediction)
→ Trap Mode 문제 생성 (TrapProblem)
→ 재도전
→ 개선 여부 측정 (Prediction HIT / Trap 극복)
→ 학습 리포트 반영 (LearningReport)
```

## 3. 기능 요구사항 (EARS)

### R1. 온보딩
- R1.1 WHEN 앱을 처음 실행하고 저장된 프로필이 없을 때 THE SYSTEM SHALL 온보딩 화면을 표시한다.
- R1.2 THE SYSTEM SHALL 사용자가 이름을 입력하도록 허용한다.
- R1.3 THE SYSTEM SHALL 학습 목적(대학교 전공/수능/자격증/코딩/기타)을 선택하도록 한다.
- R1.4 THE SYSTEM SHALL 관심 과목을 다중 선택하도록 한다.
- R1.5 WHEN 사용자가 "심사용 빠른 데모"를 선택하면 THE SYSTEM SHALL Demo 프로필과 초기 Error DNA 예시 데이터를 시드한다.
- R1.6 WHEN 온보딩이 완료되면 THE SYSTEM SHALL 프로필을 로컬에 영속 저장하고 Home으로 이동한다.

### R2. Home Dashboard
- R2.1 THE SYSTEM SHALL "안녕하세요, {사용자명}님" 헤더를 표시한다.
- R2.2 THE SYSTEM SHALL Error DNA 카드에 각 실수 유형의 score를 horizontal progress bar로 표시한다.
- R2.3 THE Error DNA 수치 SHALL 사용자 데이터에서 계산된 실제 값이어야 한다(고정 하드코딩 금지, Demo 시드 제외).
- R2.4 THE SYSTEM SHALL "다음 문제에서 가장 가능성 높은 실수"를 Prediction 기반으로 표시한다.

### R3. 문제 풀이
- R3.1 THE SYSTEM SHALL 과목 데모(공업수학/일반물리/Python 프로그래밍)를 제공한다.
- R3.2 THE SYSTEM SHALL 사전 정의 문제 선택과 AI 문제 생성 요청을 모두 지원한다.
- R3.3 THE SYSTEM SHALL 답 입력, 풀이 과정 입력, 확신도(없음/보통/매우 확신) 입력을 지원한다.
- R3.4 WHEN 답을 제출하면 THE SYSTEM SHALL AI 분석 단계로 이동한다.

### R4. AI 오답 분석
- R4.1 THE SYSTEM SHALL 정답 여부, 핵심 실수 유형, 원인 설명, 근거, 교정 방법, 재발 위험도, Error DNA 변화를 표시한다.
- R4.2 THE SYSTEM SHALL LLM 자유 텍스트가 아닌 구조화된 `MistakeAnalysis` JSON을 schema validation 후 렌더링한다.
- R4.3 THE AI 출력 SHALL 학생을 비난하거나 단정적으로 평가하지 않는다(교정 가능한 행동 패턴 중심).
- R4.4 WHEN AI 응답이 schema를 위반하면 THE SYSTEM SHALL crash하지 않고 fallback UI를 표시한다.

### R5. Future Mistake Prediction (오답 예측)
- R5.1 THE SYSTEM SHALL 현재 Error DNA + 관련 Memory 기반으로 예측된 실수 유형과 위험도 점수를 표시한다.
- R5.2 THE 위험도 SHALL "AI 기반 위험도/예측 점수"로 명시되어 통계적으로 검증된 확률로 오해되지 않게 한다.
- R5.3 THE SYSTEM SHALL 예측 근거 설명을 표시한다.

### R6. Trap Mode (핵심 차별점)
- R6.1 THE SYSTEM SHALL "Trap Challenge 시작" 버튼을 제공한다.
- R6.2 WHEN 사용자가 버튼을 누르면 THE SYSTEM SHALL Error DNA에서 가장 강한 실수 유형을 target으로 선택한다.
- R6.3 THE SYSTEM SHALL 같은 인지적 실수를 유발하되 내용이 새로운 `TrapProblem`을 생성한다(숫자만 바꾸기 금지).
- R6.4 WHEN 사용자의 실제 오류가 AI가 예측한 target errorType과 일치하면 THE SYSTEM SHALL "예측 적중(Prediction HIT)" 피드백을 표시한다.
- R6.5 WHEN 사용자가 Trap 문제를 맞히면 THE SYSTEM SHALL "Trap 극복" 긍정 피드백을 표시한다.
- R6.6 THE Trap 결과 SHALL Error DNA 및 리포트에 반영된다.

### R7. 학습 리포트
- R7.1 THE SYSTEM SHALL 실수 재발률 변화, AI 예측 적중률, 교정 완료 실수 개수, 가장 개선된/가장 위험한 Error DNA를 표시한다.
- R7.2 THE SYSTEM SHALL 주차별 실수 재발률을 line chart로 표시한다.
- R7.3 THE SYSTEM SHALL 비난 없는 AI Insight 카드를 표시한다.

### R8. Error DNA 상태 & 알고리즘
- R8.1 각 Error Type SHALL 0–100 score를 유지한다.
- R8.2 새 실수 발생 시 score 증가, 성공 교정 시 점진 감소.
- R8.3 최근 실수와 재발 횟수를 더 강하게 반영하되, 단 1회 실수로 과도하게 높아지지 않게 한다.
- R8.4 LLM은 errorType 분류만 담당하고, score 업데이트는 deterministic 코드로 수행한다.
- R8.5 계수는 config/constants 파일로 분리한다.
- R8.6 Memory 상태 필드: userId, subject, topic, errorType, errorDescription, evidence, occurrenceCount, recentOccurrence, severity, confidence, improvementScore, lastUpdated.
- R8.7 공통 Error Type: condition_omission, calculation_error, concept_confusion, sign_error, unit_error, formula_selection_error, edge_case_omission, rushed_reasoning, misread_question, verification_omission + AI 확장 가능.

### R9. Croche 연동
- R9.1 THE SYSTEM SHALL `CrocheAIService` 인터페이스를 정의하고 `RealCrocheAIService`/`MockCrocheAIService`로 분리한다.
- R9.2 THE Mock 구현만으로 전체 사용자 흐름이 실제처럼 작동해야 한다.
- R9.3 THE Context 구성 SHALL 전체 대화가 아니라 현재 문제와 관련된 과거 Memory만 삽입한다(Memory 선택 로직).
- R9.4 THE SYSTEM SHALL 분석/분류는 저비용 모델, 복잡 분석/Trap 생성은 고품질 모델을 선택할 수 있는 구조를 가진다.
- R9.5 THE SYSTEM SHALL 앱 기능을 Tool로 노출하는 구조를 고려한다(getErrorDNA 등) with input validation.
- R9.6 Croche 코드 SHALL UI 컴포넌트에 직접 작성되지 않고 서비스 레이어로 분리된다.

### R10. 영속성 & 프라이버시
- R10.1 THE SYSTEM SHALL 비-AI 로컬 데이터를 로컬 저장소(AsyncStorage 호환 추상화)에 영속한다.
- R10.2 WHEN 앱을 재시작해도 THE SYSTEM SHALL 학습 데이터를 유지한다.
- R10.3 THE 학습 기록 SHALL userId 별로 분리되어 다른 계정과 섞이지 않는다.

### R11. UX
- R11.1 THE SYSTEM SHALL AI 분석/생성 중 로딩 상태(설명 문구 + subtle animation)를 표시한다.
- R11.2 THE SYSTEM SHALL AI 실패 시 재시도 가능한 error state를 표시한다.
- R11.3 THE 모든 주요 화면 SHALL SafeArea를 적용하고 작은 화면에서 잘리지 않는다.

### R12. Demo Mode
- R12.1 THE SYSTEM SHALL Demo 프로필 시드(조건 누락 83 / 계산 실수 61 / 개념 혼동 47 / 성급한 판단 72)를 제공한다.
- R12.2 THE Demo SHALL 심사위원이 2분 내 전체 루프를 경험할 수 있게 한다.

## 4. 비기능 요구사항
- NFR1 TypeScript strict mode.
- NFR2 재사용 가능한 컴포넌트 구조, feature-based 디렉터리.
- NFR3 Expo Web에서도 실행 가능해 PC 브라우저 시연 가능.
- NFR4 핵심 로직(Error DNA, schema validation, memory 선택, prediction) 단위 테스트.
- NFR5 결과가 랜덤하게 변하지 않음(deterministic score, seedable mock).

## 5. 환경 제약 (정직한 명시)
- 본 샌드박스는 `INTEGRATIONS_ONLY` 네트워크로 npm 레지스트리가 403으로 차단되어 `npm install` 및
  RN/Expo 런타임 실행·Expo Web·RN 의존 테스트를 **샌드박스 내에서 실행 검증할 수 없다**.
- 따라서 순수 TypeScript 도메인 로직은 로컬 ts 컴파일/노드 실행으로 검증하고, RN 의존 실행은
  네트워크가 가능한 머신에서 `npm install` 후 수행하도록 README에 명시한다.
- Croche SDK 패키지/문서가 환경에 존재하지 않아 `RealCrocheAIService`는 명확한 TODO 경계로 남기고,
  `MockCrocheAIService`로 완전한 Demo를 보장한다.
