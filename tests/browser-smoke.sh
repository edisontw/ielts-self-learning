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

for asset in index.html app.js data.js boot-guard-v1.js styles.css question-type-lab-depth-v1.js question-type-lab-depth-runtime-v1.js mock-test-runtime-v1.js mock-test-audio-upgrade-v1.js mock-integration-fix-v1.js data-portability-v1.js diagnostics-v1.js content/placement/quick-placement-v1.json; do
  curl -fsS "$BASE/$asset" >/dev/null || { echo "Missing asset: $asset" >&2; exit 1; }
done

smoke_route() {
  local route="$1"
  local marker="$2"
  local slug="$3"
  local size="${4:-1280,800}"
  local dom="/tmp/ielts-dom-${slug}.html"
  local log="/tmp/ielts-chrome-${slug}.log"

  set +e
  timeout 20s "$CHROME" \
    --headless=new \
    --no-sandbox \
    --disable-gpu \
    --disable-dev-shm-usage \
    --disable-background-networking \
    --disable-component-update \
    --window-size="$size" \
    --virtual-time-budget=5000 \
    --dump-dom "$BASE/$route" >"$dom" 2>"$log"
  local status=$?
  set -e

  if [[ "$status" -ne 0 && "$status" -ne 124 ]]; then
    echo "Chrome exited with status $status on $route" >&2
  fi
  if ! grep -q 'class="app-shell"' "$dom"; then
    echo "Browser smoke failed: app-shell was not rendered for $route." >&2
    cat "$log" >&2 || true
    exit 1
  fi
  if ! grep -Fq "$marker" "$dom"; then
    echo "Browser smoke failed: expected marker '$marker' was missing for $route." >&2
    cat "$dom" >&2 || true
    cat "$log" >&2 || true
    exit 1
  fi
  if grep -Fq 'The page could not start normally.' "$dom"; then
    echo "Browser smoke failed: boot recovery screen appeared for $route." >&2
    cat "$dom" >&2 || true
    exit 1
  fi
  echo "Browser smoke passed: $route → $marker"
}

smoke_route '#/today' "Today's study" today
smoke_route '#/learn' 'Learn by skill' learn
smoke_route '#/ielts' 'IELTS practice' ielts
smoke_route '#/improve' 'Errors are learning data.' improve
smoke_route '#/progress' 'Your profile should guide the next step' progress
smoke_route '#/placement' 'Quick Placement' placement
smoke_route '#/lesson/LB01' 'Practice Is Not the Same as Testing' lesson
smoke_route '#/lesson/QR01' 'Set B — Independent' qr01-depth
smoke_route '#/lesson/QL01' 'Play practice audio' ql01-depth
smoke_route '#/ielts' 'Full Mock' ielts-mobile '390,844'

echo "Browser smoke passed across core desktop routes, V1.3 Lab depth routes and mobile IELTS navigation."
