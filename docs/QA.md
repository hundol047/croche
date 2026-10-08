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
| 개발 Expo Web | 실제 Chromium 렌더와 콘솔 확인. 디자인 정리 후 새 Expo Web에서 최종 375px 5개 시나리오 통과 |
| 프로덕션 Web export | `npm run build:web -- --max-workers 2` 통과, dist/ 생성 |
| 정적 export 브라우저 QA | 디자인 정리 후 최종 Chromium 375 / 430 / 768 / 1440px, 20개 시나리오 통과 |
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

최종 디자인의 export에서 전체 20개 시나리오를 실행한 화면입니다.
온보딩·홈·분석·예측·Trap·리포트의 375/430/1440px 캡처와 전후 비교는 [디자인 기록](DESIGN.md)을 참고하세요.

- [홈](screenshots/dashboard-375.png)
- [오답 분석 · DNA 83→100](screenshots/analysis-375.png)
- [Prediction HIT](screenshots/trap-hit-375.png)
- [교정 후 리포트 · 적중률 50%, 조건 누락 91](screenshots/report-375.png)

## 디자인 정리 후 재검증

`npm ci`, 실제 앱 typecheck·lint, Jest 12 suites / 76 tests, 독립 로직 typecheck·68 tests,
동일한 `demo:loop`, 프로덕션 export를 다시 통과했습니다.
개발 Web 5개와 최종 export 20개의 실제 Chromium 시나리오도 통과했습니다.
결과의 짧은 fade가 완료된 상태로 캡처하도록 개선한 뒤 4개 너비의 심사 루프 4개도 다시 통과했습니다.
새 브라우저 오류나 경고는 없으며 기존 pointerEvents 경고는 그대로 기록합니다.
이번 변경에서 패키지·lockfile·Expo major·점수 엔진·저장·Trap 판정은 변경하지 않았습니다.
expo-doctor의 17/17은 같은 의존성을 검증했던 이전 런타임 단계의 결과이며 이번 디자인 단계에서 재실행하지 않았습니다.

## 기능·화면 보완 · 2026-10-08

기준 원격 SHA `19df17b`에서 `3e^(-2x)`의 오채점과 잘못된 DNA 누적을 실제 Chromium으로 재현했습니다.
지원 범위를 명시한 정답·오답·판정 불가 채점, 저장 경계의 재검사, 사용자별 출제 이력을 추가했습니다.

- typecheck·독립 로직 typecheck·lint 통과.
- Jest **15 suites / 101 tests**, 독립 로직 **93 passed / 0 failed**.
- `demo:loop`의 조건 누락 **83→100→91**, HIT 1/2, 정답 연습 1회 유지.
- 최종 프로덕션 Web export 통과. 의존성·잠금 파일·Expo major는 변경하지 않았습니다.
- 개발 Web에서 375px의 9개 시나리오 통과. 마지막 채점 경계 보완 후 심사 루프와 수식 입력 2개도 다시 확인했습니다.
- 최종 export의 375 / 430 / 768 / 1440px에서 9개씩 **36개 시나리오 모두 통과**.
  console/page 오류 0개이며 기존 pointerEvents 경고만 기록했습니다.

추가 검증은 동등 수식의 정답·DNA 보호, 지원 밖 입력과 실행 코드의 미반영,
세 과목의 서로 다른 유형·정답, 18개 출제 후 소진·다른 과목 전환,
Trap 판정 불가·새로고침·HIT·교정·유한 문제 소진입니다.
54개 추가 문제의 정답은 유형별 수학 조건과 화면에 표시한 물리·Python 수를 독립 계산해 검증합니다.
프록시 테스트는 가짜 transport로 URL·비밀 값 노출 방지·응답 검증·타임아웃·abort를 확인합니다.
추가로 실제 제출한 두 오답의 날짜를 QA 브라우저에서 두 주의 테스트 기록으로 설정하여,
375/430/768/1440px의 다중 주 차트 표시와 카드 내부 폭을 별도로 확인했습니다.
[다중 주 차트](screenshots/multiweek-375.png)는 이 테스트 기록이며 실제 사용자 이력이나 심사 시드가 아닙니다.

초기 브라우저 검증에서 종료된 개발 서버와 활성 버튼의 ARIA 속성 기대를 수정한 뒤 재검증했습니다.
애플리케이션 오류를 무시하거나 콘솔을 숨기지 않습니다. 기존 pointerEvents 경고 한 종류는 기록합니다.
Android/iOS 도구·실기기는 없어 키보드·SafeArea·네이티브 뒤로 가기는 미검증입니다.
사용자가 Croche 연결 자료가 아직 없다고 확인했으며, 실제 Croche·서버 인증·배포는 미검증·미구현입니다.

채점 범위와 출제 제약은 [GRADING](GRADING.md), AI 연결에 필요한 정보는 [AI_INTEGRATION](AI_INTEGRATION.md),
화면 전후 비교는 [DESIGN](DESIGN.md)에 정리했습니다.

## 90,000개 난이도별 문제 은행 · 2026-10-08

기준 원격 SHA `0a0e98f`의 과목당 18개 문제를 세 과목 각 30,000개 조건 조합으로 확장했습니다.
쉬움·보통·어려움별 10,000개, 전체 45개 유형입니다. 독립 집필이나 실제 AI 생성으로 표시하지 않습니다.

| 검사 | 최종 결과 |
|---|---|
| 앱 typecheck·독립 로직 typecheck·lint | 통과, lint 오류·경고 0개 |
| Jest | **16 suites / 104 tests passed** |
| 독립 로직 | **96 passed / 0 failed** |
| 문제 은행 전수 | **90,000개**의 본문 조건에서 정답을 별도 계산해 대조. 본문·ID 중복 0개, 유형별 2,000개, 스키마·정답 채점 모두 통과 |
| 출제 저장 | 재시작·동시 출제·사용자/과목/난이도/유형 분리·저장 실패 재시도·소진·기존 이력 보존 통과 |
| 저장 규모 | 소진된 v2 전체 출제 위치 **45개 번호 / 1,807 UTF-8 bytes**. 학습 기록 전체 크기를 뜻하지 않음 |
| `demo:loop` | 기존 조건 누락 **83→100→91**, Trap HIT 1/2·교정 유지 |
| 프로덕션 Web export | SDK 51의 `npm run build:web -- --max-workers 2` 통과 |
| 실제 Chromium 최종 export | **375·430·768·1440px × 11개 = 44개 시나리오 통과** |
| 브라우저 오류·넘침 | console/page 오류 0개, 가로 넘침 없음. 기존 pointerEvents 경고만 허용·기록 |

새 브라우저 시나리오는 모든 과목·난이도의 정답 제출과 세션 복원, 유형 지정 후 서로 다른 조건 출제,
진행 번호 보존, 은행 예약 저장 실패 후 재시도, 마지막 문제와 난이도 소진입니다.
소진 검사는 9,999개를 열어본 테스트 이력을 설정한 뒤 마지막 문제를 실제로 출제·정답 제출하고
새로고침 후 비활성 상태와 다른 난이도 접근을 확인합니다. UI에서 10,000회 클릭했다는 의미가 아닙니다.
기존 신규 사용자·심사 데모·동등 수식·판정 불가·Trap HIT/중립/교정·저장 실패 검증도 모두 유지합니다.

실제 화면 캡처를 직접 검토했습니다. 어려움 Python은 최소 조건에서도 중첩 반복·조건 판별과
공유 참조의 결과 차이가 발생하도록 구성하고 전수 검사에 포함했습니다.
해설의 긴 부동소수점 표기를 발견해 정리했습니다.
초기 브라우저 테스트의 DNA 기대값은 정답 연습에 따른 정상 교정 **83→74**를 반영해 수정했으며,
점수 엔진을 변경하거나 해당 검증을 제거하지 않았습니다.
최종 사진과 전후 비교는 [DESIGN](DESIGN.md), 유형·출제 제약은 [PROBLEM_BANK](PROBLEM_BANK.md)를 참고하세요.

Expo major·의존성·lockfile은 그대로입니다. Real Croche 미연결, native 실기기 미검증,
여러 탭/기기 간 저장 동기화 미구현 상태도 유지됩니다. CI 결과는 최종 PR head의 checks를 참조하세요.
