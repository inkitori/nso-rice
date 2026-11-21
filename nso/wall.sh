#!/bin/bash
# usage: wall.sh <kangel|ame|galaxy|street|windose>  — builds both screen sizes and sets them
set -e; cd "$(dirname "$0")"; m=${1:-kangel}
uv run -q desktop.py "$m" "walls/$m-retina.png" 3024 1964 >/dev/null
uv run -q desktop.py "$m" "walls/$m-1080.png" 1920 1080 >/dev/null
echo "$m" > walls/current
osascript -e 'tell application "System Events"' \
  -e "set picture of desktop 1 to \"$PWD/walls/$m-retina.png\"" \
  -e "set picture of desktop 2 to \"$PWD/walls/$m-1080.png\"" -e 'end tell'
