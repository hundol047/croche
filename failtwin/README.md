# FailTwin

> **AI가 당신의 실수를 먼저 예측합니다.**
> SNU × Croche AI Hackathon 2026 출품작.

FailTwin은 사용자가 **무엇을 모르는지**가 아니라 **어떻게 반복해서 틀리는지**를 학습하는 AI 학습 앱입니다.
풀이 과정과 오답을 분석해 개인별 **Error DNA**를 누적하고, 다음 문제에서 발생할 가능성이 높은 실수를
예측하며, 당신이 가장 실수하기 쉬운 조건을 담은 맞춤 문제(**Trap Mode**)를 생성해 시험 전에 실수를
미리 경험하고 교정하게 합니다.

---

## 1. 문제 정의

대부분의 AI 튜터는 "정답/오답"과 "모르는 개념"을 알려줍니다. 하지만 시험장에서 점수를 깎는 것은 몰라서가
아니라 **알면서도 반복하는 실수 습관**인 경우가 많습니다 — 경계조건 누락, 검산 생략, 성급한 판단, 부호
실수 등. 이런 패턴은 사람마다 다르고, 본인은 잘 인지하지 못합니다.

## 2. 기존 AI 튜터와의 차별점

| 기존 AI 튜터 | FailTwin |
|---|---|
| "무엇을 모르는가"를 분석 | **"어떻게 반복해서 틀리는가"**를 학습 |
| 오답을 정답으로 교정 | 오답의 **인지적 원인(Error Type)**을 구조화해 누적 |
| 더 많은 문제 추천 | 당신이 **틀리기 쉬운 실수를 유발하는** 맞춤 문제 생성(Trap Mode) |
| 사후 피드백 | **다음 실수를 미리 예측** (Prediction) |

심사 포인트: 사용자가 앱을 써 본 뒤 *"이 AI는 내가 어떻게 틀리는지를 기억하고 다음 실수를 먼저
예측한다"* 는 가치를 즉시 이해하도록 설계했습니다.

## 3. 핵심 사용자 흐름

```
문제 풀이 → 답/풀이/확신도 제출
  → AI 오답 분석 (MistakeAnalysis)
  → Error DNA 업데이트 (deterministic score)
  → 다음 실수 위험도 예측 (Prediction)
  → Trap Mode 문제 생성 (TrapProblem)
  → 재도전 → 예측 적중(HIT) / Trap 극복
  → 학습 리포트 반영 (LearningReport)
```

## 4. 화면
온보딩 · Home Dashboard(Error DNA 카드 + 다음 실수 배너) · 문제 풀이 · AI 오답 분석 ·
오답 예측 · Trap Mode · 학습 리포트(주차별 재발률 line chart + AI Insight).

## 5. 기술 스택
- **React Native + Expo (SDK 51) + TypeScript (strict) + Expo Router**
- **react-native-svg** — 브랜드 아이콘/차트(외부 차트 라이브러리 미사용)
- **AsyncStorage**(네이티브) / `localStorage`(웹) / in-memory(테스트) — 플랫폼 KV 추상화
- **zod** — 모든 AI JSON 응답 런타임 스키마 검증
- AI는 **Croche** 중심 설계 (Context/Session/Memory/모델 선택/Tool interface)

## 6. 로컬 실행 방법

> 네트워크가 되는 머신에서 아래를 실행하세요.

```bash
cd failtwin
cp .env.example .env        # 기본값 EXPO_PUBLIC_CROCHE_MODE=mock
npm install
npm run typecheck           # TypeScript strict 검사
npm test                    # Jest (로직 + 컴포넌트 렌더 테스트)
```

### Expo 실행
```bash
npm run start               # Expo Dev 서버 (QR로 Expo Go에서 열기)
npm run android             # Android
npm run ios                 # iOS
```

### 웹 실행 (PC 브라우저 시연)
```bash
npm run web                 # Expo Web — 심사위원이 브라우저에서 바로 시연 가능
```

## 7. Demo Mode 사용법
온보딩 화면 하단의 **"⚡ 심사용 빠른 데모"** 버튼을 누르면:
- Demo 사용자(민준)와 예시 Error DNA(조건 누락 83 / 성급한 판단 72 / 계산 실수 61 / 개념 혼동 47)가
  시드됩니다.
- 홈 → Error DNA 확인 → 문제 풀이(일부러 오답) → AI 분석 → Error DNA 변화 → 미래 오답 예측 →
  Trap Mode 문제 생성 → 재도전 → Prediction HIT / Trap 극복 → 리포트 변화까지 **2분 내** 체험 가능합니다.

실제 신규 사용자는 "시작하기"로 빈 Error DNA에서 출발해 자신의 데이터를 직접 쌓습니다.
학습 데이터는 로컬에 영속되어 앱을 재시작해도 유지됩니다.

## 8. Croche 구조

AI 핵심 기능은 `CrocheAIService` 인터페이스 하나에 모읍니다. UI/도메인 코드는 Croche/LLM을 직접
알지 못하며, 이 인터페이스와 결정적(deterministic) 도메인 함수만 호출합니다.

```
src/services/
  ai/
    CrocheAIService.ts       # 인터페이스 (analyze / predict / generateTrap / generateProblem)
    MockCrocheAIService.ts   # ✅ 완전 동작 Mock (seedable, 네트워크/SDK 불필요)
    RealCrocheAIService.ts   # Croche 백엔드 연동 (구조 완성, client만 꽂으면 동작)
    modelPolicy.ts           # 저비용/고품질 모델 티어 선택 (비용 제어)
    tools.ts                 # Croche Tool interface + Zod input validation
    toneGuard.ts             # 비난성 표현 금지 안전 가드
  croche/
    client.ts                # ⚠️ Croche SDK/client 생성 경계 (TODO)
    memoryStore.ts           # Croche Memory 추상화 (관련 기억만 검색)
```

- **Memory**: Error DNA 엔트리가 곧 Croche Memory의 로컬 투영입니다. 필드는 userId, subject, topic,
  errorType, errorDescription, evidence, occurrenceCount, recentOccurrence, severity, confidence,
  improvementScore, lastUpdated. 전체 대화를 매번 LLM에 넘기지 않고,
  `selectRelevantMemories()`가 **현재 문제와 관련된 기억만** 골라 Context에 삽입합니다.
- **모델 선택/비용 제어**: `modelPolicy.tierForTask()`가 단순 분류/예측은 `cheap`, 복잡 분석/Trap
  생성은 `quality` 티어로 라우팅합니다.
- **Tool interface**: `getErrorDNA / updateErrorDNA / getRecentMistakes / saveMistakeAnalysis /
  generateTrapChallenge / saveTrapResult / getLearningProgress`를 Zod 입력 검증과 함께 노출 —
  AI가 임의 데이터를 쓸 수 없습니다.
- **출력 검증**: 모든 AI 응답은 `src/domain/schemas.ts`의 Zod 스키마로 검증되고, 실패 시 앱이
  죽지 않고 fallback UI(또는 결정적 baseline 예측)로 폴백합니다.

### Croche Studio 평가 지표(설계 상 준비됨)
Error classification quality · Trap problem quality · Prediction usefulness · Response latency ·
Token usage · Cost per learning session — 작업 유형별 모델 티어/latency 측정 지점이 서비스 레이어에
격리되어 있어 추후 계측을 붙이기 쉽습니다.

## 9. Croche 실제 연결 방법

이 빌드는 개발 환경에 Croche SDK 패키지가 없고 오프라인이라 **Mock으로 완전 동작**하도록 만들었습니다.
실제 Croche에 연결하려면 **딱 두 파일만** 수정하면 됩니다(그 외 UI/도메인/테스트는 그대로):

1. `.env`에 `EXPO_PUBLIC_CROCHE_MODE=real` 및 Croche 설정 입력(아래 환경 변수 참고).
2. `src/services/croche/client.ts`의 `createCrocheClient()`에서 **공식 Croche SDK**로 실제 client를
   생성해 반환(`// TODO(croche)` 지점). 반환 객체가 `CrocheClient.completeJson()` 시그니처를
   만족하게만 하면 됩니다.
3. 끝. `RealCrocheAIService`는 이미 프롬프트 구성·모델 티어 선택·관련 Memory만 context 주입·동일
   Zod 검증·톤 가드까지 전부 구현되어 있습니다. client만 존재하면 앱 전체가 동일하게 동작합니다.

> ⚠️ 존재하지 않는 Croche 함수/패키지/엔드포인트를 임의로 만들지 않았습니다. SDK 심볼은 공식 문서에
> 맞춰 `client.ts`에서만 채워 넣으세요.

## 10. Mock Croche 사용 방법
`EXPO_PUBLIC_CROCHE_MODE=mock`(기본값)이면 `MockCrocheAIService`가 사용됩니다. 결정적 규칙 기반으로
정답 판정·실수 유형 추론·Trap 문제 조립(같은 인지적 실수를 유발하되 **내용이 새로운** 문제)·예측을
수행합니다. 네트워크/SDK 없이 전체 Demo가 실제처럼 동작합니다. `mode=real`인데 client가 없으면
자동으로 Mock으로 폴백합니다.

## 11. 환경 변수 (`.env.example` 참고)
| 변수 | 설명 |
|---|---|
| `EXPO_PUBLIC_CROCHE_MODE` | `mock`(기본) 또는 `real` |
| `EXPO_PUBLIC_CROCHE_BASE_URL` | (real 전용) Croche 베이스 URL |
| `CROCHE_API_KEY` | (real 전용) 비밀키 — 커밋 금지, 서버 프록시 권장 |
| `EXPO_PUBLIC_CROCHE_MODEL_CHEAP` / `_QUALITY` | 모델 티어 오버라이드(선택) |

`.env`는 `.gitignore`에 포함되어 커밋되지 않습니다.

## 12. Error DNA 알고리즘
각 Error Type은 0–100 score를 가집니다. **LLM은 errorType 분류만** 하고, **score 업데이트는 결정적
코드**(`src/domain/errorDnaEngine.ts`)로 수행합니다.

```
onMistake:  delta = recurrenceWeight + severityWeight   (첫 실수는 완만, 재발부터 가팔라짐)
onCorrect:  delta = -(CORRECTION_STEP + CONFIDENCE_UNIT*confidence)
decay:      오래 재발 없으면 occurrence 비례 floor까지 완만히 감소
```
계수는 `src/constants/errorDna.ts`에서 쉽게 조정할 수 있습니다. 결과는 랜덤하지 않고 재현 가능합니다.

## 13. 프로젝트 구조
```
failtwin/
  app/              # Expo Router routes (화면)
  src/
    components/     # 재사용 UI (ErrorDnaBars, PredictionCard, TrapCard, LineChart, InsightCard ...)
    constants/      # theme, errorDna 계수, demo 시드
    domain/         # types, errorTypes, errorDnaEngine, memorySelect, prediction, report, trapEval, schemas
    services/ai/    # CrocheAIService + Mock/Real + modelPolicy + tools + toneGuard
    services/croche/# client(연동 경계) + memoryStore
    storage/        # KV 추상화 + per-userId repositories
    state/          # AppContext provider + hooks
    content/        # 과목별 문제 뱅크
    utils/
  __tests__/        # 단위 + 컴포넌트 테스트
  verify/           # 오프라인 검증 하네스 (앱 비포함, 아래 참고)
```

## 14. 테스트 & 검증
- **표준(네트워크 머신):** `npm run typecheck && npm test`
  - 로직 테스트: Error DNA score(재발 시 증가/교정 시 감소/clamp/1회 과대평가 방지), Memory 관련
    유형 검색, AI JSON schema validation, Trap 결과 저장, Prediction 계산, storage round-trip,
    **Mock 전체 루프**(분석→DNA→예측→trap→결과→리포트).
  - 컴포넌트 렌더 테스트: 주요 화면 컴포넌트 정상 렌더.
- **오프라인 검증(이 저장소에서 수행됨):** `npm`을 쓸 수 없는 환경을 위해 `verify/`에 번들된 zod shim +
  테스트 하네스로 순수 TS 로직을 검증합니다. `bash scripts/verify-logic.sh` → **44 passed / 0 failed**,
  로직 typecheck clean. 자세한 내용은 [`verify/README.md`](verify/README.md).

## 15. 개인정보 & 안전
- 학습 기록은 `ft:{userId}:...` 키로 네임스페이스되어 **계정 간 분리**됩니다.
- AI는 "머리가 나쁘다 / 소질이 없다" 같은 **능력 단정 표현을 하지 않습니다**(toneGuard로 교정 톤 치환).
  실수는 교정 가능한 행동 패턴으로 설명합니다.
- MVP의 위험도 점수는 과학적으로 검증된 확률이 아니라 **"AI 예측 점수"**로 명시 표기합니다.

## 16. 알려진 제약 / 향후 개선
- 본 빌드는 Croche SDK가 없는 오프라인 환경에서 작성되어 `RealCrocheAIService`의 **client 생성부만
  TODO**로 남았습니다(§9). 그 외 모든 흐름은 Mock으로 완전 동작합니다.
- 향후: 실제 Croche LLM/Memory 연동, Croche Studio 지표 계측(latency/token/cost) 대시보드, 과목·문제
  뱅크 확장, 실수 유형 자동 발견(AI 확장 Error Type), 서버 동기화/멀티 디바이스, 접근성 추가 개선.
