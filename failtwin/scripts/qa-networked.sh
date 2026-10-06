#!/usr/bin/env bash
#
# FailTwin — full QA on a NETWORKED machine.
#
# Run this on any machine with internet access (your laptop or CI). It performs
# the end-to-end verification that could NOT run in the offline dev sandbox
# (npm registry was blocked there): dependency install, typecheck, lint, the
# full Jest suite, and an Expo Web launch for visual QA.
#
# Usage:
#   cd failtwin
#   bash scripts/qa-networked.sh            # install + typecheck + lint + test
#   bash scripts/qa-networked.sh --web      # also launch Expo Web (manual QA)
#
# Exit code is non-zero if any non-interactive step fails.
set -uo pipefail
cd "$(dirname "$0")/.."

WEB=0
[ "${1:-}" = "--web" ] && WEB=1

pass=0; fail=0
step() { echo; echo "──────────────────────────────────────────"; echo "▶ $1"; echo "──────────────────────────────────────────"; }
ok()   { echo "✅ $1"; pass=$((pass+1)); }
bad()  { echo "❌ $1"; fail=$((fail+1)); }

step "0) Environment"
node --version || { echo "node is required"; exit 1; }
npm --version

step "1) Install dependencies (npm ci if lockfile, else npm install)"
if [ -f package-lock.json ]; then
  npm ci && ok "npm ci" || { bad "npm ci"; echo "   falling back to npm install"; npm install && ok "npm install (fallback)" || bad "npm install"; }
else
  echo "   (no package-lock.json yet — generating one with npm install)"
  npm install && ok "npm install (lockfile generated — commit package-lock.json)" || bad "npm install"
fi

step "2) TypeScript typecheck (strict, full RN types)"
npm run typecheck && ok "typecheck" || bad "typecheck"

step "3) Lint (eslint-config-expo)"
npm run lint && ok "lint" || bad "lint"

step "4) Logic typecheck (offline-equivalent core)"
npm run typecheck:logic && ok "typecheck:logic" || bad "typecheck:logic"

step "5) Full test suite (Jest: logic + component rendering)"
npm test -- --ci && ok "jest" || bad "jest"

step "6) Logic test suite (standalone harness)"
npm run test:logic && ok "test:logic" || bad "test:logic"

step "7) Core-loop runtime demo"
npm run demo:loop && ok "demo:loop" || bad "demo:loop"

echo
echo "══════════════════════════════════════════"
echo "  Non-interactive QA: ${pass} passed, ${fail} failed"
echo "══════════════════════════════════════════"

if [ "$WEB" = "1" ]; then
  step "8) Expo Web — manual visual QA"
  cat <<'GUIDE'
Launching Expo Web. In the browser verify each item:

  [ ] 앱 로드 (빈 화면 없음), FailTwin 로고 보임
  [ ] 온보딩: 이름 입력 / 목적·과목 선택 / "시작하기"
  [ ] "⚡ 심사용 빠른 데모" → 대시보드에 Error DNA 시드 표시
  [ ] 대시보드: 모드 배지(Demo Mock), Error DNA 바, 다음 실수 배너
  [ ] 문제 풀기 → 답/풀이/확신도 입력 → 제출
  [ ] AI 분석: 정답여부·핵심실수·원인·근거·교정·재발위험도·Error DNA 변화
  [ ] 오답 예측 화면: "AI 예측 위험도" 표기(확률 아님)
  [ ] Trap Mode: 새 문제 생성 → 제출 → Prediction HIT / Trap 극복
  [ ] 학습 리포트: 재발률 line chart + 지표 + AI Insight
  [ ] 브라우저 새로고침 후에도 데이터 유지(영속성)
  [ ] 한글 폰트 정상, 카드 정렬, 버튼 터치영역, 텍스트 오버플로 없음

스크린샷 권장: 대시보드 / 분석 / Trap 결과 / 리포트 (docs/screenshots/ 에 저장).
Ctrl+C 로 종료.
GUIDE
  echo
  npm run web
fi

[ "$fail" -eq 0 ]
