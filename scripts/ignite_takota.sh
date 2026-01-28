#!/usr/bin/env bash

# TAKOTA SETUP WIZARD — Divergify Merch Ops
# This script wires environment keys and storefront tokens.
# It updates .env for the server and the static dopamine-depot page.

set -euo pipefail

echo "🧠 TAKOTA: Initializing setup sequence..."
echo "------------------------------------------------"

# Load centralized API keys if available.
if [[ -f "$HOME/api_keys/keys.env" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$HOME/api_keys/keys.env"
  set +a
fi

# 1) Gather tokens (interactive)
echo "I need the keys to the ignition."
echo "If you have 'shopify_api.odt' and/or 'open ai key.odt', I will try to read them."
echo

# Try to auto-extract OpenAI key from ODT if present
OPENAI_KEY=""
_try_read_openai() {
  local f="$1"
  if [[ -f "$f" ]]; then
    # Try unzip content.xml first, then strings fallback
    local raw
    raw=$(unzip -p "$f" content.xml 2>/dev/null || true)
    if [[ -z "$raw" ]]; then raw=$(strings "$f" 2>/dev/null || true); fi
    local cand
    cand=$(printf "%s" "$raw" | grep -Eo "sk-[A-Za-z0-9_\-]{20,}" | head -n1 || true)
    if [[ -n "$cand" ]]; then OPENAI_KEY="$cand"; fi
  fi
}

_try_read_openai "open ai key.odt"
_try_read_openai "open_ai_key.odt"
_try_read_openai "Desktop/open ai key.odt"
_try_read_openai "Desktop/open_ai_key.odt"

if [[ -z "$OPENAI_KEY" && -n "${OPENAI_API_KEY:-}" ]]; then
  OPENAI_KEY="$OPENAI_API_KEY"
fi

# Try to auto-extract Shopify values from ODT
ADMIN_TOKEN=""
PUBLIC_TOKEN=""
SHOP_URL=""
_try_read_shopify() {
  local f="$1"
  if [[ -f "$f" ]]; then
    local raw
    raw=$(unzip -p "$f" content.xml 2>/dev/null || true)
    if [[ -z "$raw" ]]; then raw=$(strings "$f" 2>/dev/null || true); fi
    # Domain
    local dom
    dom=$(printf "%s" "$raw" | grep -Eo "[a-z0-9-]+\.myshopify\.com" | head -n1 || true)
    if [[ -n "$dom" ]]; then SHOP_URL="$dom"; fi
    # Admin token
    local adm
    adm=$(printf "%s" "$raw" | grep -Eo "shpat_[A-Za-z0-9]+" | head -n1 || true)
    if [[ -n "$adm" ]]; then ADMIN_TOKEN="$adm"; fi
    # Storefront token heuristic: long alnum not starting with shpat_/sk-
    if [[ -z "$PUBLIC_TOKEN" ]]; then
      local cand
      cand=$(printf "%s" "$raw" | grep -Eo "[A-Za-z0-9]{24,}" | grep -v "^shpat_" | grep -v "^sk-" | head -n1 || true)
      if [[ -n "$cand" ]]; then PUBLIC_TOKEN="$cand"; fi
    fi
  fi
}

_try_read_shopify "shopify_api.odt"
_try_read_shopify "Desktop/shopify_api.odt"

if [[ -n "$SHOP_URL" ]]; then echo "Detected SHOPIFY_SHOP: $SHOP_URL"; fi
if [[ -n "$ADMIN_TOKEN" ]]; then echo "Detected SHOPIFY_ADMIN_TOKEN: ${ADMIN_TOKEN:0:6}..."; fi
if [[ -n "$PUBLIC_TOKEN" ]]; then echo "Detected STOREFRONT_ACCESS_TOKEN: ${PUBLIC_TOKEN:0:6}..."; fi

read -r -p "SHOPIFY_ADMIN_TOKEN (starts with shpat_) [${ADMIN_TOKEN:-enter manually}]: " _IN
if [[ -n "$_IN" ]]; then ADMIN_TOKEN="$_IN"; fi
read -r -p "STOREFRONT_ACCESS_TOKEN (public) [${PUBLIC_TOKEN:-enter manually}]: " _IN
if [[ -n "$_IN" ]]; then PUBLIC_TOKEN="$_IN"; fi
read -r -p "SHOPIFY_SHOP (e.g., dopamine-depot.myshopify.com) [${SHOP_URL:-enter manually}]: " _IN
if [[ -n "$_IN" ]]; then SHOP_URL="$_IN"; fi
if [[ -z "$OPENAI_KEY" ]]; then
  read -r -p "Optional: OPENAI_API_KEY (press Enter to skip): " OPENAI_KEY
else
  echo "Detected OPENAI_API_KEY in ODT. Using: ${OPENAI_KEY:0:7}..."
fi

echo
echo "⚙️  Configuring Server Logic (.env) ..."
cat > .env <<EOF
# .env file for Divergify Merch Agent
SHOPIFY_SHOP=${SHOP_URL}
SHOPIFY_ADMIN_TOKEN=${ADMIN_TOKEN}
ACCESS_KEY=takota-secure-key-123
PORT=3000
# MOVED TO ~/api_keys/keys.env
# OPENAI_API_KEY=${OPENAI_KEY}
# Used if no image provided from UI
DEFAULT_IMAGE_URL=https://placehold.co/800x800?text=Divergify+Merch
EOF
echo "✅ .env file created at $(pwd)/.env"

# 2) Wire the Front End: find dopamine-depot.html and replace placeholders
echo "⚙️  Wiring Dopamine Depot Storefront..."

FRONT_HTML=""
if [[ -f "Desktop/website/dopamine-depot.html" ]]; then
  FRONT_HTML="Desktop/website/dopamine-depot.html"
elif [[ -f "dopamine-depot.html" ]]; then
  FRONT_HTML="dopamine-depot.html"
fi

if [[ -n "$FRONT_HTML" ]]; then
  cp "$FRONT_HTML" "${FRONT_HTML}.backup"
  # Replace any assignment to SHOP_DOMAIN/ACCESS_TOKEN regardless of let/const
  sed -i "s/SHOP_DOMAIN = .*/SHOP_DOMAIN = '${SHOP_URL}';/" "$FRONT_HTML"
  sed -i "s/ACCESS_TOKEN = .*/ACCESS_TOKEN = '${PUBLIC_TOKEN}';/" "$FRONT_HTML"
  echo "✅ ${FRONT_HTML} updated with live keys (backup: ${FRONT_HTML}.backup)"
else
  echo "⚠️  Could not find dopamine-depot.html. Skipping frontend wiring."
fi

# 3) Install & Launch server
echo
echo "🚀 Installing dependencies and starting engines..."
echo "------------------------------------------------"
if [[ -f "package.json" ]]; then
  npm install
  echo "✅ Dependencies installed."
  echo "🧠 Takota Agent is launching..."
  npm start
else
  echo "⚠️  No package.json found in $(pwd). Make sure you are in your project folder."
fi
