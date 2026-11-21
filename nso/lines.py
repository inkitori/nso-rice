"""Ame's English dialogue from the game's Line and Tweet master tables (dumped by masters.py) into the widget.

usage: python3 lines.py   (reads game/masters/{Line,Tweet}.bin)
"""
import json, re, struct
from pathlib import Path

H = Path(__file__).resolve().parent
M = H / "game/masters"
LIB = H.parent / "ubersicht/nso/lib"
SKIP = {"LineWeekDay014", "LineWeekDay024", "LineWeekDay077"}  # explicit
VIET = re.compile("[ạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹđ]")
MOOD = {"Amechan_game": "follower", "Amechan_talk": "follower", "Amechan_ichatsuku": "love", "Amechan_kizu": "yami"}


def strings(name):
    """Every length-prefixed UTF-8 string in a raw MonoBehaviour dump, in order."""
    d, i, out = (M / f"{name}.bin").read_bytes(), 0, []
    while i < len(d) - 4:
        n = struct.unpack_from("<i", d, i)[0]
        if 0 < n < 3000 and i + 4 + n <= len(d):
            try:
                t = d[i + 4 : i + 4 + n].decode("utf8")
                if t.isprintable() or "\n" in t:
                    out.append(t); i = (i + 4 + n + 3) & ~3; continue
            except UnicodeDecodeError:
                pass
        i += 4
    return out


def clean(t):
    return re.sub(r"[ \t]*\r?\n[ \t]*", "\n", t.strip())


def write(name, comment, rows):
    (LIB / name).write_text(f"// {comment}\nexport const LINES = {json.dumps(rows, ensure_ascii=False, indent=2)};\n")
    print(name, len(rows))


# JINE: rows are id, category, speaker, then one column per language; English is the first Latin one.
S, jine, cur = strings("Line"), [], None
for k, t in enumerate(S):
    if re.fullmatch(r"Line[A-Za-z0-9_]+", t) and k + 2 < len(S):
        cur = {"id": t, "skip": {S[k + 1], S[k + 2]}, "en": None}; jine.append(cur); continue
    if cur and cur["en"] is None and t not in cur["skip"] and re.search("[a-z]", t) \
            and all(ord(c) < 0x3000 or ord(c) > 0x1F000 for c in t):
        cur["en"] = t
seen, rows = set(), []
for r in jine:
    t = clean(r["en"] or "")
    if r["id"] in SKIP or not t or t in seen or VIET.search(t): continue
    seen.add(t); rows.append(t)
write("jine-lines.jsx", "Ame's weekday JINE messages, from the game's Line master table (English).", rows)

# Bubble: Ame's private-account tweets. English sits two columns before Korean.
S = strings("Tweet")
hangul = lambda t: any(0xAC00 <= ord(c) <= 0xD7A3 for c in t)
ids = [k for k, t in enumerate(S) if re.fullmatch(r"Tweet\w*", t)] + [len(S)]
seen, rows = set(), []
for a, b in zip([0] + ids[:-1], ids):
    seg = S[a:b]
    if len(seg) < 2 or seg[1] not in MOOD: continue
    for k, t in enumerate(seg):
        if k >= 2 and hangul(t) and not hangul(seg[k - 1]):
            e = clean(seg[k - 2])
            if e != "N/A" and e not in seen:
                seen.add(e); rows.append([e, MOOD[seg[1]]])
write("bubble-lines.jsx", "Ame's posts from her private account, from the game's Tweet master table (English), with the status icon to show.", rows)
