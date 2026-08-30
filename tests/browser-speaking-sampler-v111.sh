#!/usr/bin/env bash
set -euo pipefail
PORT="${PORT:-4197}"
URL="http://127.0.0.1:${PORT}/tests/browser-speaking-sampler-v111.html"
if command -v google-chrome >/dev/null 2>&1; then CHROME=google-chrome; elif command -v google-chrome-stable >/dev/null 2>&1; then CHROME=google-chrome-stable; elif command -v chromium >/dev/null 2>&1; then CHROME=chromium; else echo 'No Chrome/Chromium binary found on runner' >&2; exit 1; fi
python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/ielts-v111-speaking-http.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT
for _ in {1..20}; do curl -fsS "$URL" >/dev/null && break; sleep .25; done
DOM='/tmp/ielts-v111-speaking-dom.html'; LOG='/tmp/ielts-v111-speaking-chrome.log'; PROFILE='/tmp/ielts-v111-speaking-profile'; rm -rf "$PROFILE" "$DOM" "$LOG"
set +e
timeout 75s "$CHROME" --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage --disable-background-networking --disable-component-update --disable-crash-reporter --user-data-dir="$PROFILE" --window-size='1280,1000' --virtual-time-budget=26000 --dump-dom "$URL" >"$DOM" 2>"$LOG"
status=$?
set -e
if [[ "$status" -ne 0 && "$status" -ne 124 ]]; then echo "V1.11 Speaking sampler Chrome exited with status ${status}." >&2; fi
if ! grep -Fq 'V111_SPEAKING_PASS' "$DOM"; then echo 'V1.11 Speaking sampler browser flow failed.' >&2; grep -o 'V111_SPEAKING_[^<]*' "$DOM" >&2 || true; cat "$LOG" >&2 || true; exit 1; fi
echo 'V1.11 Speaking sampler browser flow passed: linked Parts 1–3 reuse, per-part/total evidence gate, feedback → retry linkage, second-sample broader evidence, transcript-only AI limits.'
