import { css } from "uebersicht";
import { CLIPS } from "./lib/clips.jsx";

// Animated wallpaper: plays the game's own clips with their real timing.
// Follows ~/.config/nso/wall.sh: animates for kangel/ame/galaxy, hides for the static wallpapers.
export const command = "cat ~/.config/nso/walls/current 2>/dev/null";
export const refreshFrequency = 10000;

const S = "nso/assets/game/stream/";
const cho = (n) => `stream_cho_${n}`;
const ame = (n) => `stream_ame_${n}`;
// Room modes: one idle loop (a random one when there are several) for IDLE_FOR, then a random bit from `extras`.
// Galaxy: the Galaxy Express scene in order.
const MODES = {
  kangel: {
    room: true,
    idle: [cho("akaruku")],
    extras: ["angel", "akaruku_fever", "kobiru_microphone", "peace", "grgr", "dokuzetsu_fever"].map(cho),
  },
  ame: {
    room: true,
    idle: ["idle", "idle_normal_f", "idle_anxiety_c", "idle_iraira_a", "headphone",
      "nail", "comic", "sleep", "egosearching", "game_a", "smile"].map(ame),
    extras: [],
  },
  galaxy: {
    room: false,
    seq: ["1", "1", "1_2", "2", "2", "2_3", "3", "3", "3_4", "4", "4", "4"].map((n) => cho(`g_express${n}`)),
  },
};

// Seconds each idle loop plays; short bits repeat until they've played for at least MIN_BIT.
const IDLE_FOR = 90;
const MIN_BIT = 4;

export const className = css`
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background: #000;
  div {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
  }
`;
const roomBox = { width: "max(100vw, calc(100vh * 696 / 454))", aspectRatio: "696 / 454" };
const sceneBox = { width: "max(100vw, calc(100vh * 518 / 389))", aspectRatio: "518 / 389" };

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const repeat = (q, k, secs) => { for (let t = 0; t < secs; t += CLIPS[k].len) q.push(k); };

const nextQueue = (m, last) => {
  if (m.seq) return [...m.seq];
  const q = [];
  repeat(q, pick(m.idle.length > 1 ? m.idle.filter((k) => k !== last) : m.idle), IDLE_FOR);
  if (m.extras.length) repeat(q, pick(m.extras), MIN_BIT);
  return q;
};

// One timer per page, swapping the sprite's src directly so React never re-renders per frame.
const play = (el, who) => {
  if (!el) return;
  const w = window.__nsoRoom || (window.__nsoRoom = {});
  if (w.el === el && w.who === who) return;
  clearTimeout(w.timer);
  Object.assign(w, { el, who });
  const m = MODES[who];
  [...(m.seq || []), ...(m.idle || []), ...(m.extras || [])].forEach((k) => CLIPS[k].frames.forEach(([, s]) => (new Image().src = `${S}${s}.png`)));
  let q = nextQueue(m), i = 0;
  const step = () => {
    const c = CLIPS[q[0]];
    const [t, sprite] = c.frames[i];
    el.src = `${S}${sprite}.png`;
    const next = c.frames[i + 1];
    let wait;
    if (next) { wait = next[0] - t; i++; }
    else { wait = c.len - t; i = 0; const last = q.shift(); if (!q.length) q = nextQueue(m, last); }
    w.timer = setTimeout(step, Math.max(16, wait * 1000));
  };
  step();
};

export const render = ({ output }) => {
  const who = (output || "").trim();
  const m = MODES[who];
  if (!m) return null;
  return (
    <div style={m.room ? roomBox : sceneBox}>
      {m.room && <img src={`${S}bg_stream.png`} />}
      <img ref={(el) => play(el, who)} />
    </div>
  );
};
