# /// script
# dependencies = ["UnityPy"]
# ///
"""Dump every sprite AnimationClip in the game: name, length, loop, [(time, curve, sprite)].

usage: uv run clips.py <game Data dir> game/clips.json
"""
import sys, struct, json, UnityPy
from pathlib import Path
src, out = Path(sys.argv[1]), Path(sys.argv[2])
res = {}
for f in src.rglob("*"):
    if not f.is_file() or f.suffix not in {".bundle", ".assets", ""}: continue
    try: env = UnityPy.load(str(f))
    except Exception: continue
    for o in env.objects:
        if o.type.name != "AnimationClip": continue
        try:
            c = o.read()
            if c.m_Name in res: continue
            mc = c.m_MuscleClip.m_Clip.data
            raw = struct.pack(f"<{len(mc.m_StreamedClip.data)}I", *mc.m_StreamedClip.data)
            keys, i = [], 0
            while i + 8 <= len(raw):
                t, n = struct.unpack_from("<fI", raw, i); i += 8
                for _ in range(n):
                    idx, a, b, cc, d = struct.unpack_from("<i4f", raw, i); i += 20
                    keys.append((max(0.0, round(t, 4)), idx, int(d)))
            names = [p.read().m_Name for p in c.m_ClipBindingConstant.pptrCurveMapping]
            if not names: continue
            res[c.m_Name] = {"len": round(c.m_MuscleClip.m_StopTime, 4), "loop": bool(c.m_MuscleClip.m_LoopTime),
                             "frames": [(t, k, names[v]) for t, k, v in keys if 0 <= v < len(names)], "paths": [str(b.path) for b in c.m_ClipBindingConstant.genericBindings]}
        except Exception:
            pass
out.write_text(json.dumps(res))
print(len(res))
