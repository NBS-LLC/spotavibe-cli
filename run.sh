#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="spotify-playlist-csv:latest"

echo "Building Docker image: ${IMAGE_NAME}..."
docker build -t "${IMAGE_NAME}" .

# Run container and mount local directory to /app/out
docker run --rm -it \
  -v "$(pwd)":/app/out \
  "${IMAGE_NAME}" "$@"
