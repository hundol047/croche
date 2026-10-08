# 독립 로직 검증 하네스

`verify/`는 앱 번들에 포함되지 않습니다. 실제 개발 검사는 `npm ci` 후
`npm run typecheck`와 Jest를 사용하세요. 앱 tsconfig는 이 디렉터리의 ambient 선언을 제외합니다.

- `zod-shim/`: 독립 로직 검사에만 쓰는 Zod 부분 구현. 실제 Jest와 앱은 설치한 Zod를 사용합니다.
- `harness.ts`, `run.ts`: 같은 로직·서비스 테스트 파일을 TypeScript와 Node로 실행합니다.
- `preload.js`: 컴파일 결과에서 `@/*`와 shim 경로를 해석합니다.
- `demo-loop.ts`: UI와 같은 저장·도메인 함수를 사용해 정확한 심사 루프를 실행하고 결과를 assert합니다.
- UI ambient 파일은 별도의 제한된 stub 검사 용도입니다. 실제 RN/Expo 타입 검사를 대체하지 않습니다.

```bash
npm run typecheck:logic
npm run test:logic
npm run demo:loop
```

2026-10-07 검증: 독립 로직 **68 passed / 0 failed**, typecheck 통과.
심사 루프는 조건 누락 **83→100**, 근거 기반 Prediction HIT, 새 Trap 교정 **100→91**,
저장된 Trap 2회 중 적중 1회·교정 성공 1회를 확인합니다.
전체 Jest는 **12 suites / 76 tests**이며 UI 렌더 테스트도 포함합니다.
