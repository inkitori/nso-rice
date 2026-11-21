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
`;
const body = css`
  margin-left: -62px;
  min-height: 20px;
  padding: 10px 12px;
`;

export const Win = ({ title, children, bodyClass }) => (
  <div className={win}>
    <div className={bar}>
      <img src={`${A}windowbase_icon.png`} />
      <span style={{ flex: 1, paddingLeft: 3 }}>{title}</span>
      <img src={`${A}button_minimize.png`} />
      <img src={`${A}button_maximize.png`} />
      <img src={`${A}button_close.png`} />
    </div>
    <div className={`${body} ${bodyClass || ""}`}>{children}</div>
  </div>
);
