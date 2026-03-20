#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$APP_ROOT/android"
DEFAULT_JAVA_HOME="$HOME/.local/jdk-17"
DEFAULT_ANDROID_SDK="$HOME/.local/android-sdk"

export JAVA_HOME="${JAVA_HOME:-$DEFAULT_JAVA_HOME}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$DEFAULT_ANDROID_SDK}}"
export ANDROID_HOME="${ANDROID_HOME:-$ANDROID_SDK_ROOT}"

if [ ! -x "$JAVA_HOME/bin/java" ]; then
  echo "JAVA_HOME does not point to a usable JDK: $JAVA_HOME" >&2
  exit 1
fi

if [ ! -d "$ANDROID_SDK_ROOT" ]; then
  echo "ANDROID_SDK_ROOT does not exist: $ANDROID_SDK_ROOT" >&2
  exit 1
fi

cd "$APP_ROOT"

if [ -z "${VITE_API_BASE_URL:-}" ]; then
  echo "WARNING: VITE_API_BASE_URL is not set." >&2
  echo "Optional cloud assist will be built against the app origin, which can break /api/ai calls in bundled Capacitor releases." >&2
  echo "For store-ready builds, set VITE_API_BASE_URL to your hosted HTTPS backend before running this script." >&2
elif [[ "${VITE_API_BASE_URL}" != https://* ]]; then
  echo "WARNING: VITE_API_BASE_URL does not start with https:// : ${VITE_API_BASE_URL}" >&2
  echo "Store-ready builds should use an HTTPS backend for optional cloud assist." >&2
fi

npm run build
CI=1 npx cap sync android

cd "$ANDROID_DIR"
./gradlew bundleRelease assembleRelease

TARGET_SDK="$(sed -nE 's/^[[:space:]]*targetSdkVersion = ([0-9]+)$/\1/p' "$ANDROID_DIR/variables.gradle" | head -n 1)"
AAB_PATH="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"
APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"

echo
echo "Release artifacts:"
echo "  AAB: $AAB_PATH"
echo "  APK: $APK_PATH"

if [ -n "$TARGET_SDK" ] && [ "$TARGET_SDK" -lt 35 ]; then
  echo "WARNING: targetSdkVersion=$TARGET_SDK. Google Play currently requires targetSdkVersion >= 35." >&2
fi
