#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4191}"
BASE="http://127.0.0.1:${PORT}"
URL="$BASE/tests/browser-today-primary-v18.html"

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

python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/ielts-v18-today-http.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
for _ in {1..20}; do
  if curl -fsS "$URL" >/dev/null; then break; fi
  sleep 0.25
done

DOM='/tmp/ielts-v18-today-dom.html'
LOG='/tmp/ielts-v18-today-chrome.log'
PROFILE='/tmp/ielts-v18-today-profile'
rm -rf "$PROFILE" "$DOM" "$LOG"
set +e
timeout 55s "$CHROME" \
  --headless=new \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --disable-background-networking \
  --disable-component-update \
  --disable-crash-reporter \
  --user-data-dir="$PROFILE" \
  --window-size='1280,900' \
  --virtual-time-budget=18000 \
  --dump-dom "$URL" >"$DOM" 2>"$LOG"
status=$?
set -e
if [[ "$status" -ne 0 && "$status" -ne 124 ]]; then
  echo "V1.8 Today Chrome exited with status ${status}." >&2
fi
if ! grep -Fq 'V18_TODAY_PRIMARY_PASS' "$DOM"; then
  echo 'V1.8 Today primary-action browser matrix failed.' >&2
  grep -o 'V18_TODAY_PRIMARY_[^<]*' "$DOM" >&2 || true
  cat "$LOG" >&2 || true
  exit 1
fi

echo 'V1.8 Today browser matrix passed: due review > Study Plan > AI feedback > productive/adaptive, with one full-size primary action.'
