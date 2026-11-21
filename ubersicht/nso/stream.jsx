import { css } from "uebersicht";
import { C, A, font } from "./lib/theme.jsx";
import { LINES } from "./lib/bubble-lines.jsx";

// Spotify track, only asked if Spotify is already running.
export const command = `
if pgrep -x Spotify >/dev/null; then
  perl -e 'alarm 4; exec @ARGV' osascript -e 'tell application "Spotify" to if player state is playing then return (name of current track) & " - " & (artist of current track)' 2>/dev/null
fi
`;
export const refreshFrequency = 15000;

export const initialState = { output: "" };
export const updateState = (event, prev) => (event.output !== undefined ? { output: event.output } : prev);

// -> [line, status icon]: the playing song, else one of Ame's posts (a new one every 2 minutes).
const say = (out) => {
  const song = (out || "").trim();
  if (song) return [`♪ ${song}`, "love"];
  return LINES[Math.floor(Date.now() / 120000) % LINES.length];
};

export const className = css`
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  gap: 4px;
  font-family: ${font};
  color: ${C.ink};
  -webkit-font-smoothing: none;
`;

const bubble = css`
  position: relative;
  background: ${C.paper};
  border: 2px solid ${C.ink};
  box-shadow: 4px 4px 0 ${C.shadow};
  border-radius: 12px;
  padding: 16px 16px 10px;
  width: max-content;
  max-width: 440px;
  white-space: pre-line;
  font-size: 15px;
  line-height: 1.4;
  margin-bottom: 40px;
  &::after {
    content: "";
    position: absolute;
    right: 18px;
    bottom: -12px;
    border: 6px solid transparent;
    border-top-color: ${C.ink};
    border-right-color: ${C.ink};
  }
`;
const tag = css`
  position: absolute;
  top: -11px;
  left: 12px;
  background: ${C.pink};
  border: 2px solid ${C.ink};
  font-size: 10px;
  line-height: 1;
  padding: 3px 8px;
`;
const bob = css`
  animation: bob 1.2s steps(2) infinite;
  @keyframes bob { 50% { transform: translateY(-4px); } }
`;

export const render = ({ output }) => {
  const [line, mood] = say(output);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
      <div className={bubble}>
        <span className={tag}>♥ AME</span>
        {line}
      </div>
      <img className={bob} src={`${A}icon_status_${mood}.png`} width={96} height={80} style={{ imageRendering: "pixelated" }} />
    </div>
  );
};
