#!/bin/bash
v=${INFO:-$(osascript -e 'output volume of (get volume settings)')}
if [ "$v" = "0" ] || [ "$v" = "missing value" ]; then icon="󰖁"; else icon="󰕾"; fi
sketchybar --set "$NAME" icon="$icon" label="${v}%"
