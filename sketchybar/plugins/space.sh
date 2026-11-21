#!/bin/bash
# Highlights the focused yabai space's tab: one yabai query, one sketchybar call for all six.
# A key or click passes LABEL so the tab moves before the space does; otherwise ask yabai.
cur=${LABEL:-$(yabai -m query --spaces --space | jq -r .label)}
args=()
for l in zen claude cmux slack discord spotify; do
  [ "$l" = "$cur" ] && c=0xff90f4e4 || c=0xfffff8ff
  args+=(--set "space.$l" background.color=$c)
done
sketchybar "${args[@]}"
