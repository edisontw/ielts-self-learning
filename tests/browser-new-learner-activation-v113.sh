#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4203}"
BASE="http://127.0.0.1:${PORT}"
CDP_PORT="${CDP_PORT:-9243}"
URL="$BASE/tests/browser-new-learner-activation-v113.html?sha=local-$(date +%s)"

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

node --check tests/browser-new-learner-activation-v113.js
python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/ielts-v113-a1-http.log 2>&1 &
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

LOG='/tmp/ielts-v113-a1-chrome.log'
PROFILE='/tmp/ielts-v113-a1-profile'
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
  --window-size='1440,1300' \
  "$URL" >"$LOG" 2>&1 &
CHROME_PID=$!

set +e
CDP_PORT="$CDP_PORT" TARGET_URL="$URL" E2E_TIMEOUT_MS=90000 \
  timeout 100s node --experimental-websocket tests/chrome-cdp-result-v17.mjs
status=$?
set -e
if [[ "$status" -ne 0 ]]; then
  echo "V1.13 A1 new learner activation failed with status ${status}." >&2
  cat "$LOG" >&2 || true
  exit "$status"
fi

echo 'V1.13 A1 new learner activation passed: fresh 390px learner → Placement → profile → Study Plan → Today → first plan action.'
