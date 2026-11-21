#!/bin/bash
# Labels the biggest display's first 6 spaces zen..spotify, in order, creating spaces if needed.
# Run by yabairc and again whenever a display comes or goes, since that loses or scrambles labels.
LABELS="zen claude cmux slack discord spotify"
BIG=$(yabai -m query --displays | jq 'max_by(.frame.w * .frame.h).index')
for i in $(yabai -m query --spaces | jq -r '.[] | select(.label != "") | .index'); do
  yabai -m space "$i" --label "" 2>/dev/null
done
while [ "$(yabai -m query --spaces --display "$BIG" | jq 'length')" -lt 6 ]; do
  yabai -m display --focus "$BIG" 2>/dev/null
  yabai -m space --create "$BIG"
done
set -- $(yabai -m query --spaces --display "$BIG" | jq -r '.[].index')
for label in $LABELS; do
  yabai -m space "$1" --label "$label"
  shift
done
sketchybar --trigger nso_space_change 2>/dev/null
