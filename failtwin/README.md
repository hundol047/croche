# FailTwin

> **AI가 당신의 실수를 먼저 예측합니다.**
> SNU × Croche AI Hackathon 2026 출품작.

FailTwin은 **어떻게 반복해서 틀리는지**를 학습합니다. 개념 설명과 정답 교정을 넘어,
사용자의 실수 패턴을 Error DNA로 기억하고 다음 실수를 예측하며 같은 약점을 노리는 새로운
**Trap Mode** 문제로 시험 전에 교정하게 합니다.

```
문제 풀이 → 오답 분석 → Error DNA 업데이트 → 다음 실수 예측
         → Trap Mode → Prediction HIT / Trap 극복 → 학습 리포트
```

## 실행

Node.js 20이 CI 기준입니다. Expo SDK 51 / React Native 0.74.5 / React 18.2 /
Expo Router 3.5와 React 18 타입 overrides를 유지합니다.

```bash
cd failtwin
npm ci                       # 커밋된 package-lock.json 사용
npm run web -- --offline      # 설치 후 외부 Expo 메타데이터 없이 실행
```

Mock이 기본 모드라 `.env`나 인증 정보는 필요 없습니다. `.env.example`은 선택 사항이며
`.env`·`.env.*`는 Git에서 제외됩니다. 인터넷 제한이 없다면 `npm run web`도 사용할 수 있습니다.
`--offline`은 Expo CLI의 메타데이터 조회를 생략하는 공식 실행 옵션이며 앱의 로컬 저장은 유지됩니다.

온보딩의 **⚡ 심사용 빠른 데모**로 예시 DNA를 확인하고,
[90–120초 발표 가이드](../docs/JUDGE_DEMO.md)의 정확한 답을 따라 시연하세요.
새 실제 프로필은 빈 Error DNA와 빈 학습 기록으로 시작합니다.
데모 초기화는 데모 기록만 바꾸며 실제 프로필 기록을 보존합니다.

## 검증 명령

```bash
npm run typecheck             # 실제 Expo / RN 타입, strict
npm run lint
npm test -- --ci --maxWorkers=2
npm run typecheck:logic
npm run test:logic
npm run demo:loop             # UI와 같은 저장·도메인 함수로 실제 심사 루프 실행
npm run build:web            # expo export --platform web → dist/
```

전체 검사: `bash scripts/qa-networked.sh`. 설치 실패 시 lockfile을 바꾸는 fallback은 없습니다.
GitHub Actions의 `verify`는 `npm ci → typecheck → lint → Jest → web export`,
`logic-tests`는 독립 로직 테스트를 수행합니다. 최신 원격 실행은
[PR #1 checks](https://github.com/hundol047/croche/pull/1/checks)에서 확인할 수 있습니다.

### 실제 브라우저 QA

```bash
npx playwright install chromium       # 최초 한 번, 브라우저 다운로드 필요
npm run test:web                     # 로컬 서버 자동 시작
# 시스템 Chromium이 이미 있다면:
CHROMIUM_PATH=/usr/bin/chromium npm run test:web
```

Playwright는 375 / 430 / 768 / 1440px에서 Chromium을 실제 실행합니다.
신규 온보딩, 세 과목의 기존·생성 문제, 복수 정답, 분석의 중복 저장 방지,
정확한 심사 데모, HIT와 중립 피드백, 새 Trap의 교정, 리포트 집계, 깊은 경로 복원,
새로고침·프로필 분리·데모 초기화와 가로 넘침을 검사합니다.
브라우저 오류·새 경고는 실패로 처리하며 SDK 51 React Navigation의 알려진
`pointerEvents` 폐기 예정 경고만 기록하고 구분합니다.
리포트·스크린샷·실패 trace는 ignored `playwright-report/`, `test-results/`에 저장합니다.
외부 정적 서버에서도 `FAILTWIN_WEB_URL`로 같은 테스트를 수행할 수 있으며
SPA 깊은 경로는 `index.html`로 fallback해야 합니다.

검증 범위와 제약은 [QA 기록](../docs/QA.md)에 정리했습니다.

## 점수·저장·예측의 정직성

- Mock/LLM은 실수 유형을 분류하며 **수치 점수는 결정적 도메인 엔진**만 갱신합니다.
  첫 실수는 완만하게 증가하고 재발은 더 크게 증가하며, 교정 성공은 낮춥니다. 범위는 0–100입니다.
- 학습 사건과 DNA는 한 저장 값으로 함께 커밋하고, 제출 ID로 중복 반영을 차단합니다.
  분석 재렌더·재시도·새로고침으로 기록을 반복 생성하지 않습니다.
- 데이터는 `ft:{userId}:...`로 분리합니다. 기존 MVP의 `dna/mistakes/traps` 키를 읽어
  `learning` 값으로 전환하므로 이전 기록을 삭제하지 않습니다. 풀이 세션도 사용자별로 복원합니다.
- Web은 `localStorage`, native는 AsyncStorage, 로직 테스트는 메모리 KV를 사용합니다.
- Trap HIT는 **오답이면서 판별된 유형이 목표 유형과 일치**할 때만 표시합니다.
  Mock은 명시한 오답 패턴이나 풀이 근거가 없으면 중립 피드백을 주고 유형 점수를 추측해 올리지 않습니다.
- 리포트의 비율은 저장된 Trap 결과에서 계산한 관찰치입니다. 과거 오답이 없는 주를
  가짜 추이로 표시하지 않으며 Trap 오답도 주차별 집계에 포함합니다.
- 예측의 0–100 값은 검증된 확률이 아닙니다. 차별·비난성 표현은 tone guard로 검사합니다.

## Croche 상태와 구조

**Real Croche: NOT CONNECTED.** 이 작업은 실제 SDK·엔드포인트·인증·모델 ID를 만들거나
실제 연결을 시도하지 않습니다. 기본 런타임은 `MockCrocheAIService`이고 UI 배지는 이 모드를 표시합니다.
`mode=real`인데 client가 없으면 Mock으로 fallback하고 연결 불가 상태를 명시합니다.

```
src/services/ai/
  CrocheAIService.ts         # 분석 / 예측 / Trap / 연습 문제 인터페이스
  MockCrocheAIService.ts     # 결정적 분류와 유한 템플릿, 로컬 데모 백엔드
  RealCrocheAIService.ts     # future client 어댑터, fake client로만 검증
  modelPolicy.ts            # 작업별 모델 티어 정책
  tools.ts                  # Zod로 검증하는 tool abstraction
  toneGuard.ts
src/services/croche/
  client.ts                 # 공식 client 생성 경계 (TODO)
  memoryStore.ts             # 관련 기억 조회 추상화
```

실제 연동은 공식 문서·SDK·접근 정보가 제공된 뒤 이 경계에서 구현하고 별도 통합 검증이 필요합니다.
현재 위험도 계산·저장·UI는 서비스 경계와 분리되어 있습니다.

## 지원 범위

주 시연은 **Expo Web**입니다. 모바일 플랫폼 코드와 bundle/package ID `org.croche.failtwin`은
유지했지만 Android/iOS 실기기, 키보드와 SafeArea의 native 동작, iOS development build는 미검증입니다.
최신 iPhone Expo Go의 SDK 51 호환을 보장하지 않습니다. SDK 다중 major 업그레이드는 수행하지 않았습니다.
공식 지원 경로가 필요한 모바일 검증은 안정적인 Web 데모와 별도로 진행해야 합니다.

설계 문서는 [`.kiro/specs/failtwin/`](../.kiro/specs/failtwin/),
독립 검증 하네스는 [`verify/README.md`](verify/README.md)를 참고하세요.
`verify/`의 ambient 타입·Zod shim은 오프라인 검증에만 쓰며 실제 앱 typecheck와 bundle에서 제외합니다.
