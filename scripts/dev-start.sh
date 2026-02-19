#!/bin/sh
set -eu

DEPS_HASH_FILE="node_modules/.deps-hash"
MODE="${1:-run-dev}"

compute_deps_hash() {
  if [ -f bun.lock ]; then
    cat package.json bun.lock | sha256sum | awk '{print $1}'
  elif [ -f bun.lockb ]; then
    cat package.json bun.lockb | sha256sum | awk '{print $1}'
  else
    cat package.json | sha256sum | awk '{print $1}'
  fi
}

install_dependencies() {
  if [ -f bun.lock ] || [ -f bun.lockb ]; then
    bun install --frozen-lockfile
  else
    bun install
  fi
}

mkdir -p node_modules

CURRENT_HASH="$(compute_deps_hash)"
STORED_HASH=""
if [ -f "$DEPS_HASH_FILE" ]; then
  STORED_HASH="$(cat "$DEPS_HASH_FILE")"
fi

if [ ! -f "$DEPS_HASH_FILE" ] || [ "$CURRENT_HASH" != "$STORED_HASH" ]; then
  echo "Installing dependencies..."
  install_dependencies
  printf '%s' "$CURRENT_HASH" > "$DEPS_HASH_FILE"
else
  echo "Dependencies are up to date. Skipping install."
fi

if [ "$MODE" = "--install-only" ]; then
  exit 0
fi

if [ "$MODE" = "run-dev" ]; then
  exec bun run dev --host 0.0.0.0 --port 3000
fi

echo "Unknown mode: $MODE"
echo "Usage: sh scripts/dev-start.sh [--install-only|run-dev]"
exit 1
