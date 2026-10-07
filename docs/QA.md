# 검증 기록 · 2026-10-07

주 대상은 **Expo Web / Mock AI**입니다. 실제 Croche나 모바일 검증 결과로 해석하면 안 됩니다.

| 검사 | 결과 |
|---|---|
| 잠금 파일 생성 후 `npm ci` 재설치 | 통과, package-lock.json 사용, 의존성 선언의 Expo/React/RN 버전 유지 |
| TypeScript strict · ESLint | 통과, lint 오류·경고 0개. 앱 검사에서 오프라인 ambient 타입 제외 |
| Jest | 12 suites / 76 tests passed |
| 독립 로직 typecheck · 테스트 | 통과, 68 passed / 0 failed. shim 결과와 실제 Jest 결과를 별도로 확인 |
| `demo:loop` | 동일한 도메인·저장 함수로 조건 누락 83→100→91, HIT·교정·리포트 assert 통과 |
| Expo 의존성 검사 | 프로젝트에 설치된 SDK 51 CLI의 `expo install --check` 통과 |
| `expo-doctor` | 온라인 17/17 통과. SDK 51 스키마가 지원하지 않는 top-level newArchEnabled 제거 |
| 개발 Expo Web | 실제 Chromium 렌더와 콘솔 확인. 초기 4개 너비 16개 시나리오, 최종 375px 5개 시나리오 통과 |
| 프로덕션 Web export | `npm run build:web -- --max-workers 2` 통과, dist/ 생성 |
| 정적 export 브라우저 QA | Chromium 375 / 430 / 768 / 1440px, 20개 시나리오 통과 |
| GitHub Actions | npm ci·typecheck·lint·Jest·web export + 독립 logic-tests. 최신 SHA의 실행은 PR #1 checks 참조 |
| Android/iOS 실기기·development build | 미실행 |
| Real Croche | NOT CONNECTED. Real 서비스 테스트는 fake client만 사용 |

환경: Linux, Node 24.19.0, npm 11.9.0, Chromium 151,
Expo 51.0.39, Expo Router 3.5.24, React 18.2.0, RN 0.74.5.
CI는 Node 20입니다. 정적 검증 서버는 SPA 깊은 경로에 index.html fallback을 적용했습니다.
인터넷 제한 환경의 Expo 실행은 공식 `--offline` 옵션으로도 확인했습니다.

이 클라우드에서 온라인 Expo 검사를 실행할 때는 아래 지원 옵션으로 프록시와 읽기 전용 홈 문제를
해결했습니다. TLS·패키지 서명·체크섬 검증을 끄지 않았습니다.

```bash
cd failtwin
EXPO_NO_CACHE=1 EXPO_NO_TELEMETRY=1 NODE_USE_ENV_PROXY=1 npx expo-doctor
EXPO_NO_CACHE=1 EXPO_NO_TELEMETRY=1 NODE_USE_ENV_PROXY=1 ./node_modules/.bin/expo install --check
```

`NODE_USE_ENV_PROXY`는 이 환경의 Node 24 기능입니다. 일반 개발 머신이나 CI에서는 자체 네트워크
환경에 맞게 설정하세요. 프록시·CA의 기존 바인딩을 사용했고 인증 값은 기록하지 않았습니다.

## 브라우저에서 확인한 내용

- 신규 온보딩에서 이름·목적·과목 선택, 빈 DNA와 리포트, 첫 문제 CTA.
- 공업수학·일반물리·Python의 기존 문제와 Mock 생성 문제, 풀이 입력·확신도·제출 상태.
  숫자의 공백·소수·지수 표기와 복수 선택의 순서·대소문자 차이.
- 정확한 심사 루프, DNA 변화, Prediction, 새 내용의 Trap, 근거 기반 HIT·중립 결과·교정·리포트.
- 분석에서 재렌더/재시도/새로고침해도 제출당 사건 1개. Trap 결과도 한 번만 반영.
- 홈·분석·예측·Trap·리포트 새로고침과 깊은 경로, 세션이 없을 때 안전한 다음 동작.
- localStorage의 프로필·DNA·오답·Trap·리포트 복원. 데모 초기화가 실제 사용자 기록을 보존.
- 저장 공간 접근 차단과 저장 실패를 강제로 재현해 복구 UI·재시도·중복 방지를 확인.
- 가로 넘침과 실제 카드 내 SVG 차트 폭 검사. 좁은 화면과 데스크톱 스크린샷 직접 검토.

브라우저의 uncaught error, console error, unhandled rejection은 없었습니다.
SDK 51의 React Navigation 6가 발생시키는 **pointerEvents 폐기 예정 경고** 한 종류는 남아 있습니다.
이를 숨기거나 새 경고를 무시하지 않으며 브라우저 테스트가 해당 메시지만 구분해서 기록합니다.
SDK 다중 major 업그레이드는 하지 않았습니다.

## 수정한 결함

한 제출의 분석이 의존성 변경에 따라 반복 실행되며 사건과 점수를 계속 누적하는 버그를 실제 브라우저에서
재현했습니다. 사건 ID 기반 중복 차단과 원자적 저장으로 수정하고 영속 재시도·동시 호출을 회귀 검사합니다.
세션 복원, 중복 홈 스택 제거, 불확실한 오답의 HIT 방지, 과도한 숫자 prefix 파싱 방지,
Python 슬라이스 Trap의 잘못된 정답, 다중 선택 schema, 빈 주차의 가짜 추이와 비율의 조기 반올림도 수정했습니다.

네이티브 키보드·SafeArea 동작과 최신 iPhone Expo Go 호환은 아직 검증하지 않았습니다.
공식 Croche SDK·접근 정보가 제공되면 별도 통합 검증이 필요합니다.

## 최종 프로덕션 데모 캡처

최종 export에서 375px 심사 루프를 다시 실행하고 확인한 화면입니다.

- [홈](screenshots/dashboard-375.png)
- [오답 분석 · DNA 83→100](screenshots/analysis-375.png)
- [Prediction HIT](screenshots/trap-hit-375.png)
- [교정 후 리포트 · 적중률 50%, 조건 누락 91](screenshots/report-375.png)
