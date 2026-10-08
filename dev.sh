#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="spotify-playlist-csv:dev"

echo "Building development Docker image..."
docker build -t "${IMAGE_NAME}" .

ENV_ARGS=()
if [[ -f ".env" ]]; then
  ENV_ARGS+=(--env-file .env)
fi

# Run with interactive volume mount and file watcher
docker run --rm -it \
  "${ENV_ARGS[@]}" \
  -e SPOTIFY_CLIENT_ID="${SPOTIFY_CLIENT_ID:-}" \
  -e SPOTIFY_CLIENT_SECRET="${SPOTIFY_CLIENT_SECRET:-}" \
  -v "$(pwd)":/app \
  --entrypoint deno \
  "${IMAGE_NAME}" task dev "$@"
