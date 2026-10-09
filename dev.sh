#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="spotify-playlist-csv:dev"

echo "Building development Docker image..."
docker build -t "${IMAGE_NAME}" .

# Run with interactive volume mount and file watcher
docker run --rm -it \
  -v "$(pwd)":/app \
  --entrypoint deno \
  "${IMAGE_NAME}" task dev "$@"
