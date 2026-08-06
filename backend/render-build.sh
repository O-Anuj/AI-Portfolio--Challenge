#!/usr/bin/env sh
set -eu

PYTHON_BIN="$(command -v python3 || command -v python)"
exec "$PYTHON_BIN" -m pip install -r requirements.txt