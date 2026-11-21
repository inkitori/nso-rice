import { css } from "uebersicht";
import { Win, A, digits } from "./lib/theme.jsx";

export const refreshFrequency = 1000;
export const command = "true";

export const className = css`
  bottom: 26px;
  left: 22px;
  width: 400px;
`;

const wrap = css`
  display: flex;
  align-items: center;
  gap: 14px;
  img { width: 60px; height: 60px; }
`;
const date = css`
  font-size: 20px;
  line-height: 1.2;
`;
const time = css`
  font-family: ${digits};
  font-size: 16px;
  margin-top: 6px;
`;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const render = () => {
  const d = new Date();
  const hr = d.getHours();
  const night = hr < 6 || hr >= 19;
  const t = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return (
    <Win title="Calendar">
      <div className={wrap}>
        <img src={`${A}icon_watch_${night ? "night" : "noon"}.png`} />
        <div>
          <div className={date}>{MONTHS[d.getMonth()]} {d.getDate()}, {d.getFullYear()}</div>
          <div className={time}>{t}</div>
        </div>
      </div>
    </Win>
  );
};
