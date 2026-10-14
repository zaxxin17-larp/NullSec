#!/data/data/com.termux/files/usr/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PREFIX="${PREFIX:-/data/data/com.termux/files/usr}"

export LD_PRELOAD="${LD_PRELOAD:+$LD_PRELOAD:}$PREFIX/lib/libtermux-exec-direct-ld-preload.so"
export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--require $PROJECT_ROOT/scripts/metro-nowatch-node-modules.cjs"
export EXPO_NO_TELEMETRY=1

cd "$PROJECT_ROOT"
exec node node_modules/expo/bin/cli start --lan --port 8081 "$@"
