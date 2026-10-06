import type { CoverId } from "@/content/news";

/**
 * Обкладинки статей — векторні «аркуші книги обліку» замість стокових фото:
 * розлінування, подвійне червоне поле, номер статті та мотив за темою.
 * Полотно 800×600; мотив тримається в центральній смузі, тож обкладинка
 * обрізається без втрат і до 3:2, і до 16:9 (preserveAspectRatio="slice").
 */

const TONES = {
  paper: { bg: "#ECE7DE", rule: "rgba(20,18,16,.08)", fg: "#141210", soft: "rgba(20,18,16,.26)", acc: "#1F4D3A", sheet: "#F5F2EC" },
  sand: { bg: "#E3DDD1", rule: "rgba(20,18,16,.08)", fg: "#141210", soft: "rgba(20,18,16,.26)", acc: "#1F4D3A", sheet: "#F5F2EC" },
  emerald: { bg: "#1F4D3A", rule: "rgba(245,242,236,.09)", fg: "#F5F2EC", soft: "rgba(245,242,236,.34)", acc: "#F5F2EC", sheet: "#2A6650" },
  deep: { bg: "#13301F", rule: "rgba(245,242,236,.07)", fg: "#F5F2EC", soft: "rgba(245,242,236,.3)", acc: "#F5F2EC", sheet: "#1F4D3A" },
} as const;

type Tone = (typeof TONES)[keyof typeof TONES];

const COVER_TONE: Record<CoverId, keyof typeof TONES> = {
  fork: "paper",
  shield: "emerald",
  nodes: "sand",
  steps: "deep",
  lens: "paper",
  rebuild: "emerald",
  donut: "sand",
  stack: "deep",
  calendar: "paper",
  scale: "emerald",
};

const RED = "#E2552C";
const INK = "#141210";
const EMERALD = "#1F4D3A";

type MotifProps = { c: Tone; hatch: string; uid: string };

/* ── Мотиви ── */

function Fork({ c }: MotifProps) {
  const ys = [150, 250, 350, 450];
  const labels = ["1 група", "2 група", "3 група", "Загальна"];
  const HIT = 2;
  return (
    <>
      <circle cx="190" cy="300" r="12" fill={c.fg} />
      <path d="M202 300H320M320 150V450" stroke={c.fg} strokeWidth="2.5" />
      {ys.map((y) => (
        <path key={y} d={`M320 ${y}H440`} stroke={c.soft} strokeWidth="2.5" />
      ))}
      <path
        className="ncv__accent-line"
        d="M202 300H300Q320 300 320 320V330Q320 350 340 350H440"
        stroke={c.acc}
        strokeWidth="6"
        strokeLinecap="round"
        pathLength={1}
      />
      {ys.map((y, i) => (
        <g key={`p${y}`}>
          <rect
            x="440"
            y={y - 26}
            width="200"
            height="52"
            rx="26"
            fill={i === HIT ? c.acc : "none"}
            stroke={i === HIT ? c.acc : c.fg}
            strokeWidth="2"
          />
          <text className="ncv__disp" x="470" y={y + 8} fontSize="21" fill={i === HIT ? c.bg : c.fg}>
            {labels[i]}
          </text>
        </g>
      ))}
      <g className="ncv__pop">
        <circle cx="676" cy="350" r="24" fill={RED} />
        <path d="M665 350l8 8 15-17" stroke="#F5F2EC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </>
  );
}

function Calendar({ c }: MotifProps) {
  const X = 210;
  const Y = 150;
  const S = 58;
  const G = 10;
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  const START = 2;
  const cells = Array.from({ length: 35 }, (_, k) => {
    const day = k - START + 1;
    return { k, day: day >= 1 && day <= 30 ? day : 0, x: X + (k % 7) * (S + G), y: Y + Math.floor(k / 7) * (S + G) };
  });
  return (
    <>
      {days.map((d, i) => (
        <text key={d} className="ncv__disp" x={X + i * (S + G) + 8} y={Y - 16} fontSize="13" fill={c.soft}>
          {d}
        </text>
      ))}
      {cells.map(({ k, day, x, y }) => {
        if (!day) return <rect key={k} x={x} y={y} width={S} height={S} stroke={c.rule} strokeWidth="1.5" />;
        const first = day === 1;
        return (
          <g key={k}>
            <rect x={x} y={y} width={S} height={S} fill={first ? c.acc : "none"} stroke={first ? c.acc : c.soft} strokeWidth="1.5" />
            <text className="ncv__mono" x={x + 8} y={y + 20} fontSize="14" fill={first ? c.bg : c.fg} opacity={first ? 1 : 0.7}>
              {day}
            </text>
            {day >= 2 && day <= 6 && (
              <path d={`M${x + 20} ${y + 38}l7 7 13-15`} stroke={c.acc} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </g>
        );
      })}
      {/* 20-те — день платежів */}
      <g className="ncv__pop">
        <circle cx={X + 5 * (S + G) + S / 2} cy={Y + 3 * (S + G) + S / 2} r="25" stroke={RED} strokeWidth="3" fill="none" />
        <circle cx={X + 5 * (S + G) + S / 2 + 18} cy={Y + 3 * (S + G) + 12} r="6" fill={RED} />
      </g>
    </>
  );
}

function Stack({ c, hatch }: MotifProps) {
  return (
    <>
      <rect x="280" y="110" width="300" height="380" fill={c.sheet} stroke={c.soft} strokeWidth="1.5" transform="rotate(-9 430 300)" />
      <rect x="280" y="110" width="300" height="380" fill={`url(#${hatch})`} stroke={c.soft} strokeWidth="1.5" transform="rotate(5 430 300)" />
      <g className="ncv__sheet" transform="rotate(-2 430 300)">
        <rect x="280" y="110" width="300" height="380" fill="#F5F2EC" />
        <rect x="308" y="140" width="118" height="14" fill={INK} />
        <rect x="308" y="166" width="72" height="7" fill={INK} opacity=".25" />
        {[206, 236, 266, 296, 326].map((y, i) => (
          <g key={y}>
            <path d={`M308 ${y + 14}H552`} stroke={INK} strokeOpacity=".14" />
            <rect x="308" y={y} width={[120, 96, 140, 84, 110][i]} height="7" fill={INK} opacity=".3" />
            <rect x={552 - [44, 56, 38, 50, 46][i]} y={y} width={[44, 56, 38, 50, 46][i]} height="7" fill={INK} opacity=".55" />
          </g>
        ))}
        <path d="M486 370H552M486 377H552" stroke={RED} strokeWidth="2.5" />
        <path d="M310 446c14-18 22-20 26-6s10 10 20-8 16-6 22 4" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <g transform="rotate(-14 504 438)">
          <g className="ncv__pop">
            <circle cx="504" cy="438" r="40" stroke={EMERALD} strokeWidth="3" fill="none" />
            <circle cx="504" cy="438" r="31" stroke={EMERALD} strokeWidth="1.5" fill="none" />
            <path d="M490 438l10 10 18-20" stroke={EMERALD} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </g>
      </g>
    </>
  );
}

const lensRows = [140, 180, 220, 260, 300, 340, 380, 420, 460];
const LensRows = ({ fill, hit }: { fill: string; hit?: boolean }) => (
  <>
    {lensRows.map((y, i) => (
      <g key={y}>
        <rect x="170" y={y - 5} width={[120, 90, 140, 104, 126, 80, 116, 98, 132][i]} height="10" fill={fill} />
        <rect x="350" y={y - 5} width="56" height="10" fill={fill} />
        <rect x={650 - [80, 96, 64, 88, 72, 90, 70, 84, 60][i]} y={y - 5} width={[80, 96, 64, 88, 72, 90, 70, 84, 60][i]} height="10" fill={hit && y === 300 ? RED : fill} />
      </g>
    ))}
  </>
);

function Lens({ c, uid }: MotifProps) {
  const id = `ncv-clip-${uid}`;
  return (
    <>
      <LensRows fill={c.soft} />
      <defs>
        <clipPath id={id}>
          <circle cx="420" cy="290" r="121" />
        </clipPath>
      </defs>
      <circle cx="420" cy="290" r="124" fill={c.bg} />
      <g clipPath={`url(#${id})`}>
        <g transform="translate(420 290) scale(1.55) translate(-420 -290)">
          <rect x="140" y="292" width="560" height="16" fill={RED} opacity=".14" />
          <LensRows fill={c.fg} hit />
        </g>
      </g>
      <circle cx="420" cy="290" r="124" stroke={c.fg} strokeWidth="4" fill="none" />
      <circle cx="420" cy="290" r="112" stroke={c.soft} strokeWidth="1.5" fill="none" />
      <path d="M508 378L606 476" stroke={c.fg} strokeWidth="22" strokeLinecap="round" />
      <path d="M512 382L530 400" stroke={c.bg} strokeWidth="6" strokeLinecap="round" opacity=".5" />
    </>
  );
}

function Rebuild({ c, hatch }: MotifProps) {
  const H = [150, 210, 180, 240, 200, 270, 300];
  return (
    <>
      <path d="M170 470H690" stroke={c.fg} strokeWidth="2.5" />
      {H.map((h, i) => {
        const x = 200 + i * 70;
        const y = 470 - h;
        if (i < 3) return <rect key={i} x={x} y={y} width="44" height={h} fill={c.fg} opacity=".92" />;
        if (i < 5)
          return <rect key={i} x={x} y={y} width="44" height={h} fill="none" stroke={c.soft} strokeWidth="2" strokeDasharray="7 7" />;
        return <rect key={i} x={x} y={y} width="44" height={h} fill={`url(#${hatch})`} stroke={c.fg} strokeWidth="2" />;
      })}
      <path
        d={`M222 ${470 - 150}L292 ${470 - 210}L362 ${470 - 180}L432 ${470 - 240}L502 ${470 - 200}L572 ${470 - 270}L642 ${470 - 300}`}
        stroke={c.soft}
        strokeWidth="1.5"
        strokeDasharray="3 6"
        fill="none"
      />
      <g className="ncv__spin" style={{ transformOrigin: "300px 190px" }}>
        <path d="M345 190a45 45 0 1 1-13.2-31.8" stroke={RED} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M334 140l-1 20-20-2" stroke={RED} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </>
  );
}

function Scale({ c }: MotifProps) {
  const person = (x: number, y: number, r: number, fill: string) => (
    <g>
      <circle cx={x} cy={y - r * 0.55} r={r * 0.55} fill={fill} />
      <path d={`M${x - r} ${y + r * 0.9}a${r} ${r * 0.95} 0 0 1 ${2 * r} 0Z`} fill={fill} />
    </g>
  );
  return (
    <>
      <path d="M400 192V470M330 470H470" stroke={c.fg} strokeWidth="3" />
      <g className="ncv__tilt" style={{ transformOrigin: "400px 192px" }}>
        <path d="M230 170L570 215" stroke={c.fg} strokeWidth="4" strokeLinecap="round" />
        <path d="M230 170L188 268M230 170L272 268" stroke={c.soft} strokeWidth="1.5" />
        <path d="M570 215L528 313M570 215L612 313" stroke={c.soft} strokeWidth="1.5" />
        <path d="M176 268Q230 312 284 268Z" fill={c.fg} />
        <path d="M516 313Q570 357 624 313Z" fill={c.fg} />
        {person(230, 238, 17, c.soft)}
        {person(542, 278, 13, c.fg)}
        {person(570, 272, 13, c.fg)}
        {person(598, 278, 13, c.fg)}
        {person(570, 246, 11, c.fg)}
      </g>
      <circle className="ncv__pop" cx="400" cy="192" r="11" fill={RED} />
    </>
  );
}

function Shield({ c }: MotifProps) {
  return (
    <>
      <rect x="200" y="130" width="270" height="340" fill={c.sheet} stroke={c.soft} strokeWidth="1.5" />
      <rect x="228" y="160" width="110" height="13" fill={c.fg} opacity=".8" />
      {[200, 232, 264, 296, 328, 360, 392, 424].map((y, i) => (
        <rect key={y} x="228" y={y} width={[190, 150, 176, 120, 168, 140, 186, 110][i]} height="7" fill={c.fg} opacity=".28" />
      ))}
      <path d="M540 172L642 208V300C642 374 598 420 540 446C482 420 438 374 438 300V208Z" fill="#F5F2EC" />
      <path d="M540 196L622 225V300C622 360 588 398 540 420C492 398 458 360 458 300V225Z" stroke={EMERALD} strokeOpacity=".3" strokeWidth="1.5" fill="none" />
      <path className="ncv__pop" d="M505 304l24 24 45-52" stroke={EMERALD} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <g className="ncv__scan">
        <path d="M180 300H690" stroke={RED} strokeWidth="2.5" strokeDasharray="10 8" />
        <circle cx="180" cy="300" r="6" fill={RED} />
        <circle cx="690" cy="300" r="6" fill={RED} />
      </g>
    </>
  );
}

function Steps({ c, hatch }: MotifProps) {
  const pts = [
    [180, 470],
    [260, 470],
    [260, 410],
    [340, 410],
    [340, 350],
    [420, 350],
    [420, 290],
    [500, 290],
    [500, 230],
    [580, 230],
    [580, 170],
    [660, 170],
  ];
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("");
  return (
    <>
      <path d={`${d}V470Z`} fill={`url(#${hatch})`} />
      <path d={d} stroke={c.fg} strokeWidth="3" fill="none" />
      <path d="M190 440C300 420 470 330 610 150" stroke={c.soft} strokeWidth="1.5" strokeDasharray="2 8" strokeLinecap="round" fill="none" />
      {[
        [260, 410],
        [340, 350],
        [420, 290],
        [500, 230],
        [580, 170],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="7" fill={c.fg} />
      ))}
      <path d="M640 170V108" stroke={c.fg} strokeWidth="3" />
      <path className="ncv__flag" d="M640 108L690 122L640 136Z" fill={RED} style={{ transformOrigin: "640px 122px" }} />
    </>
  );
}

function Donut({ c, hatch }: MotifProps) {
  const segs = [
    { v: 58, s: c.acc },
    { v: 22, s: "#2A6650" },
    { v: 12, s: `url(#${hatch})` },
    { v: 8, s: RED },
  ];
  let acc = 0;
  return (
    <>
      <g transform="rotate(-90 350 300)">
        <circle cx="350" cy="300" r="120" stroke={c.rule} strokeWidth="46" fill="none" />
        {segs.map((sg, i) => {
          const start = acc;
          acc += sg.v;
          return (
            <circle
              key={i}
              cx="350"
              cy="300"
              r="120"
              pathLength={100}
              stroke={sg.s}
              strokeWidth="46"
              fill="none"
              strokeDasharray={`${sg.v - 0.7} ${100 - sg.v + 0.7}`}
              strokeDashoffset={-start}
            />
          );
        })}
      </g>
      <text className="ncv__disp" x="350" y="322" fontSize="62" textAnchor="middle" fill={c.fg}>
        ₴
      </text>
      {segs.map((sg, i) => (
        <g key={`l${i}`}>
          <rect x="538" y={196 + i * 54} width="20" height="20" fill={sg.s} stroke={i === 2 ? c.fg : "none"} strokeWidth="1" />
          <rect x="574" y={202 + i * 54} width={[110, 84, 64, 46][i]} height="8" fill={c.soft} />
          <text className="ncv__mono" x="720" y={212 + i * 54} fontSize="16" textAnchor="end" fill={c.fg}>
            {sg.v}%
          </text>
        </g>
      ))}
    </>
  );
}

function Nodes({ c }: MotifProps) {
  const person = (x: number, y: number, r: number, fill: string) => (
    <g>
      <circle cx={x} cy={y - r * 0.28} r={r * 0.3} fill={fill} />
      <path d={`M${x - r * 0.52} ${y + r * 0.5}a${r * 0.52} ${r * 0.46} 0 0 1 ${r * 1.04} 0Z`} fill={fill} />
    </g>
  );
  return (
    <>
      <path d="M300 300L452 196" stroke={c.fg} strokeWidth="2.5" />
      <path className="ncv__dash" d="M300 300L452 400" stroke={RED} strokeWidth="2.5" strokeDasharray="8 7" />
      <circle cx="300" cy="300" r="50" fill={c.acc} />
      {person(300, 300, 50, c.bg)}
      <circle cx="456" cy="194" r="34" stroke={c.fg} strokeWidth="2.5" fill="none" />
      {person(456, 194, 34, c.fg)}
      <g className="ncv__pop">
        <circle cx="458" cy="404" r="34" stroke={RED} strokeWidth="2.5" strokeDasharray="7 6" fill="none" />
        <path d="M458 390V418M444 404H472" stroke={RED} strokeWidth="3.5" strokeLinecap="round" />
      </g>
      <g transform="rotate(4 630 325)">
        <rect x="560" y="230" width="140" height="190" fill={c.sheet} stroke={c.fg} strokeWidth="1.5" />
        <rect x="580" y="252" width="70" height="10" fill={c.fg} />
        {[280, 300, 320, 340].map((y, i) => (
          <rect key={y} x="580" y={y} width={[96, 80, 100, 64][i]} height="6" fill={c.fg} opacity=".28" />
        ))}
        <path d="M582 392c10-14 16-15 19-4s8 7 14-6 12-4 16 3" stroke={RED} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M640 398H682" stroke={c.fg} strokeOpacity=".4" />
      </g>
    </>
  );
}

const MOTIFS: Record<CoverId, (p: MotifProps) => React.ReactElement> = {
  fork: Fork,
  calendar: Calendar,
  stack: Stack,
  lens: Lens,
  rebuild: Rebuild,
  scale: Scale,
  shield: Shield,
  steps: Steps,
  donut: Donut,
  nodes: Nodes,
};

export function NewsCover({
  cover,
  n,
  uid,
  wide = false,
  className = "",
}: {
  cover: CoverId;
  /** Номер статті «07» */
  n: string;
  /** Унікальний префікс для id патернів, якщо обкладинка трапляється на сторінці кілька разів */
  uid: string;
  /** Широкий формат 7:3 (шапка статті): полотно розширюється в боки, мотив не обрізається */
  wide?: boolean;
  className?: string;
}) {
  const c = TONES[COVER_TONE[cover]];
  const hatch = `ncv-h-${uid}`;
  const Motif = MOTIFS[cover];
  const X0 = wide ? -300 : 0;
  const W = wide ? 1400 : 800;
  return (
    <svg
      className={`ncv ${className}`}
      data-tone={COVER_TONE[cover]}
      viewBox={`${X0} 0 ${W} 600`}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden
      focusable="false"
    >
      <defs>
        <pattern id={hatch} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke={c.soft} strokeWidth="2" />
        </pattern>
      </defs>
      <rect x={X0} width={W} height="600" fill={c.bg} />
      <g className="ncv__rules">
        {Array.from({ length: 15 }, (_, i) => (
          <path key={i} d={`M${X0} ${20 + i * 40}H${X0 + W}`} stroke={c.rule} />
        ))}
      </g>
      <path d={`M${X0 + (wide ? 150 : 92)} 0V600M${X0 + (wide ? 157 : 99)} 0V600`} stroke={RED} strokeOpacity=".6" strokeWidth="1.5" />
      <g className="ncv__motif">
        <Motif c={c} hatch={hatch} uid={uid} />
      </g>
      <text className="ncv__mono" x={X0 + W - (wide ? 150 : 58)} y="512" fontSize="20" textAnchor="end" fill={c.soft}>
        № {n}
      </text>
    </svg>
  );
}
