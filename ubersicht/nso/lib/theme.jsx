import { css } from "uebersicht";

// Colors sampled from the game's own window sprite.
export const C = {
  ink: "#4d23cf",
  mint: "#90f4e4",
  title: "#f0d1f1",
  paper: "#fff8ff",
  pink: "#eaa0e8",
  shadow: "#a08ce6",
};

export const A = "nso/assets/game/";
// PixelMplus10 is the game's UI font; Press Start 2P its big counters. Sizes in multiples of 5 stay crisp on Retina.
export const font = "'PixelMplus10', monospace";
export const digits = "'Press Start 2P', 'PixelMplus10', monospace";

// windowbase_active.png 9-sliced: title bar, mint frame, pink tab + dots and drop shadow all come from the sprite.
const win = css`
  position: relative;
  border-style: solid;
  border-width: 42px 11px 22px 70px;
  border-image: url(${A}windowbase_active.png) 42 11 22 70 fill / 42px 11px 22px 70px;
  font-family: ${font};
  font-size: 15px;
  color: ${C.ink};
  -webkit-font-smoothing: none;
  image-rendering: pixelated;
  img { image-rendering: pixelated; display: block; }
`;
const bar = css`
  position: absolute;
  top: -34px;
  left: -62px;
  right: 0;
  height: 26px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 0 3px;
  font-size: 20px;
  line-height: 1;
  cursor: grab;
  &:active { cursor: grabbing; }
`;
const body = css`
  margin-left: -62px;
  min-height: 20px;
  padding: 10px 12px;
`;

// Drag a window by its title bar; each widget's spot is kept in localStorage. Double-click the bar to put it back.
const KEY = (id) => `nso-pos:${id}`;
const widget = (el) => el && el.closest('[id$="-jsx"]');
const moveTo = (w, x, y) => Object.assign(w.style, { left: `${x}px`, top: `${y}px`, right: "auto", bottom: "auto" });

const restore = (el) => {
  const w = widget(el);
  if (!w || w.dataset.placed) return;
  w.dataset.placed = "1";
  try {
    const p = JSON.parse(localStorage.getItem(KEY(w.id)));
    if (p) moveTo(w, p.x, p.y);
  } catch {}
};

const drag = (e) => {
  const w = widget(e.currentTarget);
  if (!w || e.button !== 0) return;
  e.preventDefault();
  const b = w.getBoundingClientRect();
  const dx = e.clientX - b.left, dy = e.clientY - b.top;
  const move = (m) => moveTo(w, m.clientX - dx, m.clientY - dy);
  const up = () => {
    removeEventListener("mousemove", move);
    removeEventListener("mouseup", up);
    const r = w.getBoundingClientRect();
    try { localStorage.setItem(KEY(w.id), JSON.stringify({ x: r.left, y: r.top })); } catch {}
  };
  addEventListener("mousemove", move);
  addEventListener("mouseup", up);
};

const reset = (e) => {
  const w = widget(e.currentTarget);
  if (!w) return;
  try { localStorage.removeItem(KEY(w.id)); } catch {}
  Object.assign(w.style, { left: "", top: "", right: "", bottom: "" });
};

export const Win = ({ title, children, bodyClass }) => (
  <div className={win}>
    <div className={bar} ref={restore} onMouseDown={drag} onDoubleClick={reset}>
      <img src={`${A}windowbase_icon.png`} />
      <span style={{ flex: 1, paddingLeft: 3 }}>{title}</span>
      <img src={`${A}button_minimize.png`} />
      <img src={`${A}button_maximize.png`} />
      <img src={`${A}button_close.png`} />
    </div>
    <div className={`${body} ${bodyClass || ""}`}>{children}</div>
  </div>
);
