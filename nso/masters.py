# /// script
# dependencies = ["UnityPy"]
# ///
"""Dump the game's big MonoBehaviour data tables (Line, Tweet, ...) as raw bytes.

usage: uv run masters.py <game Data dir> game/masters
"""
import sys, UnityPy
from pathlib import Path
src, out = Path(sys.argv[1]), Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
for f in src.rglob("*"):
    if not f.is_file() or f.suffix not in {".bundle", ".assets", ""}: continue
    try: env = UnityPy.load(str(f))
    except Exception: continue
    for o in env.objects:
        if o.type.name != "MonoBehaviour": continue
        try:
            raw = o.get_raw_data()
            if len(raw) < 20000: continue
            mb = o.read(check_read=False)
            name = mb.m_Name or f"anon_{o.path_id}"
            (out / f"{name}.bin").write_bytes(raw); print(name, len(raw), f.name)
        except Exception as e:
            pass
