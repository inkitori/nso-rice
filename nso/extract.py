# /// script
# dependencies = ["UnityPy", "pillow"]
# ///
"""Dump every Sprite/Texture2D from the installed NSO game into a folder of PNGs.

usage: uv run extract.py <game .app or data dir> <out dir> [name-filter-regex]
"""
import re
import sys
from pathlib import Path

import UnityPy

src, out = Path(sys.argv[1]), Path(sys.argv[2])
pat = re.compile(sys.argv[3], re.I) if len(sys.argv) > 3 else None
out.mkdir(parents=True, exist_ok=True)

files = [p for p in src.rglob("*") if p.is_file() and (p.suffix in {".assets", ".bundle", ".resS", ""} or "level" in p.name)]
seen = set()
for f in files:
    try:
        env = UnityPy.load(str(f))
    except Exception:
        continue
    for obj in env.objects:
        if obj.type.name == "Font":
            try:
                fd = obj.read()
                data = bytes(fd.m_FontData) if fd.m_FontData else b""
                if data:
                    (out / "font").mkdir(exist_ok=True)
                    ext = ".otf" if data[:4] == b"OTTO" else ".ttf"
                    (out / "font" / f"{fd.m_Name}{ext}").write_bytes(data)
                    seen.add("Font:" + fd.m_Name)
            except Exception:
                pass
            continue
        if obj.type.name not in ("Sprite", "Texture2D"):
            continue
        try:
            data = obj.read()
            name = getattr(data, "m_Name", None) or getattr(data, "name", "")
            if not name or (pat and not pat.search(name)):
                continue
            key = f"{obj.type.name}:{name}"
            if key in seen:
                continue
            seen.add(key)
            img = data.image
            if img.width < 2:
                continue
            sub = out / obj.type.name.lower()
            sub.mkdir(exist_ok=True)
            img.save(sub / f"{re.sub(r'[^A-Za-z0-9_.-]', '_', name)}.png")
        except Exception:
            pass
print(len(seen), "images ->", out)
