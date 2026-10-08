#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="spotify-playlist-csv:latest"

echo "Building Docker image: ${IMAGE_NAME}..."
docker build -t "${IMAGE_NAME}" .

# Conditionally include --env-file if .env exists
ENV_ARGS=()
if [[ -f ".env" ]]; then
  ENV_ARGS+=(--env-file .env)
fi

# Run container and mount local directory to /app/out
docker run --rm -it \
  "${ENV_ARGS[@]}" \
  -e SPOTIFY_CLIENT_ID="${SPOTIFY_CLIENT_ID:-}" \
  -e SPOTIFY_CLIENT_SECRET="${SPOTIFY_CLIENT_SECRET:-}" \
  -v "$(pwd)":/app/out \
  "${IMAGE_NAME}" "$@"
