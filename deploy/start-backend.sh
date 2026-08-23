#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/ict-progress/backend"
SESSION_NAME="ict-progress"
DOCKER_GATEWAY="$(ip -4 addr show docker0 | awk '/inet / {print $2}' | cut -d/ -f1 | head -1)"

if [[ -z "$DOCKER_GATEWAY" ]]; then
  echo "docker0 IPv4 address was not found" >&2
  exit 1
fi

mkdir -p "$APP_DIR/logs" "$APP_DIR/data"
if [[ -f "$APP_DIR/gunicorn.pid" ]]; then
  OLD_PID="$(cat "$APP_DIR/gunicorn.pid")"
  if [[ "$OLD_PID" =~ ^[0-9]+$ ]] && kill -0 "$OLD_PID" >/dev/null 2>&1; then
    kill -TERM "$OLD_PID"
    for _ in {1..20}; do
      kill -0 "$OLD_PID" >/dev/null 2>&1 || break
      sleep 0.1
    done
  fi
  rm -f "$APP_DIR/gunicorn.pid"
fi
screen -S "$SESSION_NAME" -X quit >/dev/null 2>&1 || true
screen -dmS "$SESSION_NAME" bash -lc "
  cd '$APP_DIR'
  set -a
  source .env
  set +a
  exec .venv/bin/gunicorn \
    --bind '$DOCKER_GATEWAY:5010' \
    --workers 2 \
    --threads 2 \
    --timeout 30 \
    --pid '$APP_DIR/gunicorn.pid' \
    --access-logfile logs/access.log \
    --error-logfile logs/error.log \
    wsgi:app
"

sleep 1
screen -S "$SESSION_NAME" -Q select . >/dev/null
curl --fail --silent --show-error "http://$DOCKER_GATEWAY:5010/health"
echo
