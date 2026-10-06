#!/usr/bin/env bash
# Offline verification of FailTwin's pure-TS core (no npm install needed).
# Typechecks and runs the domain/service/storage unit tests using a bundled
# zod shim + a tiny test harness. See README "Offline verification".
#
# On a networked machine prefer `npm install && npm test` (real Jest + zod).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Typechecking pure-logic layer + tests"
tsc -p verify/tsconfig.verify.json --noEmit

echo "==> Compiling for the offline test runner"
tsc -p verify/tsconfig.verify.json

echo "==> Running unit tests"
node -r ./verify/preload.js .verify-out/verify/run.js
