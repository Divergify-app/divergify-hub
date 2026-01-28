#!/usr/bin/env bash
set -euo pipefail

METRO_PORT="${METRO_PORT:-8081}"
APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -n "${METRO_PID:-}" ]]; then
  echo "Stopping Metro pid ${METRO_PID}"
  kill "${METRO_PID}" || true
elif command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -t -i :"${METRO_PORT}" 2>/dev/null || true)"
  if [[ -n "${PIDS}" ]]; then
    echo "Stopping Metro on port ${METRO_PORT}: ${PIDS}"
    kill ${PIDS} || true
  fi
else
  echo "lsof not available and METRO_PID not set. Skipping stop step."
fi

cd "${APP_ROOT}"
npm run start
