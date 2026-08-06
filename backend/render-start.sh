#!/usr/bin/env sh
set -eu

PYTHON_BIN="$(command -v python3 || command -v python)"
exec "$PYTHON_BIN" -m uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"