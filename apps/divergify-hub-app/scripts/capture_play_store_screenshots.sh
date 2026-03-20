#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_URL="${1:-http://127.0.0.1:4173}"
PACKET_DIR="$APP_ROOT/research/review-packet"
SEED_PATH="$PACKET_DIR/app_state.seed.json"
RAW_DIR="$APP_ROOT/output/playwright/play-store/raw"
PHONE_DIR="$APP_ROOT/output/playwright/play-store/phone"

export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"

if [[ ! -x "$PWCLI" ]]; then
  echo "Playwright wrapper not found at $PWCLI" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required." >&2
  exit 1
fi

if [[ ! -f "$SEED_PATH" ]]; then
  echo "Seed file not found at $SEED_PATH" >&2
  echo "Run scripts/capture_review_screenshots.sh first, or restore the review packet seed." >&2
  exit 1
fi

if ! curl -sf "$APP_URL" >/dev/null 2>&1; then
  echo "Preview server is not reachable at $APP_URL" >&2
  exit 1
fi

mkdir -p "$RAW_DIR" "$PHONE_DIR"

SEED_JSON="$(cat "$SEED_PATH")"
SESSION_AT="$(date -Iseconds)"

capture_route() {
  local route="$1"
  local out="$2"
  "$PWCLI" goto "$APP_URL$route" >/dev/null
  "$PWCLI" screenshot --filename "$out" >/dev/null
}

"$PWCLI" close-all >/dev/null 2>&1 || true
"$PWCLI" open "$APP_URL" >/dev/null
"$PWCLI" resize 540 960 >/dev/null

"$PWCLI" localstorage-clear >/dev/null
"$PWCLI" sessionstorage-clear >/dev/null
capture_route "/onboarding" "$RAW_DIR/01-onboarding.png"

"$PWCLI" localstorage-set "divergify:app:v1" "$SEED_JSON" >/dev/null
"$PWCLI" localstorage-set "divergify.session.state" "neutral" >/dev/null
"$PWCLI" localstorage-set "divergify.session.stateSetAt" "$SESSION_AT" >/dev/null
"$PWCLI" localstorage-set "divergify.session.overwhelm" "45" >/dev/null
"$PWCLI" localstorage-delete "divergify.session.stateSkippedAt" >/dev/null || true

capture_route "/" "$RAW_DIR/02-today.png"
capture_route "/tasks" "$RAW_DIR/03-planner.png"
capture_route "/brain-dump" "$RAW_DIR/04-brain-dump.png"
capture_route "/sidekicks" "$RAW_DIR/05-sidekicks.png"
capture_route "/settings" "$RAW_DIR/06-settings.png"

python3 - "$RAW_DIR" "$PHONE_DIR" <<'PY'
import sys
from pathlib import Path
from PIL import Image

raw_dir = Path(sys.argv[1])
phone_dir = Path(sys.argv[2])

for path in sorted(raw_dir.glob("*.png")):
    with Image.open(path) as image:
        rgb = image.convert("RGB")
        resized = rgb.resize((1080, 1920), Image.Resampling.LANCZOS)
        resized.save(phone_dir / path.name, format="PNG", optimize=True)
PY

echo "Saved raw viewport screenshots to $RAW_DIR"
echo "Saved Play-sized phone screenshots to $PHONE_DIR"
