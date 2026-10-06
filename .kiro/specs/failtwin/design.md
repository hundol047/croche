# FailTwin — Design

## 1. 아키텍처 개요

```
┌───────────────────────────────────────────────────────────────┐
│                        UI (Expo Router screens)                 │
│  onboarding · dashboard · practice · analysis · prediction ·    │
│  trap-mode · report                                             │
└───────────────┬───────────────────────────────┬───────────────┘
                │ hooks (useErrorDNA, useSession)│
┌───────────────▼───────────────┐   ┌────────────▼───────────────┐
│         Domain Layer           │   │        AI Service Layer      │
│  errorDna engine (deterministic│   │  CrocheAIService (interface) │
│  score), memory selection,     │◄──┤   ├ MockCrocheAIService      │
│  prediction, report aggregation│   │   └ RealCrocheAIService(TODO)│
│  Zod schemas / validators      │   │  + Croche Tool interface     │
└───────────────┬───────────────┘   └────────────┬───────────────┘
                │                                 │
┌───────────────▼─────────────────────────────────▼───────────────┐
│                    Storage Layer (per-userId)                     │
│  KV abstraction → AsyncStorage (native) / localStorage (web) /    │
│  in-memory (test)                                                 │
└───────────────────────────────────────────────────────────────┘
```

핵심 원칙:
- **UI는 Croche/LLM을 직접 모르게 한다.** 화면은 `CrocheAIService`와 domain 함수만 호출.
- **score 업데이트는 deterministic 코드**, LLM은 `errorType` 분류와 자연어 설명/문제 생성만 담당.
- **모든 AI 응답은 Zod로 런타임 검증**, 실패 시 fallback.

## 2. 디렉터리 구조

```
failtwin/
  app/                         # Expo Router routes
    _layout.tsx                # root stack + providers + bootstrap gate
    index.tsx                  # 라우팅 게이트(프로필 유무 → onboarding/home)
    onboarding.tsx
    (tabs)/_layout.tsx         # Home/Report 하단 탭
    (tabs)/index.tsx           # Home Dashboard
    (tabs)/report.tsx          # 학습 리포트
    practice/index.tsx         # 과목/문제 선택
    practice/solve.tsx         # 문제 풀이 입력
    analysis.tsx               # AI 오답 분석
    prediction.tsx             # 미래 실수 예측
    trap/index.tsx             # Trap Mode 시작/진행
  src/
    components/                # 재사용 UI 프리미티브
      Screen.tsx  Card.tsx  Button.tsx  ProgressBar.tsx
      Pill.tsx  SectionTitle.tsx  LoadingState.tsx  ErrorState.tsx
      LineChart.tsx  ErrorDnaBars.tsx  PredictionCard.tsx
      TrapCard.tsx  InsightCard.tsx  ConfidenceSelector.tsx
      Sparkle.tsx  DnaIcon.tsx  TargetIcon.tsx
    constants/
      theme.ts                 # 색/간격/타이포/그림자
      errorDna.ts              # Error Type 메타 + score 계수(config)
      demo.ts                  # Demo 시드 데이터
    domain/
      types.ts                 # 모든 도메인 타입
      errorTypes.ts            # ErrorType enum + 메타
      errorDnaEngine.ts        # deterministic score 업데이트
      memorySelect.ts          # 현재 문제 관련 memory 선택
      prediction.ts            # 위험도 예측 집계(비-LLM 보조)
      report.ts                # 리포트 지표 집계
      schemas.ts               # Zod schemas + validate helper
    services/
      ai/
        CrocheAIService.ts     # 인터페이스
        MockCrocheAIService.ts # 완전 동작 Mock(seedable)
        RealCrocheAIService.ts # Croche SDK 연동 지점(TODO 경계)
        tools.ts               # Croche Tool 정의 + input validation
        modelPolicy.ts         # 저비용/고품질 모델 선택 정책
        index.ts               # getAIService() 팩토리(env 기반)
      croche/
        client.ts              # Croche 클라이언트 생성 경계(TODO)
        memoryStore.ts         # Croche Memory 추상화(Mock=로컬)
    storage/
      kv.ts                    # KV 추상화 + 플랫폼 구현 선택
      repositories.ts          # ProfileRepo/MistakeRepo/DnaRepo/ReportRepo
    state/
      AppContext.tsx           # 전역 세션/프로필/서비스 provider
      useErrorDNA.ts  useSession.ts  usePractice.ts
    content/
      problems.ts              # 과목별 사전 정의 문제 뱅크
    utils/
      id.ts  date.ts  result.ts  clamp.ts
  __tests__/                   # Jest 단위 테스트(순수 로직)
  app.json  package.json  tsconfig.json  babel.config.js
  jest.config.js  .env.example  README.md
```

## 3. 데이터 모델 (요약, 전체는 domain/types.ts)

```ts
type ErrorType =
  | 'condition_omission' | 'calculation_error' | 'concept_confusion'
  | 'sign_error' | 'unit_error' | 'formula_selection_error'
  | 'edge_case_omission' | 'rushed_reasoning' | 'misread_question'
  | 'verification_omission' | (string & {});   // AI 확장 허용

interface ErrorDnaEntry {         // = Croche Memory 1건의 투영
  userId: string; subject: string; topic: string;
  errorType: ErrorType; errorDescription: string; evidence: string[];
  occurrenceCount: number; recentOccurrence: string /*ISO*/;
  severity: number /*1-5*/; confidence: number /*0-1*/;
  score: number /*0-100*/; improvementScore: number; lastUpdated: string;
}

interface Problem { id; subject; topic; prompt; answerType:'numeric'|'text'|'mcq';
  options?; correctAnswer; explanation; difficulty; source:'bank'|'ai'|'trap';
  targetErrorType? }

interface Attempt { id; userId; problemId; userAnswer; userReasoning?;
  confidence:'low'|'medium'|'high'; createdAt }

interface MistakeAnalysis { isCorrect; errorType?; errorTitle?; reason;
  evidence[]; correctionStrategy; severity /*1-5*/; confidence /*0-1*/;
  relatedConcepts[]; recurrenceRisk /*0-100*/ }

interface Prediction { predictedErrorType; riskScore /*0-100*/; reason;
  relatedMemories[] }

interface TrapResult { id; userId; trapProblemId; targetErrorType;
  actualErrorType?; predictionHit; solvedCorrectly; createdAt }
```

## 4. Error DNA 알고리즘 (deterministic)

`errorDnaEngine.ts`의 `applyMistake` / `applyCorrection`:

```
onMistake(entry, { severity, isRecurrence }):
  recurrenceWeight = isRecurrence ? RECUR_STEP * min(occurrenceCount, RECUR_CAP) : BASE_STEP
  severityWeight   = SEVERITY_UNIT * severity           // severity 1..5
  delta            = recurrenceWeight + severityWeight
  newScore         = clamp(oldScore + delta, 0, 100)
  // 1회성 과대평가 방지: 첫 발생은 BASE_STEP+severity만, 재발부터 가중
  occurrenceCount += 1; recentOccurrence = now

onCorrection(entry, { confidence }):
  correctionWeight = CORRECTION_STEP + CONFIDENCE_UNIT * confidenceLevel
  newScore         = clamp(oldScore - correctionWeight, 0, 100)
  improvementScore += IMPROVEMENT_UNIT

recencyDecay(entry, daysSinceLast):      // 홈 진입 시 선택적
  newScore = clamp(oldScore - DECAY_PER_DAY * daysSinceLast, floorByOccurrence, 100)
```

계수(`constants/errorDna.ts`, 조정 가능):
`BASE_STEP=8, RECUR_STEP=6, RECUR_CAP=4, SEVERITY_UNIT=3,
CORRECTION_STEP=7, CONFIDENCE_UNIT=2, IMPROVEMENT_UNIT=5, DECAY_PER_DAY=0.5`.

성질: 첫 실수 1회 ⇒ +(8+3·severity) 로 완만, 반복될수록 가팔라짐, 교정 시 하향, 모두 0–100 clamp.

## 5. Memory 선택 (Croche Context 최소화)

`memorySelect.selectRelevantMemories(allEntries, currentProblem, limit)`:
1. subject/topic 일치 가중, 2. errorType 최근성/재발 가중, 3. score 높을수록 가중.
→ 상위 `limit`(기본 4)만 반환해 Context에 삽입. 전체 대화 이력은 전달하지 않음.

예: 현재 "급수의 수렴구간" → `edge_case_omission`(경계 누락) 최근 2회 + `rushed_reasoning`만 선택.

## 6. AI Service 계약

```ts
interface CrocheAIService {
  analyzeMistake(input: AnalyzeInput): Promise<MistakeAnalysis>;
  predictNextMistake(input: PredictInput): Promise<Prediction>;
  generateTrapProblem(input: TrapInput): Promise<TrapProblem>;
  generateProblem(input: GenProblemInput): Promise<Problem>;
}
```
- `AnalyzeInput`/`PredictInput`/`TrapInput`은 **선택된 memory만** 포함(selectRelevantMemories 결과).
- 모든 반환값은 호출부에서 Zod `validate*`로 검증, 실패 시 `Result.err` → fallback UI.
- `modelPolicy`가 작업 유형별 모델 티어(`cheap`|`quality`)를 반환 → RealService가 사용.

### Mock 동작
`MockCrocheAIService`는 결정적 규칙 기반:
- 정답 비교로 isCorrect 판정, 오답 시 subject/topic/풀이 텍스트 heuristic으로 errorType 추론.
- Trap 문제는 target errorType별 **문제 템플릿 뱅크**에서 새 변형을 조립(숫자만 바꾸지 않음).
- seed로 재현성 보장. 네트워크/지연 시뮬레이션은 짧은 setTimeout.

### Croche Tool 노출
`tools.ts`: `getErrorDNA, updateErrorDNA, getRecentMistakes, saveMistakeAnalysis,
generateTrapChallenge, saveTrapResult, getLearningProgress` — 각 tool은 Zod input schema로
검증 후 repository/domain 호출. RealService가 Croche Tool interface에 등록할 수 있도록 export.

## 7. 화면 → 도메인 매핑

| 화면 | 주요 호출 |
|---|---|
| onboarding | ProfileRepo.save, demo seed |
| dashboard | DnaRepo.get → ErrorDnaBars, predictNextMistake(요약) |
| practice | problems bank / generateProblem |
| solve | Attempt 생성 → analyzeMistake |
| analysis | validate(MistakeAnalysis) → applyMistake/applyCorrection → DnaRepo.save |
| prediction | predictNextMistake → PredictionCard |
| trap | pickStrongestErrorType → generateTrapProblem → solve → saveTrapResult → HIT/극복 |
| report | report.aggregate(mistakes, trapResults, dnaHistory) → LineChart + InsightCard |

## 8. 디자인 시스템

- 색: 배경 #FFFFFF / #F7F8FC, Primary Blue #3B5BFF, Indigo #4F46E5, Violet #7C3AED,
  성공 #10B981, 경고 #F59E0B, 위험 #EF4444, 텍스트 #0F172A/#64748B.
- 카드: radius 20, soft shadow, padding 20, 간격 16.
- 타이포: 제목 22/700, 섹션 16/700, 본문 14–15/500, 캡션 12/500.
- 브랜드 자산: DnaIcon(이중나선), TargetIcon, Sparkle(AI) — 일관 사용.
- Error DNA bar: 유형별 그라데이션(blue→violet), 점수 라벨, 상위 유형 강조.
- Prediction card: 큰 위험도 숫자 + "AI 예측 점수" 캡션 + target 실수 pill.
- Trap card: violet 그라데이션, target errorType 배지, "Trap Challenge 시작" CTA.
- Report: 주차별 재발률 line chart(자체 SVG, 외부 차트 라이브러리 불필요).
- 과도한 애니메이션 지양, HIT는 짧은 scale/opacity 피드백.

## 9. 에러/로딩/프라이버시
- LoadingState: 분석 "당신의 풀이 패턴을 분석하고 있어요", Trap "당신이 가장 실수하기 쉬운 문제를 설계하고 있어요".
- ErrorState: "분석에 실패했습니다 / 다시 시도".
- 데이터 키는 `ft:{userId}:...`로 네임스페이스 → 계정 분리.
- AI 톤 가드: 금지 표현 필터(머리/소질 등)로 비난성 문구를 교정 톤으로 치환.

## 10. 테스트 전략 (순수 로직, 네트워크 불필요)
- errorDnaEngine: 재발 시 증가 / 교정 시 감소 / clamp / 1회 과대평가 방지.
- memorySelect: 관련 유형 상위 선택.
- schemas: 유효/무효 AI JSON validate.
- prediction/report 집계.
- MockCrocheAIService 전체 루프(분석→DNA→예측→trap→결과).
- storage in-memory repo roundtrip.
- (RN 렌더 테스트는 네트워크 가능 환경에서 react-test-renderer로 수행하도록 구성만 제공.)
