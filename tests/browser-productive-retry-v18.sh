#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4191}"
BASE="http://127.0.0.1:${PORT}"
URL="$BASE/tests/browser-productive-retry-v18.html"

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

python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/ielts-v18-productive-http.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
for _ in {1..20}; do
  if curl -fsS "$URL" >/dev/null; then break; fi
  sleep 0.25
done

DOM='/tmp/ielts-v18-productive-dom.html'
LOG='/tmp/ielts-v18-productive-chrome.log'
PROFILE='/tmp/ielts-v18-productive-profile'
rm -rf "$PROFILE" "$DOM" "$LOG"
set +e
timeout 45s "$CHROME" \
  --headless=new \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --disable-background-networking \
  --disable-component-update \
  --disable-crash-reporter \
  --user-data-dir="$PROFILE" \
  --window-size='1280,1000' \
  --virtual-time-budget=12000 \
  --dump-dom "$URL" >"$DOM" 2>"$LOG"
status=$?
set -e
if [[ "$status" -ne 0 && "$status" -ne 124 ]]; then
  echo "V1.8 productive retry Chrome exited with status $status" >&2
fi
if ! grep -Fq 'V18_PRODUCTIVE_RETRY_PASS' "$DOM"; then
  echo 'V1.8 productive retry browser flow failed.' >&2
  grep -F 'V18_PRODUCTIVE_RETRY_' "$DOM" >&2 || true
  cat "$LOG" >&2 || true
  exit 1
fi

echo 'V1.8 productive retry browser flow passed: Writing + Speaking feedback → focused revision → retry evidence → cycle closure.'
