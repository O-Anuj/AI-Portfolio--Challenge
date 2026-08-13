#!/usr/bin/env sh
set -eu

cd backend
PYTHON_BIN="$(command -v python3 || command -v python || true)"
if [ -z "$PYTHON_BIN" ]; then
  echo "Python 3 interpreter not found. Render start requires python3 or python on PATH." >&2
  exit 127
fi
exec "$PYTHON_BIN" -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"