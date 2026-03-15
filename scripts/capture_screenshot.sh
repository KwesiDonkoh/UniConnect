#!/usr/bin/env bash
set -euo pipefail
mkdir -p docs/images
timestamp=$(date +"%Y%m%d-%H%M%S")
file="docs/images/screen-${timestamp}.png"
adb exec-out screencap -p > "$file"
echo "Saved $file"
