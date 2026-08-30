#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4187}"
BASE="http://127.0.0.1:${PORT}"
CDP_PORT="${CDP_PORT:-9227}"
URL="$BASE/tests/browser-ma02-audio-v112.html"

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
python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/ielts-v112-http.log 2>&1 &
SERVER_PID=$!
CHROME_PID=''
cleanup(){
  [[ -n "$CHROME_PID" ]] && kill "$CHROME_PID" 2>/dev/null || true
  kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT
for _ in {1..20}; do
  if curl -fsS "$URL" >/dev/null; then break; fi
  sleep 0.25
done

LOG='/tmp/ielts-v112-local-chrome.log'
PROFILE='/tmp/ielts-v112-local-profile'
rm -rf "$PROFILE" "$LOG"
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
  echo "V1.12 MA02 local production-audio harness failed with status ${status}." >&2
  cat "$LOG" >&2 || true
  exit "$status"
fi

echo 'V1.12 local browser harness passed: MA02 production copy, four exact MP3 byte sizes, browser metadata decoding, runtime paths, one-play control, fallback disclosure and 390px layout.'
