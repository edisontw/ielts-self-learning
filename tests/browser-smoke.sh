#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4173}"
BASE="http://127.0.0.1:${PORT}"

if command -v google-chrome >/dev/null 2>&1; then
  CHROME=google-chrome
elif command -v google-chrome-stable >/dev/null 2>&1; then
  CHROME=google-chrome-stable
elif command -v chromium >/dev/null 2>&1; then
  CHROME=chromium
else
  echo "No Chrome/Chromium binary found on runner" >&2
  exit 1
fi

python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/ielts-http.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

for _ in {1..20}; do
  if curl -fsS "$BASE/index.html" >/dev/null; then break; fi
  sleep 0.25
done

for asset in index.html app.js data.js boot-guard-v1.js styles.css; do
  curl -fsS "$BASE/$asset" >/dev/null || { echo "Missing asset: $asset" >&2; exit 1; }
done

set +e
timeout 25s "$CHROME" \
  --headless=new \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --disable-background-networking \
  --disable-component-update \
  --virtual-time-budget=5000 \
  --dump-dom "$BASE/" >/tmp/ielts-dom.html 2>/tmp/ielts-chrome.log
CHROME_STATUS=$?
set -e

if [[ "$CHROME_STATUS" -ne 0 && "$CHROME_STATUS" -ne 124 ]]; then
  echo "Chrome exited with status $CHROME_STATUS" >&2
fi

if ! grep -q 'class="app-shell"' /tmp/ielts-dom.html; then
  echo "Browser smoke failed: app-shell was not rendered." >&2
  echo "--- Browser DOM ---" >&2
  cat /tmp/ielts-dom.html >&2 || true
  echo "--- Chrome log ---" >&2
  cat /tmp/ielts-chrome.log >&2 || true
  echo "--- HTTP log ---" >&2
  cat /tmp/ielts-http.log >&2 || true
  exit 1
fi

echo "Browser smoke passed: app-shell rendered successfully."
