#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://edisontw.github.io/ielts-self-learning}"
BASE="${BASE_URL%/}"
SENTINEL='V1.11-SPEAKING-PRODUCTION-E2E-GATE-20260830-1'
CACHE_BUST="${GITHUB_SHA:-$(date +%s)}"
URL="${BASE}/tests/browser-speaking-sampler-v111.html?sha=${CACHE_BUST}"

if command -v google-chrome >/dev/null 2>&1; then CHROME=google-chrome; elif command -v google-chrome-stable >/dev/null 2>&1; then CHROME=google-chrome-stable; elif command -v chromium >/dev/null 2>&1; then CHROME=chromium; else echo 'No Chrome/Chromium binary found on runner' >&2; exit 1; fi

echo "Waiting for V1.11 Speaking deployment sentinel at ${BASE} ..."
deployed=0
for attempt in {1..90}; do
  if curl -fsS --max-time 10 "${BASE}/V1.11-SPEAKING-PRODUCTION-E2E-SENTINEL.txt?sha=${CACHE_BUST}-${attempt}" 2>/dev/null | grep -Fq "$SENTINEL"; then deployed=1; break; fi
  sleep 2
done
if [[ "$deployed" -ne 1 ]]; then echo 'V1.11 Speaking deployment sentinel did not appear before the E2E deadline.' >&2; exit 1; fi

for asset in index.html speaking-sampler-v111.js speaking-practice-bank-v1.js diagnostic-center-v19.js tests/browser-speaking-sampler-v111.html; do
  curl -fsS --max-time 15 "${BASE}/${asset}?sha=${CACHE_BUST}" >/dev/null || { echo "Missing deployed V1.11 asset: ${asset}" >&2; exit 1; }
done

DOM='/tmp/ielts-production-v111-speaking-dom.html'; LOG='/tmp/ielts-production-v111-speaking-chrome.log'; PROFILE='/tmp/ielts-production-v111-speaking-profile'; rm -rf "$PROFILE" "$DOM" "$LOG"
set +e
timeout 80s "$CHROME" --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage --disable-background-networking --disable-component-update --disable-crash-reporter --user-data-dir="$PROFILE" --window-size='1280,1000' --virtual-time-budget=28000 --dump-dom "$URL" >"$DOM" 2>"$LOG"
status=$?
set -e
if [[ "$status" -ne 0 && "$status" -ne 124 ]]; then echo "V1.11 deployed Speaking Chrome exited with status ${status}." >&2; fi
if ! grep -Fq 'V111_SPEAKING_PASS' "$DOM"; then echo 'V1.11 deployed Speaking sampler browser flow failed.' >&2; grep -o 'V111_SPEAKING_[^<]*' "$DOM" >&2 || true; cat "$LOG" >&2 || true; exit 1; fi

echo 'V1.11 production Speaking sampler passed on deployed GitHub Pages: linked Parts 1–3, 300-word evidence gate, feedback → retry linkage, second-set broader evidence and transcript-only AI limits.'
