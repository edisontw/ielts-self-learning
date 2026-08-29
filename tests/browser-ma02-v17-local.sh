#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4187}"
BASE="http://127.0.0.1:${PORT}"

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

python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/ielts-v17-http.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
for _ in {1..20}; do
  if curl -fsS "$BASE/tests/browser-production-ma02-v17.html" >/dev/null; then break; fi
  sleep 0.25
done

DOM='/tmp/ielts-v17-local-dom.html'
LOG='/tmp/ielts-v17-local-chrome.log'
PROFILE='/tmp/ielts-v17-local-profile'
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
  --dump-dom "$BASE/tests/browser-production-ma02-v17.html" >"$DOM" 2>"$LOG"
status=$?
set -e
if [[ "$status" -ne 0 && "$status" -ne 124 ]]; then
  echo "V1.7 local harness Chrome exited with status ${status}" >&2
fi
if ! grep -Fq 'V17_PRODUCTION_E2E_PASS' "$DOM"; then
  echo 'V1.7 MA02 local browser harness failed.' >&2
  grep -F 'V17_PRODUCTION_E2E_' "$DOM" >&2 || true
  cat "$LOG" >&2 || true
  exit 1
fi

echo 'V1.7 local browser harness passed: multi-mock selector, MA02 storage/error flow, dynamic Writing, browser-voice gate, new existing-practice CTAs, and 390px overflow check.'
