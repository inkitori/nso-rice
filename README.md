# nso-rice

Needy Streamer Overload macOS rice: yabai + skhd + borders, SketchyBar taskbar, Übersicht widgets, game-art wallpapers.

```sh
./install.sh
```

Then: hide the macOS menu bar (Control Center → Automatically hide and show the menu bar → Always), and grant yabai/skhd Accessibility.

- Wallpaper: `~/.config/nso/wall.sh ame|kangel|galaxy|street|windose`
- Re-extract from the game (needs it installed via Steam), in `nso/`:
  `uv run extract.py <Data> game`, `uv run clips.py <Data> game/clips.json`, `uv run masters.py <Data> game/masters`, then `python3 anims.py && python3 lines.py`
