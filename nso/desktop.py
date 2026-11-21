# /// script
# dependencies = ["pillow", "numpy"]
# ///
"""NSO wallpapers from the game's own art.

usage: desktop.py <kangel|ame|galaxy|street|windose> out.png W H
  kangel / ame  KAngel or Ame sitting in the stream room
  galaxy        KAngel on the Galaxy Express at night
  street        game desktop: street side bars, mint wave tile, Angel logo
  windose       the Windose20 boot screen
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image

G = Path(__file__).resolve().parent / "art"
mode, dst, W, H = sys.argv[1], Path(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])


def cover(im, resample):
    k = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), resample)
    x, y = (im.width - W) // 2, (im.height - H) // 2
    return im.crop((x, y, x + W, y + H))


def stream(sprite):
    room = Image.open(G / "bg_stream.png").convert("RGBA")
    who = Image.open(G / sprite).convert("RGBA").resize(room.size, Image.NEAREST)
    room.alpha_composite(who)
    return cover(room, Image.NEAREST)


def street():
    S = 2 if W > 2000 else 1
    bg = np.array(Image.open(G / "FHDbg.png").convert("RGB"))
    area = bg[40:1000, 260:1660]

    def period(axis):
        for p in range(20, 200):
            a = area[:-p] if axis == 0 else area[:, :-p]
            b = area[p:] if axis == 0 else area[:, p:]
            if np.abs(a.astype(int) - b).mean() < 1:
                return p

    px, py = period(1), period(0)
    tile = Image.fromarray(area[:py, :px]).resize((px * S, py * S), Image.NEAREST)
    side = Image.open(G / "bg_side_bar.png").convert("RGB")
    side = side.resize((side.width * S, side.height * S), Image.NEAREST)
    out = Image.new("RGB", (W, H))
    for y in range(0, H, tile.height):
        for x in range(0, W, tile.width):
            out.paste(tile, (x, y))
    top = (side.height - H) // 2
    l = side.crop((0, top, side.width, top + H))
    out.paste(l, (0, 0))
    out.paste(l.transpose(Image.FLIP_LEFT_RIGHT), (W - side.width, 0))
    logo = Image.open(G / "bios_logo.png").convert("RGBA")
    logo = logo.resize((logo.width * S * 3, logo.height * S * 3), Image.NEAREST)
    out.paste(logo, ((W - logo.width) // 2, (H - logo.height) // 2 - H // 12), logo)
    return out


out = {
    "kangel": lambda: stream("stream_cho_idle_000.png"),
    "ame": lambda: stream("stream_ame_idle_000.png"),
    "galaxy": lambda: cover(Image.open(G / "stream_cho_g_express_000.png").convert("RGB"), Image.NEAREST),
    "street": street,
    "windose": lambda: cover(Image.open(G / "bg_boot_en.png"), Image.LANCZOS),
}[mode]()
out.convert("RGB").save(dst)
print(dst)
