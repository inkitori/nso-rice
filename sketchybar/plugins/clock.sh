#!/bin/bash
h=$(date +%H); h=${h#0}
if [ "$h" -ge 6 ] && [ "$h" -lt 16 ]; then t=noon; elif [ "$h" -ge 16 ] && [ "$h" -lt 19 ]; then t=evening; else t=night; fi
sketchybar --set "$NAME" background.image="$HOME/.config/sketchybar/img/icon_watch_$t.png" label="$(date '+%a %m/%d  %H:%M:%S')"
