import { css } from "uebersicht";
import { Win, C, A, digits } from "./lib/theme.jsx";

export const command = `
boot=$(sysctl -n kern.boottime | awk -F'[ ,]+' '{print $4}')
cpu=$(cat ~/.cache/nso/cpu 2>/dev/null || echo 0)  # written by the SketchyBar cpu item, so both show the same reading
mem=$(vm_stat | awk -v total=$(sysctl -n hw.memsize) -v ps=$(sysctl -n hw.pagesize) '
  /Pages active/ {a=$3} /Pages wired/ {w=$4} /occupied by compressor/ {c=$5}
  END {printf "%d", (a+w+c)*ps*100/total}')
disk=$(df -k /System/Volumes/Data | awk 'NR==2 {gsub("%","",$5); print $5}')
echo "$(( $(date +%s) - boot )) $cpu $mem $disk"
`;

export const refreshFrequency = 2000;

const N = 40;
export const initialState = { up: 0, cpu: [], mem: [], disk: [] };

export const updateState = (event, prev) => {
  if (!event.output) return prev;
  const [up, cpu, mem, disk] = event.output.trim().split(" ").map(Number);
  const push = (arr, v) => [...arr, v].slice(-N);
  return { up, cpu: push(prev.cpu, cpu), mem: push(prev.mem, mem), disk: push(prev.disk, disk) };
};

export const className = css`
  top: 54px;
  left: 22px;
  width: 400px;
`;

const row = css`
  display: grid;
  grid-template-columns: 48px 1fr 130px;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
  & + & { border-top: 2px dotted ${C.title}; }
`;
const label = css`
  font-size: 15px;
  line-height: 1;
  margin-bottom: 6px;
`;
const big = css`
  font-family: ${digits};
  font-size: 16px;
  line-height: 1;
  small { font-size: 8px; opacity: 0.6; }
`;
const huge = css`
  font-family: ${digits};
  font-size: 24px;
  line-height: 1;
  span { animation: blink 1s steps(1) infinite; }
  @keyframes blink { 50% { opacity: 0; } }
`;

const Spark = ({ data }) => {
  const w = 130, h = 40;
  const pts = data.length ? data : [0];
  const step = w / (N - 1);
  const off = (N - pts.length) * step;
  const line = pts.map((v, i) => `${Math.round(off + i * step)},${Math.round(h - (v / 100) * h)}`);
  return (
    <svg width={w} height={h} shapeRendering="crispEdges" style={{ display: "block", background: C.title, boxShadow: `inset 0 0 0 2px ${C.ink}` }}>
      <polygon points={`${off},${h} ${line.join(" ")} ${w},${h}`} fill={C.mint} />
      <polyline points={line.join(" ")} fill="none" stroke={C.ink} strokeWidth="2" />
    </svg>
  );
};

const Stat = ({ icon, name, values }) => {
  const v = values[values.length - 1] ?? 0;
  return (
    <div className={row}>
      <img src={`${A}icon_status_${icon}.png`} />
      <div>
        <div className={label}>{name}</div>
        <div className={big}>{v}<small> /100</small></div>
      </div>
      <Spark data={values} />
    </div>
  );
};

export const render = ({ up, cpu, mem, disk }) => {
  const d = Math.floor(up / 86400);
  const h = String(Math.floor((up % 86400) / 3600)).padStart(2, "0");
  const m = String(Math.floor((up % 3600) / 60)).padStart(2, "0");
  return (
    <Win title="Task Manager">
      <div className={row} style={{ gridTemplateColumns: "48px 1fr" }}>
        <img src={`${A}icon_status_follower.png`} />
        <div>
          <div className={label}>Screen Time</div>
          <div className={huge}>{d > 0 && <small style={{ fontSize: 16 }}>{d}d </small>}{h}<span>:</span>{m}</div>
        </div>
      </div>
      <Stat icon="stress" name="CPU" values={cpu} />
      <Stat icon="love" name="Memory" values={mem} />
      <Stat icon="yami" name="Disk" values={disk} />
    </Win>
  );
};
