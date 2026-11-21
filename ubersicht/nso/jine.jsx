import { css } from "uebersicht";
import { Win, C, A } from "./lib/theme.jsx";
import { LINES } from "./lib/jine-lines.jsx";

// Ticks once a second; every ~50 ticks Ame sends a new message.
export const command = "true";
export const refreshFrequency = 1000;
const pick = () => LINES[Math.floor(Math.random() * LINES.length)];

const STICKERS = ["ok", "omg", "sad", "ignoring", "sorry", "melting", "love", "this", "selfie", "notcute"];

export const initialState = {
  tick: 0,
  msgs: [{ me: false, text: pick() }],
};

export const updateState = (event, prev) => {
  if (event.type === "SEND") {
    return { ...prev, msgs: [...prev.msgs, { me: true, sticker: event.sticker }].slice(-30) };
  }
  const tick = prev.tick + 1;
  if (tick % 50 === 0) {
    const text = pick();
    return { tick, msgs: [...prev.msgs, { me: false, text }].slice(-30) };
  }
  return { ...prev, tick };
};

export const className = css`
  top: 150px;
  right: 26px;
  width: 330px;
`;

const body = css`
  padding: 0 !important;
  background: url(${A}JINEBG.png) center / cover;
`;
// Fixed height and scrollable. column-reverse keeps it pinned to the newest message at the bottom.
const chat = css`
  height: 440px;
  display: flex;
  flex-direction: column;
  padding: 8px 10px 10px;
`;
const list = css`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  padding-right: 4px;
  > * { flex: none; }
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: ${C.ink}; }
  &::-webkit-scrollbar-track { background: transparent; }
`;
const datePill = css`
  align-self: center;
  width: 118px;
  height: 16px;
  flex: none;
  margin-bottom: 6px;
  background: url(${A}LineDateBG.png);
  font-size: 10px;
  line-height: 16px;
  text-align: center;
`;
const them = css`
  display: flex;
  gap: 6px;
  align-items: flex-start;
  img { width: 50px; height: 50px; flex: none; }
`;
const bubble = css`
  white-space: pre-line;
  position: relative;
  margin-top: 8px;
  background: #fff;
  border: 2px solid ${C.ink};
  border-radius: 10px;
  padding: 6px 9px;
  line-height: 1.35;
  max-width: 200px;
`;
const mine = css`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 4px;
  font-size: 10px;
`;
const tray = css`
  display: grid;
  grid-template-columns: repeat(5, 56px);
  justify-content: space-between;
  row-gap: 4px;
  padding: 6px 8px;
  background: rgba(255, 248, 255, 0.6);
  border-top: 2px solid ${C.ink};
  img { width: 56px; height: 56px; object-fit: none; cursor: pointer; }
  img:hover { transform: translateY(-2px); }
  img:active { transform: translateY(1px); }
`;

export const render = ({ msgs }, dispatch) => {
  const d = new Date();
  return (
    <Win title="JINE" bodyClass={body}>
      <div className={chat}>
        <div className={datePill}>{d.getMonth() + 1}/{d.getDate()}</div>
        <div className={list}>
          {msgs.map((m, i) => [m, i]).reverse().map(([m, i]) =>
            m.me ? (
              <div key={i} className={mine}>
                <span>Read</span>
                <img src={`${A}stickers/${m.sticker}.png`} />
              </div>
            ) : (
              <div key={i} className={them}>
                <img src={`${A}icon_jine_ame.png`} />
                <div className={bubble}>{m.text}</div>
              </div>
            )
          )}
        </div>
      </div>
      <div className={tray}>
        {STICKERS.map((s) => (
          <img key={s} src={`${A}stickers/${s}.png`} onClick={() => dispatch({ type: "SEND", sticker: s })} />
        ))}
      </div>
    </Win>
  );
};
