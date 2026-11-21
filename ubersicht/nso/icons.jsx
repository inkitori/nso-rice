import { css, run } from "uebersicht";
import { C, A, font } from "./lib/theme.jsx";

// The game's desktop icons, each opening something real.
export const command = "true";
export const refreshFrequency = 60000;

const sleepIcon = () => {
  const h = new Date().getHours();
  return h >= 6 && h < 16 ? "neru_noon" : h >= 16 && h < 19 ? "neru_evening" : "neru_night";
};

const ICONS = [
  { img: "jine2", name: "JINE", cmd: "open -a Vesktop" },
  { img: "internet", name: "Internet", cmd: "open -a Zen" },
  { img: "youtube", name: "MeTube", cmd: "open https://youtube.com" },
  { img: "twitter", name: "Tweeter", cmd: "open https://x.com" },
  { img: "game", name: "Games", cmd: "open -a Steam" },
  { img: "text", name: "Notes", cmd: "open -a Obsidian" },
  { img: "egosearch", name: "Ego Search", cmd: "\"$HOME/Applications/Windose Start.app/Contents/MacOS/WindoseStart\" --toggle" },
  { img: "darkness", name: "Darkness", cmd: "open -a Ghostty" },
  { img: "okusuri", name: "Meds", cmd: "open -a Spotify" },
  { img: "asobu", name: "Hang Out", cmd: "open -a Messages" },
  { img: "folder_open1", name: "Stuff", cmd: "open ~" },
  { img: null, name: "Sleep", cmd: "pmset displaysleepnow" },
];

export const className = css`
  top: 60px;
  left: 440px;
  font-family: ${font};
  font-size: 15px;
  color: ${C.ink};
  -webkit-font-smoothing: none;
`;

const grid = css`
  display: grid;
  grid-template-columns: repeat(2, 84px);
  gap: 10px 4px;
`;

const icon = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  cursor: pointer;
  img { width: 64px; height: 64px; object-fit: none; image-rendering: pixelated; }
  span {
    padding: 0 3px;
    text-shadow: 1px 0 ${C.paper}, -1px 0 ${C.paper}, 0 1px ${C.paper}, 0 -1px ${C.paper};
  }
  &:hover span { background: ${C.ink}; color: ${C.paper}; text-shadow: none; }
  &:active img { transform: translateY(1px); }
`;

// Drag an icon anywhere; a press that barely moves is a click. Offsets from its grid spot are kept in localStorage.
const KEY = "nso-icons";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const save = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch {} };
const offset = (name) => { const p = load()[name]; return p && `translate(${p.x}px, ${p.y}px)`; };

const press = (e, i) => {
  if (e.button !== 0) return;
  e.preventDefault();
  const el = e.currentTarget, from = load()[i.name] || { x: 0, y: 0 };
  const sx = e.clientX, sy = e.clientY;
  let moved = false;
  const at = (m) => ({ x: from.x + m.clientX - sx, y: from.y + m.clientY - sy });
  const move = (m) => {
    if (Math.abs(m.clientX - sx) + Math.abs(m.clientY - sy) > 4) moved = true;
    const p = at(m);
    Object.assign(el.style, { transform: `translate(${p.x}px, ${p.y}px)`, zIndex: 1 });
  };
  const up = (m) => {
    removeEventListener("mousemove", move);
    removeEventListener("mouseup", up);
    el.style.zIndex = "";
    if (moved) return save({ ...load(), [i.name]: at(m) });
    el.style.transform = offset(i.name) || "";
    run(i.cmd);
  };
  addEventListener("mousemove", move);
  addEventListener("mouseup", up);
};

export const render = () => (
  <div className={grid}>
    {ICONS.map((i) => (
      <div key={i.name} className={icon} style={{ transform: offset(i.name), position: "relative" }} onMouseDown={(e) => press(e, i)}>
        <img src={`${A}desktop/icon_desktop_${i.img || sleepIcon()}.png`} />
        <span>{i.name}</span>
      </div>
    ))}
  </div>
);
