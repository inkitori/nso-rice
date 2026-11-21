#!/bin/bash
b=$(pmset -g batt); pct=$(echo "$b" | grep -Eo '[0-9]+%' | head -1 | tr -d %)
[ -z "$pct" ] && exit 0
if echo "$b" | grep -q "AC Power"; then icon="󰂄"; color=0xff2fb8a4
elif [ "$pct" -le 20 ]; then icon="󰁺"; color=0xffff4d6d
else icon="󰁹"; color=0xff4d23cf; fi
sketchybar --set "$NAME" icon="$icon" icon.color=$color label="${pct}%"
