#!/bin/bash
# Highlight this app space if it's the focused yabai space
cur=$(yabai -m query --spaces --space | jq -r .label)
if [ "space.$cur" = "$NAME" ]; then
  sketchybar --set "$NAME" background.color=0xff90f4e4
else
  sketchybar --set "$NAME" background.color=0xfffff8ff
fi
