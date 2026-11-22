"""Copy the chosen game clips' sprites into the Übersicht widget and write lib/clips.jsx.

usage: python3 anims.py   (reads game/clips.json from clips.py and sprites from extract.py)
"""
import json, shutil
from pathlib import Path

G = Path(__file__).resolve().parent / "game"
W = Path(__file__).resolve().parent.parent / "ubersicht/nso"
OUT = W / "assets/game/stream"
CLIPS = [
    "stream_cho_akaruku", "stream_cho_angel", "stream_cho_akaruku_fever", "stream_cho_kobiru_microphone",
    "stream_cho_peace", "stream_cho_grgr", "stream_cho_dokuzetsu_fever",
    "stream_ame_idle", "stream_ame_idle_normal_f", "stream_ame_idle_anxiety_c",
    "stream_ame_idle_iraira_a", "stream_ame_headphone", "stream_ame_nail", "stream_ame_comic", "stream_ame_sleep",
    "stream_ame_egosearching", "stream_ame_game_a", "stream_ame_smile",
    "stream_cho_g_express1", "stream_cho_g_express1_2", "stream_cho_g_express2", "stream_cho_g_express2_3",
    "stream_cho_g_express3", "stream_cho_g_express3_4", "stream_cho_g_express4",
]
EXTRA = ["bg_stream"]

data = json.loads((G / "clips.json").read_text())
shutil.rmtree(OUT, ignore_errors=True)
OUT.mkdir(parents=True)
clips, sprites = {}, set(EXTRA)
for k in CLIPS:
    c = data[k]
    frames = [[t, s] for t, _, s in c["frames"]]
    clips[k] = {"len": c["len"], "frames": frames}
    sprites |= {s for _, s in frames}
for s in sprites:
    shutil.copy(G / "sprite" / f"{s}.png", OUT / f"{s}.png")
(W / "lib/clips.jsx").write_text(
    "// Sprite keyframes [seconds, sprite] decoded from the game's AnimationClips; written by ~/.config/nso/anims.py.\n"
    f"export const CLIPS = {json.dumps(clips)};\n"
)
print(len(clips), "clips,", len(sprites), "sprites")
