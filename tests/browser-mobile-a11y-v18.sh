#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4193}"
BASE="http://127.0.0.1:${PORT}"
URL="$BASE/tests/browser-mobile-a11y-v18.html"

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

python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/ielts-v18-mobile-a11y-http.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
for _ in {1..20}; do
  if curl -fsS "$URL" >/dev/null; then break; fi
  sleep 0.25
done

DOM='/tmp/ielts-v18-mobile-a11y-dom.html'
LOG='/tmp/ielts-v18-mobile-a11y-chrome.log'
PROFILE='/tmp/ielts-v18-mobile-a11y-profile'
rm -rf "$PROFILE" "$DOM" "$LOG"
set +e
timeout 60s "$CHROME" \
  --headless=new \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --disable-background-networking \
  --disable-component-update \
  --disable-crash-reporter \
  --user-data-dir="$PROFILE" \
  --window-size='1280,1100' \
  --virtual-time-budget=24000 \
  --dump-dom "$URL" >"$DOM" 2>"$LOG"
status=$?
set -e
if [[ "$status" -ne 0 && "$status" -ne 124 ]]; then
  echo "V1.8 mobile/a11y Chrome exited with status $status" >&2
fi
if ! grep -Fq 'V18_MOBILE_A11Y_PASS' "$DOM"; then
  echo 'V1.8 mobile/accessibility browser matrix failed.' >&2
  grep -F 'V18_MOBILE_A11Y_' "$DOM" >&2 || true
  cat "$LOG" >&2 || true
  exit 1
fi

echo 'V1.8 mobile/accessibility matrix passed: 360/390/430/768 responsive routes, 24px targets, Prompt modal focus trap/return, Site Guide focus trap/return.'
