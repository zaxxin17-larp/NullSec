#!/usr/bin/env bash
#
# Publish a JS-only OTA update to the `preview` channel, no native rebuild.
#
# Usage:
#   bash scripts/update-preview.sh "describe your change"
#   npm run update:preview -- "describe your change"
#
# Only JS/asset changes ship this way. Anything native (new native module,
# permission, icon, splash, app.json native fields, version bump) still needs
# a full `eas build`.
set -euo pipefail

# Termux: node CLIs (expo/eas) have a /usr/bin/env shebang that needs this.
: "${LD_PRELOAD:=/data/data/com.termux/files/usr/lib/libtermux-exec.so:/data/data/com.termux/files/home/.opencode/lib/libseccomp-shim.so}"
export LD_PRELOAD

# Fingerprinting hangs under Termux; we don't use it for OTA.
export EAS_SKIP_AUTO_FINGERPRINT=1

BRANCH="${BRANCH:-preview}"
MESSAGE="${1:-Update}"

cd "$(dirname "$0")/.."

echo ">> Exporting Android bundle (no bytecode)..."
npx expo export --platform android --no-bytecode --output-dir dist

echo ">> Publishing to branch '$BRANCH' (channel '$BRANCH')..."
eas update \
  --branch "$BRANCH" \
  --environment "$BRANCH" \
  --skip-bundler \
  --input-dir dist \
  --message "$MESSAGE" \
  --non-interactive

echo ">> Done. Relaunch the installed '$BRANCH' build twice (or tap 'Check for updates' on Home)."
