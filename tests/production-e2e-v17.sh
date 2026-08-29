#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://edisontw.github.io/ielts-self-learning}"
BASE="${BASE_URL%/}"
SENTINEL='V1.7-MA02-PRODUCTION-E2E-GATE-20260829-1'
CACHE_BUST="${GITHUB_SHA:-$(date +%s)}"
CDP_PORT="${CDP_PORT:-9228}"
URL="${BASE}/tests/browser-production-ma02-v17.html?sha=${CACHE_BUST}"

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

LOG='/tmp/ielts-production-v17-chrome.log'
PROFILE='/tmp/ielts-production-v17-profile'
rm -rf "$PROFILE" "$LOG"
CHROME_PID=''
cleanup(){ [[ -n "$CHROME_PID" ]] && kill "$CHROME_PID" 2>/dev/null || true; }
trap cleanup EXIT
"$CHROME" \
  --headless=new \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --disable-component-update \
  --disable-crash-reporter \
  --remote-debugging-port="$CDP_PORT" \
  --remote-allow-origins='*' \
  --user-data-dir="$PROFILE" \
  --window-size='1440,1000' \
  "$URL" >"$LOG" 2>&1 &
CHROME_PID=$!

set +e
CDP_PORT="$CDP_PORT" TARGET_URL="$URL" E2E_TIMEOUT_MS=60000 \
  timeout 70s node --experimental-websocket tests/chrome-cdp-result-v17.mjs
status=$?
set -e
if [[ "$status" -ne 0 ]]; then
  echo "V1.7 deployed browser E2E failed with status ${status}." >&2
  cat "$LOG" >&2 || true
  exit "$status"
fi

echo 'Production E2E passed: deployed GitHub Pages MA01/MA02 selector, MA02 Reading/history/Error Notebook, dynamic Writing ids, browser-voice gate, L04/QL03 existing-practice CTAs, and 390px selector/overflow.'
