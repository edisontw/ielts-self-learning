#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://edisontw.github.io/ielts-self-learning}"
BASE="${BASE_URL%/}"
CACHE_BUST="${GITHUB_SHA:-$(date +%s)}"
URL="${BASE}/tests/browser-diagnostic-v19.html?sha=${CACHE_BUST}"

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

echo "Waiting for V1.9 diagnostic assets at ${BASE} ..."
deployed=0
for attempt in {1..90}; do
  if curl -fsS --max-time 10 "${BASE}/diagnostic-center-v19.js?sha=${CACHE_BUST}-${attempt}" >/dev/null 2>&1 \
    && curl -fsS --max-time 10 "${BASE}/tests/browser-diagnostic-v19.html?sha=${CACHE_BUST}-${attempt}" >/dev/null 2>&1; then
    deployed=1
    break
  fi
  sleep 2
done
if [[ "$deployed" -ne 1 ]]; then
  echo 'V1.9 diagnostic assets did not appear before the production E2E deadline.' >&2
  exit 1
fi

DOM='/tmp/ielts-production-v19-diagnostic-dom.html'
LOG='/tmp/ielts-production-v19-diagnostic-chrome.log'
PROFILE='/tmp/ielts-production-v19-diagnostic-profile'
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
  --window-size='1280,900' \
  --virtual-time-budget=22000 \
  --dump-dom "$URL" >"$DOM" 2>"$LOG"
status=$?
set -e
if [[ "$status" -ne 0 && "$status" -ne 124 ]]; then
  echo "V1.9 deployed Diagnostic Chrome exited with status ${status}." >&2
fi
if ! grep -Fq 'V19_DIAGNOSTIC_PASS' "$DOM"; then
  echo 'V1.9 deployed Diagnostic Evidence flow failed.' >&2
  grep -o 'V19_DIAGNOSTIC_[^<]*' "$DOM" >&2 || true
  cat "$LOG" >&2 || true
  exit 1
fi

echo 'V1.9 production Diagnostic Evidence passed on deployed GitHub Pages: timed R/L, W/S thresholds, 4/4 return, and broader-evidence upgrades.'
