#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://edisontw.github.io/ielts-self-learning}"
BASE="${BASE_URL%/}"
SENTINEL='V1.13-LEARN-FILTER-REVERSIBLE-COMPLETION-20260830-1'
CACHE_BUST="${GITHUB_SHA:-$(date +%s)}"
CDP_PORT="${CDP_PORT:-9234}"
URL="${BASE}/tests/browser-learner-uat-v113.html?sha=${CACHE_BUST}"

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

node --check learner-uat-fixes-v113.js
node --check tests/browser-learner-uat-v113.js

echo "Waiting for V1.13 learner UAT deployment sentinel at ${BASE} ..."
deployed=0
for attempt in {1..90}; do
  if curl -fsS --max-time 10 "${BASE}/V1.13-LEARNER-UAT-E2E-SENTINEL.txt?sha=${CACHE_BUST}-${attempt}" 2>/dev/null | grep -Fq "$SENTINEL"; then
    deployed=1
    break
  fi
  sleep 2
done
if [[ "$deployed" -ne 1 ]]; then
  echo 'V1.13 learner UAT deployment sentinel did not appear before the deadline.' >&2
  exit 1
fi

for asset in \
  index.html \
  learner-uat-fixes-v113.js \
  learner-uat-fixes-v113.css \
  tests/browser-learner-uat-v113.html \
  tests/browser-learner-uat-v113.js; do
  curl -fsS --max-time 30 "${BASE}/${asset}?sha=${CACHE_BUST}" >/dev/null || { echo "Missing deployed V1.13 asset: ${asset}" >&2; exit 1; }
done

LOG='/tmp/ielts-v113-production-chrome.log'
PROFILE='/tmp/ielts-v113-production-profile'
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
  --disable-background-timer-throttling \
  --disable-renderer-backgrounding \
  --disable-backgrounding-occluded-windows \
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
  echo "V1.13 deployed learner UAT failed with status ${status}." >&2
  cat "$LOG" >&2 || true
  exit "$status"
fi

echo 'V1.13 deployed learner UAT passed: Learn skill filtering and reversible lesson completion work on GitHub Pages.'
