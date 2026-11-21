#!/bin/bash
# One real CPU reading (100 - idle from top's second sample), shared with the Übersicht Task Manager.
cpu=$(top -l 2 -n 0 -s 1 | awk '/CPU usage/ {v=100-$7} END {printf "%d", v+0.5}')
mkdir -p ~/.cache/nso && echo "$cpu" > ~/.cache/nso/cpu
sketchybar --set "$NAME" label="${cpu}/100"
