#!/bin/bash
song=""
if pgrep -x Spotify >/dev/null; then
  song=$(perl -e 'alarm 4; exec @ARGV' osascript -e 'tell application "Spotify" to if player state is playing then return (name of current track) & " - " & (artist of current track)' 2>/dev/null)
fi
[ -n "$song" ] && sketchybar --set "$NAME" drawing=on label="$song" || sketchybar --set "$NAME" drawing=off
