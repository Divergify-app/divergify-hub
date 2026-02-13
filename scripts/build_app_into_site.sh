#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_SRC="$ROOT/apps/divergify-hub-app"

# Allow override for different site locations.
SITE_DEFAULT="$(cd "$ROOT/.." && pwd)/Divergify_Website"
SITE="${DIVERGIFY_SITE_PATH:-$SITE_DEFAULT}"
APP_OUT="$SITE/hub/beta"
APP_BASE="${DIVERGIFY_APP_BASE:-/hub/beta/}"
HUB_PAGE="$SITE/hub.html"

cd "$APP_SRC"

# Ensure the build uses the hub base path.
export VITE_BASE_PATH="$APP_BASE"

# Requires network the first time (npm install).
# npm install
# npm run build

rm -rf "$APP_OUT"
mkdir -p "$APP_OUT"
cp -R dist/* "$APP_OUT/"

APP_INDEX="$APP_OUT/index.html"
if [[ -f "$APP_INDEX" && -f "$HUB_PAGE" ]]; then
  APP_CSS="$(rg -o 'href=\"[^\"]+assets/[^\"]+\.css\"' "$APP_INDEX" | head -n1 | sed 's/^href=\"//;s/\"$//' || true)"
  APP_JS="$(rg -o 'src=\"[^\"]+assets/[^\"]+\.js\"' "$APP_INDEX" | head -n1 | sed 's/^src=\"//;s/\"$//' || true)"
  APP_MANIFEST="$(rg -o 'href=\"[^\"]+manifest\.webmanifest\"' "$APP_INDEX" | head -n1 | sed 's/^href=\"//;s/\"$//' || true)"
  APP_SW="$(rg -o 'src=\"[^\"]+registerSW\.js\"' "$APP_INDEX" | head -n1 | sed 's/^src=\"//;s/\"$//' || true)"

  if [[ -n "$APP_CSS" && -n "$APP_JS" && -n "$APP_MANIFEST" && -n "$APP_SW" ]]; then
    python3 - "$HUB_PAGE" "$APP_CSS" "$APP_JS" "$APP_MANIFEST" "$APP_SW" <<'PY'
import sys
from pathlib import Path

hub_path, css, js, manifest, sw = sys.argv[1:6]
text = Path(hub_path).read_text(encoding="utf-8")
start = "<!-- app-inline-start -->"
end = "<!-- app-inline-end -->"
if start in text and end in text:
    before, rest = text.split(start, 1)
    _, after = rest.split(end, 1)
    block = (
        f"{start}\n"
        f"  <link rel=\"stylesheet\" crossorigin href=\"{css}\">\n"
        f"  <script type=\"module\" crossorigin src=\"{js}\"></script>\n"
        f"  <link rel=\"manifest\" href=\"{manifest}\">\n"
        f"  <script id=\"vite-plugin-pwa:register-sw\" src=\"{sw}\"></script>\n"
        f"  {end}"
    )
    Path(hub_path).write_text(before + block + after, encoding="utf-8")
PY
  fi
fi

echo "Copied app dist -> $APP_OUT"
