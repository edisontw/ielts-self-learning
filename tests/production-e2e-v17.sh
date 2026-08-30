#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://edisontw.github.io/ielts-self-learning}"
BASE="${BASE_URL%/}"
SENTINEL='V1.12-MA02-PRODUCTION-AUDIO-LIVE-CLOSURE-20260830-2'
CACHE_BUST="${GITHUB_SHA:-$(date +%s)}"
CDP_PORT="${CDP_PORT:-9228}"
URL="${BASE}/tests/browser-ma02-audio-v112.html?sha=${CACHE_BUST}"

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

node --check tests/browser-ma02-audio-v112.js
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
  media/audio/mock-tests/ma02-production-assets-v1.json \
  media/audio/mock-tests/ma02-listening-part1-printmaking-workshop-booking.mp3 \
  media/audio/mock-tests/ma02-listening-part2-observatory-visitor-orientation.mp3 \
  media/audio/mock-tests/ma02-listening-part3-local-history-digitisation-project.mp3 \
  media/audio/mock-tests/ma02-listening-part4-seed-banks-seed-storage.mp3 \
  tests/browser-ma02-audio-v112.html \
  tests/browser-ma02-audio-v112.js; do
  curl -fsS --max-time 30 "${BASE}/${asset}?sha=${CACHE_BUST}" >/dev/null || { echo "Missing deployed V1.12 asset: ${asset}" >&2; exit 1; }
done

LOG='/tmp/ielts-production-v112-chrome.log'
PROFILE='/tmp/ielts-production-v112-profile'
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
  echo "V1.12 deployed MA02 production-audio E2E failed with status ${status}." >&2
  cat "$LOG" >&2 || true
  exit "$status"
fi

echo 'Production E2E passed: deployed MA02 production copy, four exact MP3 assets, browser metadata decoding, runtime source wiring, fallback disclosure and 390px layout.'
