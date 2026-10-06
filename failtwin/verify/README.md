# Offline verification harness (`verify/`)

> **Not part of the shipped app.** This directory exists only to type-check and
> unit-test FailTwin **in an offline sandbox where `npm install` is unavailable**
> (the npm registry was blocked during development). On a networked machine you
> should instead run the real toolchain: `npm install && npm run typecheck && npm test`.

## What's here
- `zod-shim/` — a tiny dependency-free re-implementation of the subset of `zod`
  that `src/domain/schemas.ts` and `src/services/ai/tools.ts` use, with real
  validation semantics so the schema tests are meaningful.
- `harness.ts` + `run.ts` — a minimal Jest-compatible `describe/it/expect`
  runner so the standard test files in `__tests__/*.test.ts` run under plain
  `tsc` + `node`. The same files run unchanged under real Jest.
- `preload.js` — a node `require` hook mapping the `@/*` path alias and `zod`
  to the compiled output / shim at runtime.
- `*.d.ts` + `tsconfig.*.json` — ambient stubs for the React Native / Expo
  surface so the `.tsx` layer type-checks without `node_modules`.

## Run it
```bash
bash scripts/verify-logic.sh          # logic typecheck + unit tests
tsc -p verify/tsconfig.ui.json        # UI (.tsx) typecheck with offline stubs
```

## Results on this machine
- **Logic typecheck:** clean (0 errors).
- **Unit tests:** 44 passed / 0 failed.
- **UI typecheck:** 0 real errors. **1 residual error** at
  `src/state/AppContext.tsx:102` is a known limitation of the hand-rolled React
  `createContext` type stub (automatic-JSX-runtime generic inference), **not** a
  defect in the app. `<AppCtx.Provider value={value}>` with `value: AppState` is
  standard, correct React and type-checks under the real `@types/react`
  (verify with `npm install && npm run typecheck`).
