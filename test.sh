#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="spotavibe-cli:test"

echo "Building test Docker image..."
docker build -t "${IMAGE_NAME}" .

# Run test suite
docker run --rm -it \
  --entrypoint deno \
  "${IMAGE_NAME}" task test
