#!/usr/bin/env bash
set -euo pipefail
PORT="${PORT:-4196}"
URL="http://127.0.0.1:${PORT}/tests/browser-writing-task2-v110.html"
if command -v google-chrome >/dev/null 2>&1; then CHROME=google-chrome; elif command -v google-chrome-stable >/dev/null 2>&1; then CHROME=google-chrome-stable; elif command -v chromium >/dev/null 2>&1; then CHROME=chromium; else echo 'No Chrome/Chromium binary found on runner' >&2; exit 1; fi
python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/ielts-v110-task2-http.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
for _ in {1..20}; do curl -fsS "$URL" >/dev/null && break; sleep .25; done
DOM='/tmp/ielts-v110-task2-dom.html'; LOG='/tmp/ielts-v110-task2-chrome.log'; PROFILE='/tmp/ielts-v110-task2-profile'; rm -rf "$PROFILE" "$DOM" "$LOG"
set +e
timeout 70s "$CHROME" --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage --disable-background-networking --disable-component-update --disable-crash-reporter --user-data-dir="$PROFILE" --window-size='1280,1000' --virtual-time-budget=24000 --dump-dom "$URL" >"$DOM" 2>"$LOG"
status=$?
set -e
if [[ "$status" -ne 0 && "$status" -ne 124 ]]; then echo "V1.10 Task 2 Chrome exited with status ${status}." >&2; fi
if ! grep -Fq 'V110_TASK2_PASS' "$DOM"; then echo 'V1.10 Task 2 browser flow failed.' >&2; grep -o 'V110_TASK2_[^<]*' "$DOM" >&2 || true; cat "$LOG" >&2 || true; exit 1; fi
echo 'V1.10 Task 2 browser flow passed: 5 families × 2, 250-word gate, first evidence, AI priorities, retry comparison, Test Mode lock, Diagnostic Center integration.'
