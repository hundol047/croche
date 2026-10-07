#!/usr/bin/env bash
# Repeatable CI-equivalent QA; fail immediately without changing the lockfile.
set -euo pipefail
cd "$(dirname "$0")/.."
node --version
npm --version
npm ci
npm run typecheck
npm run lint
npm test -- --ci --maxWorkers=2
npm run typecheck:logic
npm run test:logic
npm run demo:loop
EXPO_NO_TELEMETRY=1 npm run build:web -- --max-workers 2
if [ "${1:-}" = "--web" ]; then
  echo "Start browser QA with npm run test:web in another terminal."
  EXPO_NO_TELEMETRY=1 npm run web -- --offline
fi
