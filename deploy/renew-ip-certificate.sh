#!/usr/bin/env bash
set -euo pipefail

LETSENCRYPT_DIR="/home/ict-progress-letsencrypt"
WEBROOT_DIR="/home/chaoxing/frontend/dist"
NGINX_CONTAINER="chaoxing-nginx"

docker run --rm \
  -v "$LETSENCRYPT_DIR:/etc/letsencrypt" \
  -v "$WEBROOT_DIR:/webroot" \
  certbot/certbot:latest renew \
  --non-interactive

docker exec "$NGINX_CONTAINER" nginx -t
docker exec "$NGINX_CONTAINER" nginx -s reload
