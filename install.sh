#!/bin/bash
# Installs the tools and links this repo's configs into place (existing ones are moved to *.bak).
set -e
R="$(cd "$(dirname "$0")" && pwd)"

brew tap asmvik/formulae; brew tap felixkratz/formulae
for f in asmvik/formulae/yabai asmvik/formulae/skhd felixkratz/formulae/sketchybar felixkratz/formulae/borders; do
  brew trust --formula "$f" 2>/dev/null || true
done
brew bundle --file="$R/Brewfile"
cp "$R"/fonts/*.ttf ~/Library/Fonts/

link() { # link <repo path> <target>
  mkdir -p "$(dirname "$2")"
  [ -L "$2" ] && rm "$2"
  [ -e "$2" ] && mv "$2" "$2.bak"
  ln -s "$R/$1" "$2"
}
link yabai ~/.config/yabai
link skhd ~/.config/skhd
link borders ~/.config/borders
link sketchybar ~/.config/sketchybar
link nso ~/.config/nso
link colors.sh ~/.config/colors.sh
link ghostty/config-nso ~/.config/ghostty/config
link ghostty/claude-themes/nso.json ~/.claude/themes/nso.json
[ -f ~/.claude/settings.json ] || echo '{}' > ~/.claude/settings.json
tmp=$(mktemp); jq '.theme = "custom:nso"' ~/.claude/settings.json > "$tmp" && mv "$tmp" ~/.claude/settings.json
link ubersicht/nso "$HOME/Library/Application Support/Übersicht/widgets/nso"

yabai --start-service || yabai --restart-service
skhd --start-service || skhd --restart-service
brew services restart sketchybar
brew services restart borders
open -a Übersicht
"$R/nso/wall.sh" ame
