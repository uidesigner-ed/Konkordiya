import { content } from "@/content/uk";

/**
 * «Жива» схема для блоку супроводу: 4 стани, по одному на кожен пункт.
 * Розмітка з сервера — це фінальні стани (без JS видно стан 1); анімації будує Support.tsx.
 */

const c = content.support.chart;

/* ── Стан 2: карта ризиків 5×5 ── */
const RX = 96;
const RY = 22;
const CW = 76;
const CH = 58;
const cellCenter = (col: number, row: number) => [RX + col * CW + CW / 2, RY + row * CH + CH / 2];
// ризики: звідки (висока зона) → куди (низька зона)
const risks = [
  { from: [4, 0], to: [0, 4] },
  { from: [3, 0], to: [1, 4] },
  { from: [4, 1], to: [0, 3] },
  { from: [3, 1], to: [2, 4] },
  { from: [2, 0], to: [1, 3] },
];

/* ── Стан 4: рентабельність ── */
const xs = [56, 116, 176, 236, 296, 356, 416, 470];
const withA = [252, 244, 230, 212, 188, 160, 126, 88];
const without = [252, 246, 256, 248, 254, 247, 252, 249];
const toPath = (ys: number[]) => xs.map((x, i) => `${i ? "L" : "M"}${x} ${ys[i]}`).join("");

/* ── Стан 3: дерево рішень ── */
const nodesY = [42, 98, 154, 210];
const leaves = [100, 210, 320, 430];
const HIT = 2;

export function SupportChart() {
  return (
    <div className="lc" data-active="0" aria-hidden>
      <div className="lc__head">
        <span className="lc__num t-mono">
          04.<span data-lc-num>1</span>
        </span>
        <span className="lc__titles">
          {c.states.map((st, i) => (
            <span key={st.title} className="lc__title" data-title={i}>
              {st.title}
            </span>
          ))}
        </span>
        <span className="lc__steps">
          {c.states.map((st) => (
            <i key={st.title} />
          ))}
        </span>
      </div>

      <div className="lc__body">
        <svg className="lc__svg" viewBox="0 0 520 380" fill="none">
          <defs>
            <pattern id="lc-hatch-red" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="7" height="7" fill="#F6E1D8" />
              <line x1="0" y1="0" x2="0" y2="7" stroke="#E2552C" strokeWidth="2.4" />
            </pattern>
            <pattern id="lc-hatch-ink" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
              <rect width="6" height="6" fill="#E3DDD1" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="#141210" strokeOpacity=".5" strokeWidth="1.2" />
            </pattern>
          </defs>

          {/* 1 — До / Після */}
          <g className="lc-group" data-group="0">
            <path className="lc-grid" d="M40 110H480M40 200H480" />
            <path className="lc-axis" d="M40 320H480" />
            <rect className="lc-seg lc-profit" x="104" y="210" width="112" height="110" />
            <rect className="lc-seg lc-tax" x="104" y="90" width="112" height="120" />
            <rect className="lc-seg lc-fine" x="104" y="40" width="112" height="50" />
            <rect className="lc-seg lc-profit" x="304" y="130" width="112" height="190" />
            <rect className="lc-seg lc-tax" x="304" y="40" width="112" height="90" />
            <path className="lc-link" d="M216 210L304 130M216 40H304" />
            <path className="lc-delta" d="M440 210V136M433 143l7-7 7 7" />
            <path className="lc-delta lc-delta--soft" d="M434 210h12" />
            <text className="lc-label lc-label--strong" x="160" y="352" textAnchor="middle">
              {c.states[0].labels[0]}
            </text>
            <text className="lc-label lc-label--strong" x="360" y="352" textAnchor="middle">
              {c.states[0].labels[1]}
            </text>
          </g>

          {/* 2 — карта ризиків */}
          <g className="lc-group" data-group="1">
            {Array.from({ length: 25 }, (_, k) => {
              const col = k % 5;
              const row = Math.floor(k / 5);
              const level = (col + (4 - row)) / 8;
              return (
                <rect
                  key={k}
                  className="lc-cell"
                  x={RX + col * CW}
                  y={RY + row * CH}
                  width={CW}
                  height={CH}
                  fill="#E2552C"
                  fillOpacity={0.04 + level * 0.34}
                  data-level={level}
                />
              );
            })}
            {risks.map((r, i) => {
              const [fx, fy] = cellCenter(r.from[0], r.from[1]);
              const [tx, ty] = cellCenter(r.to[0], r.to[1]);
              // дуга, перпендикулярна напрямку руху — траєкторії лягають паралельно
              const mx = (fx + tx) / 2 + 26;
              const my = (fy + ty) / 2 + 26;
              return <path key={`t${i}`} className="lc-trail" d={`M${fx} ${fy}Q${mx} ${my} ${tx} ${ty}`} />;
            })}
            {risks.map((r, i) => {
              const [fx, fy] = cellCenter(r.from[0], r.from[1]);
              return <circle key={`g${i}`} className="lc-ghost" cx={fx} cy={fy} r="8" />;
            })}
            {risks.map((r, i) => {
              const [fx, fy] = cellCenter(r.from[0], r.from[1]);
              const [tx, ty] = cellCenter(r.to[0], r.to[1]);
              return (
                <circle
                  key={`d${i}`}
                  className="lc-dot is-safe"
                  cx={tx}
                  cy={ty}
                  r="9"
                  data-fx={fx}
                  data-fy={fy}
                  data-tx={tx}
                  data-ty={ty}
                />
              );
            })}
            <path className="lc-axis" d="M84 22V312H476" />
            <path className="lc-arrow" d="M84 22l-5 8M84 22l5 8M476 312l-8-5M476 312l-8 5" />
            <text className="lc-label" x="286" y="346" textAnchor="middle">
              {c.states[1].labels[0]}
            </text>
            <text className="lc-label" x="0" y="0" textAnchor="middle" transform="translate(62 167) rotate(-90)">
              {c.states[1].labels[1]}
            </text>
          </g>

          {/* 3 — дерево рішень */}
          <g className="lc-group" data-group="2">
            <path className="lc-spine" d={`M70 ${nodesY[0]}V252`} />
            {nodesY.map((y, i) => (
              <g key={y} className="lc-crit">
                <circle className="lc-node is-on" cx="70" cy={y} r="11" />
                <path className="lc-node-tick" d={`M64.5 ${y}l4 4 7-8`} />
                <text className="lc-label lc-label--strong" x="98" y={y + 5}>
                  {c.states[2].labels[i]}
                </text>
              </g>
            ))}
            <path className="lc-branch" d={`M70 252V276H${leaves[leaves.length - 1]}`} />
            {leaves.map((x) => (
              <path key={x} className="lc-branch" d={`M${x} 276V306`} />
            ))}
            <path
              className="lc-branch lc-branch--hit"
              d={`M70 252V266Q70 276 80 276H${leaves[HIT] - 10}Q${leaves[HIT]} 276 ${leaves[HIT]} 286V306`}
            />
            {leaves.map((x, i) => (
              <g key={`l${x}`} className={`lc-leaf${i === HIT ? " lc-leaf--hit" : ""}`}>
                <rect x={x - 50} y="306" width="100" height="40" rx="20" />
                <text x={x} y="331" textAnchor="middle">
                  {c.states[2].labels[4 + i]}
                </text>
              </g>
            ))}
            <path className="lc-hit-tick" d={`M${leaves[HIT] + 38} 294l7 7 14-17`} />
          </g>

          {/* 4 — рентабельність */}
          <g className="lc-group" data-group="3">
            <path className="lc-grid" d="M40 90H480M40 170H480M40 250H480" />
            <path className="lc-axis" d="M40 320H480" />
            <path className="lc-marker" d="M116 40V320" />
            <path className="lc-area" d={`${toPath(withA)}L470 320L56 320Z`} />
            <path className="lc-line lc-line--base" d={toPath(without)} />
            <path className="lc-line" d={toPath(withA)} />
            {xs.slice(0, -1).map((x, i) => (
              <circle key={x} className="lc-pt" cx={x} cy={withA[i]} r="4.5" />
            ))}
            <circle className="lc-pt lc-pt--end" cx="470" cy="88" r="7.5" />
            <g className="lc-chip">
              <rect x="330" y="34" width="126" height="30" rx="15" />
              <path d="M348 55V42M343 47l5-5 5 5" />
              <text x="404" y="54" textAnchor="middle">
                зростання
              </text>
            </g>
            {c.states[3].labels.map((t, i) => (
              <text key={t} className="lc-label" x={86 + i * 120} y="350" textAnchor="middle">
                {t}
              </text>
            ))}
          </g>
        </svg>
      </div>

      <div className="lc__foot">
        {c.states.map((st, i) => (
          <span key={st.title} className="lc__legend" data-legend={i}>
            {st.legend.map((l, k) => (
              <span key={l} className="lc__key">
                <span className={`lc-sw lc-sw--${i}-${k}`} />
                {l}
              </span>
            ))}
          </span>
        ))}
        <span className="lc__note">{c.note}</span>
      </div>
    </div>
  );
}
