#!/usr/bin/env bash
set -euo pipefail

cd /opt/ict-progress/backend
set -a
source .env
set +a
exec .venv/bin/python backup.py
