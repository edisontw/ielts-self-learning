#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://edisontw.github.io/ielts-self-learning}"
BASE="${BASE_URL%/}"
SENTINEL='V1.7-MA02-PRODUCTION-E2E-GATE-20260829-1'
CACHE_BUST="${GITHUB_SHA:-$(date +%s)}"
PASS_MARKER='<pre id="result">V17_PRODUCTION_E2E_PASS</pre>'

if command -v google-chrome >/dev/null 2>&1; then
  CHROME=google-chrome
elif command -v google-chrome-stable >/dev/null 2>&1; then
  CHROME=google-chrome-stable
elif command -v chromium >/dev/null 2>&1; then
  CHROME=chromium
else
  echo 'No Chrome/Chromium binary found on runner' >&2
  exit 1
fi

echo "Waiting for the current main deployment sentinel at ${BASE} ..."
deployed=0
for attempt in {1..90}; do
  if curl -fsS --max-time 10 "${BASE}/V1.7-PRODUCTION-E2E-SENTINEL.txt?sha=${CACHE_BUST}-${attempt}" 2>/dev/null | grep -Fq "$SENTINEL"; then
    deployed=1
    break
  fi
  sleep 2
done
if [[ "$deployed" -ne 1 ]]; then
  echo 'Production deployment sentinel did not appear before the E2E deadline.' >&2
  exit 1
fi

for asset in \
  index.html \
  mock-test-data-v2.js \
  mock-test-registry-v17.js \
  mock-test-runtime-v1.js \
  mock-test-audio-upgrade-v1.js \
  existing-practice-routing-v17.js \
  existing-practice-routing-runtime-v16.js \
  tests/browser-production-ma02-v17.html; do
  curl -fsS --max-time 15 "${BASE}/${asset}?sha=${CACHE_BUST}" >/dev/null || { echo "Missing deployed V1.7 asset: ${asset}" >&2; exit 1; }
done

DOM='/tmp/ielts-production-v17.html'
LOG='/tmp/ielts-production-v17-chrome.log'
PROFILE='/tmp/ielts-production-v17-profile'
rm -rf "$PROFILE" "$DOM" "$LOG"
set +e
timeout 70s "$CHROME" \
  --headless=new \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --disable-background-networking \
  --disable-component-update \
  --disable-crash-reporter \
  --user-data-dir="$PROFILE" \
  --window-size='1440,1000' \
  --virtual-time-budget=35000 \
  --dump-dom "${BASE}/tests/browser-production-ma02-v17.html?sha=${CACHE_BUST}" >"$DOM" 2>"$LOG"
status=$?
set -e
if [[ "$status" -ne 0 && "$status" -ne 124 ]]; then
  echo "Production Chrome exited with status ${status}" >&2
fi
if ! grep -Fq "$PASS_MARKER" "$DOM"; then
  echo 'V1.7 deployed browser E2E failed.' >&2
  grep -o '<pre id="result">[^<]*</pre>' "$DOM" >&2 || true
  cat "$LOG" >&2 || true
  exit 1
fi

echo 'Production E2E passed: deployed GitHub Pages MA01/MA02 selector, MA02 Reading/history/Error Notebook, dynamic Writing ids, browser-voice gate, L04/QL03 existing-practice CTAs, and 390px selector/overflow.'
