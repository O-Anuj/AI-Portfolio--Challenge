#!/usr/bin/env sh
set -eu

PYTHON_BIN="$(command -v python3 || command -v python || true)"
if [ -z "$PYTHON_BIN" ]; then
  echo "Python 3 interpreter not found. Render build requires python3 or python on PATH." >&2
  exit 127
fi
exec "$PYTHON_BIN" -m pip install -r requirements.txt