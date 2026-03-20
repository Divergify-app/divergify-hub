#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HUB_REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ACTIVE_ROOT="$(cd "$HUB_REPO_ROOT/.." && pwd)"
DIVERGIFY_ROOT="$(cd "$ACTIVE_ROOT/.." && pwd)"
WEBSITE_REPO_ROOT="$ACTIVE_ROOT/Divergify_Website"

if ! command -v rclone >/dev/null 2>&1; then
  echo "rclone is required for off-device backups." >&2
  exit 1
fi

BACKUP_REMOTE="${BACKUP_REMOTE:-gdrive-crypt:Divergify/backups}"
LOCAL_BACKUP_DIR="${LOCAL_BACKUP_DIR:-$DIVERGIFY_ROOT/backups/offsite}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE_NAME="divergify-active-${TIMESTAMP}.tar.gz"
ARCHIVE_PATH="$LOCAL_BACKUP_DIR/$ARCHIVE_NAME"
TMP_DIR="$(mktemp -d)"
MANIFEST_PATH="$TMP_DIR/backup-manifest.txt"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

mkdir -p "$LOCAL_BACKUP_DIR"

{
  echo "Backup created: $(date -Iseconds)"
  echo "Host: $(hostname)"
  echo
  echo "[divergify-hub]"
  git -C "$HUB_REPO_ROOT" rev-parse --abbrev-ref HEAD
  git -C "$HUB_REPO_ROOT" rev-parse HEAD
  git -C "$HUB_REPO_ROOT" status --short || true
  echo
  echo "[Divergify_Website]"
  git -C "$WEBSITE_REPO_ROOT" rev-parse --abbrev-ref HEAD
  git -C "$WEBSITE_REPO_ROOT" rev-parse HEAD
  git -C "$WEBSITE_REPO_ROOT" status --short || true
} >"$MANIFEST_PATH"

tar \
  --exclude='active/divergify-hub/.git' \
  --exclude='active/divergify-hub/node_modules' \
  --exclude='active/divergify-hub/.playwright-cli' \
  --exclude='active/divergify-hub/apps/divergify-hub-app/node_modules' \
  --exclude='active/divergify-hub/apps/divergify-hub-app/dist' \
  --exclude='active/divergify-hub/apps/divergify-hub-app/android/.gradle' \
  --exclude='active/divergify-hub/apps/divergify-hub-app/android/app/build' \
  --exclude='active/divergify-hub/apps/divergify-hub-app/.netlify' \
  --exclude='active/Divergify_Website/.git' \
  --exclude='active/Divergify_Website/node_modules' \
  -czf "$ARCHIVE_PATH" \
  -C "$DIVERGIFY_ROOT" \
  active/divergify-hub \
  active/Divergify_Website

rclone copyto "$ARCHIVE_PATH" "$BACKUP_REMOTE/$ARCHIVE_NAME"
rclone copyto "$MANIFEST_PATH" "$BACKUP_REMOTE/latest-manifest.txt"

find "$LOCAL_BACKUP_DIR" -maxdepth 1 -type f -name 'divergify-active-*.tar.gz' -printf '%T@ %p\n' \
  | sort -nr \
  | awk 'NR > 5 { print $2 }' \
  | xargs -r rm -f

echo "Local archive: $ARCHIVE_PATH"
echo "Remote archive: $BACKUP_REMOTE/$ARCHIVE_NAME"
