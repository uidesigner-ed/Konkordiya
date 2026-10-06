import type { SVGProps } from "react";

/**
 * Власний набір лінійних іконок «Конкордії».
 * Усі — контурні, одна товщина лінії, заокруглені закінчення.
 * Атрибут data-draw позначає контури, що «прокреслюються» при появі.
 */

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number | undefined, vb: number, props: P) => {
  const { size: _s, ...rest } = props;
  void _s;
  return {
    width: size ?? vb,
    height: size ?? vb,
    viewBox: `0 0 ${vb} ${vb}`,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    ...rest,
  };
};

/* ───────── UI 24×24 ───────── */

export const IconTelegram = (p: P) => (
  <svg {...base(p.size ?? 22, 24, p)} strokeWidth={1.5}>
    <path d="M21.2 3.6 2.9 10.6c-.8.3-.8 1.5.1 1.8l4.6 1.4 1.8 5.5c.2.7 1.1.9 1.6.4l2.6-2.4 4.8 3.5c.6.4 1.5.1 1.6-.6l3.2-15.2c.2-.9-.6-1.6-1.4-1.3Z" />
    <path d="m7.6 13.8 9.8-6.4-7.6 7.9-.4 3.6" />
  </svg>
);

export const IconWhatsApp = (p: P) => (
  <svg {...base(p.size ?? 22, 24, p)} strokeWidth={1.5}>
    <path d="M3.5 20.5 4.8 16A8.5 8.5 0 1 1 8 19.3l-4.5 1.2Z" />
    <path d="M9.1 8.2c.3-.4.8-.4 1 0l.8 1.7c.1.3 0 .6-.2.8l-.6.6c.5 1.2 1.5 2.2 2.7 2.7l.6-.6c.2-.2.5-.3.8-.2l1.7.8c.4.2.4.7 0 1-.6.6-1.3 1-2.1.9-2.9-.4-5.4-2.9-5.8-5.8-.1-.8.4-1.5 1.1-1.9Z" />
  </svg>
);

export const IconInstagram = (p: P) => (
  <svg {...base(p.size ?? 22, 24, p)} strokeWidth={1.5}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.9" />
    <circle cx="17.1" cy="6.9" r=".6" fill="currentColor" stroke="none" />
  </svg>
);

export const IconLinkedIn = (p: P) => (
  <svg {...base(p.size ?? 22, 24, p)} strokeWidth={1.5}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M8 10.5V17M12 17v-6.5m0 2.9c0-1.7 1.1-2.9 2.6-2.9s2.5 1 2.5 2.8V17" />
    <circle cx="8" cy="7.6" r=".55" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPhone = (p: P) => (
  <svg {...base(p.size ?? 22, 24, p)} strokeWidth={1.5}>
    <path d="M6.3 3.8h2.6l1.4 3.9-2 1.3a11 11 0 0 0 6.7 6.7l1.3-2 3.9 1.4v2.6c0 1-.8 1.8-1.8 1.8C10.6 19.5 4.5 13.4 4.5 5.6c0-1 .8-1.8 1.8-1.8Z" />
  </svg>
);

export const IconMail = (p: P) => (
  <svg {...base(p.size ?? 22, 24, p)} strokeWidth={1.5}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
    <path d="m4 6.5 8 6 8-6" />
  </svg>
);

export const IconPin = (p: P) => (
  <svg {...base(p.size ?? 22, 24, p)} strokeWidth={1.5}>
    <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);

export const IconArrow = (p: P) => (
  <svg {...base(p.size ?? 18, 24, p)} strokeWidth={1.6}>
    <path d="M7 17 17 7M8.5 7H17v8.5" />
  </svg>
);

export const IconArrowDown = (p: P) => (
  <svg {...base(p.size ?? 18, 24, p)} strokeWidth={1.6}>
    <path d="M12 4v16M6 14l6 6 6-6" />
  </svg>
);

export const IconArrowRight = (p: P) => (
  <svg {...base(p.size ?? 18, 24, p)} strokeWidth={1.6}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);

export const IconFacebook = (p: P) => (
  <svg {...base(p.size ?? 22, 24, p)} strokeWidth={1.5}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M15.3 7.6h-1.6c-1.3 0-2.2.9-2.2 2.2v10.7M9.2 12.6h5.6" />
  </svg>
);

export const IconLink = (p: P) => (
  <svg {...base(p.size ?? 22, 24, p)} strokeWidth={1.5}>
    <path d="M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1 1" />
    <path d="M14 10a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1-1" />
  </svg>
);

export const IconShare = (p: P) => (
  <svg {...base(p.size ?? 22, 24, p)} strokeWidth={1.5}>
    <path d="M12 3.5v11M8 7.5l4-4 4 4" />
    <path d="M7 10.5H5.5v10h13v-10H17" />
  </svg>
);

export const IconSearch = (p: P) => (
  <svg {...base(p.size ?? 20, 24, p)} strokeWidth={1.6}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </svg>
);

export const IconStar = (p: P) => (
  <svg {...base(p.size ?? 16, 24, p)} fill="currentColor" stroke="none">
    <path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8L12 2.8Z" />
  </svg>
);

/** Галочка звірки: рамка + «пташка», що прокреслюється */
export const IconTick = (p: P) => (
  <svg {...base(p.size ?? 32, 32, p)} strokeWidth={1.4}>
    <path data-box d="M5 6.5h22v22H5z" opacity=".55" />
    <path data-draw d="M9.5 17.5 14 22 27.5 4.5" stroke="var(--red)" strokeWidth={2} />
  </svg>
);

/* ───────── Основні послуги 48×48 ───────── */

export const IconRegister = (p: P) => (
  <svg {...base(p.size ?? 48, 48, p)} strokeWidth={1.3}>
    <path data-draw d="M11 5.5h17.5l7 7v30H11z" />
    <path data-draw d="M28.5 5.5v7h7" />
    <path data-draw d="M16 17h13M16 22h15M16 27h8" />
    <circle data-draw cx="31" cy="34" r="6.5" />
    <circle data-draw cx="31" cy="34" r="3.6" />
  </svg>
);

export const IconReport = (p: P) => (
  <svg {...base(p.size ?? 48, 48, p)} strokeWidth={1.3}>
    <path data-draw d="M8.5 9.5h20v31h-20z" />
    <path data-draw d="M13 16h11M13 21h11M13 26h7M13 31h9" />
    <path data-draw d="M37 35V11.5M31.5 17l5.5-5.5 5.5 5.5" />
  </svg>
);

export const IconLedger = (p: P) => (
  <svg {...base(p.size ?? 48, 48, p)} strokeWidth={1.3}>
    <path data-draw d="M24 12.5c-4.5-3-10.5-3.8-18-2.8v27.6c7.5-1 13.5-.2 18 2.8 4.5-3 10.5-3.8 18-2.8V9.7c-7.5-1-13.5-.2-18 2.8Z" />
    <path data-draw d="M24 12.5v27.6" />
    <path data-draw d="M10 17h9.5M10 22h9.5M10 27h9.5M28.5 17H38M28.5 22H38M28.5 27h6" />
  </svg>
);

export const IconAudit = (p: P) => (
  <svg {...base(p.size ?? 48, 48, p)} strokeWidth={1.3}>
    <path data-draw d="M24 5.5 38 10.5v11c0 9.2-5.8 16.4-14 20.5-8.2-4.1-14-11.3-14-20.5v-11L24 5.5Z" />
    <path data-draw d="m17.5 23.5 4.6 4.6 8.8-9.6" />
  </svg>
);

export const IconPayroll = (p: P) => (
  <svg {...base(p.size ?? 48, 48, p)} strokeWidth={1.3}>
    <circle data-draw cx="17" cy="15" r="5.5" />
    <path data-draw d="M6.5 38c0-6.6 4.7-11.5 10.5-11.5S27.5 31.4 27.5 38" />
    <ellipse data-draw cx="36" cy="38" rx="6.5" ry="2.2" />
    <path data-draw d="M29.5 38v-4.4c0 1.2 2.9 2.2 6.5 2.2s6.5-1 6.5-2.2V38M29.5 33.6v-4.4c0 1.2 2.9 2.2 6.5 2.2s6.5-1 6.5-2.2v4.4" />
    <ellipse data-draw cx="36" cy="29.2" rx="6.5" ry="2.2" />
  </svg>
);

/* ───────── Податковий супровід 48×48 ───────── */

export const IconPlanning = (p: P) => (
  <svg {...base(p.size ?? 48, 48, p)} strokeWidth={1.3}>
    <path data-draw d="M7 7v34h34" />
    <path data-draw d="m12 13 8 7.5 6.5-3.5L37 30" />
    <path data-draw d="M37 23.5V30h-6.5" />
    <path data-draw d="M12 36h4M20 36h4M28 36h4" opacity=".6" />
  </svg>
);

export const IconConsult = (p: P) => (
  <svg {...base(p.size ?? 48, 48, p)} strokeWidth={1.3}>
    <path data-draw d="M6 9.5h23v15H15l-6 5v-5H6z" />
    <path data-draw d="M33 18.5h9v15h-3v5l-6-5h-14v-5" />
    <path data-draw d="M11 15h13M11 19.5h8" />
  </svg>
);

export const IconChoice = (p: P) => (
  <svg {...base(p.size ?? 48, 48, p)} strokeWidth={1.3}>
    <path data-draw d="M24 43V27M24 27 11 13M24 27l13-14" />
    <circle data-draw cx="9" cy="10.5" r="3.5" />
    <circle data-draw cx="24" cy="8" r="3.5" opacity=".55" />
    <path data-draw d="M24 11.5V27" opacity=".55" />
    <circle data-draw cx="39" cy="10.5" r="3.5" />
    <path data-draw d="m37.2 10.6 1.3 1.3 2.4-2.6" stroke="var(--red)" strokeWidth={1.6} />
  </svg>
);

export const IconAnalysis = (p: P) => (
  <svg {...base(p.size ?? 48, 48, p)} strokeWidth={1.3}>
    <path data-draw d="M8 40V28M15 40V20M22 40V24" />
    <circle data-draw cx="31" cy="17" r="8.5" />
    <path data-draw d="m37 23 7 7" />
    <path data-draw d="M27 19.5 30 16l2.5 2 3-4" />
  </svg>
);

/* ───────── Етапи співпраці 160×120 ───────── */

const stageBase = (p: P) => ({
  ...base(undefined, 160, p),
  viewBox: "0 0 160 120",
  width: p.width ?? 320,
  height: p.height ?? 240,
  strokeWidth: 1.1,
});

export const StageConsult = (p: P) => (
  <svg {...stageBase(p)}>
    <path data-draw d="M18 24h70v40H46l-16 14V64H18z" />
    <path data-draw d="M28 38h50M28 48h34" />
    <path data-draw d="M100 46h42v34h-10v12l-14-12h-18z" />
    <circle data-draw cx="121" cy="57" r="4" />
    <path data-draw d="m124 60 6 6" />
    <path data-draw d="M10 104h140" opacity=".5" />
  </svg>
);

export const StageDocs = (p: P) => (
  <svg {...stageBase(p)}>
    <path data-draw d="M20 22h44v64H20z" />
    <path data-draw d="M26 16h44v64" opacity=".55" />
    <path data-draw d="M28 34h28M28 42h28M28 50h20M28 58h24" />
    <path data-draw d="M78 52h32M102 44l8 8-8 8" stroke="var(--red)" strokeWidth={1.4} />
    <path data-draw d="M118 30h26v52h-26z" />
    <path data-draw d="M118 44h26M131 30v14" />
    <path data-draw d="M10 104h140" opacity=".5" />
  </svg>
);

export const StageLedger = (p: P) => (
  <svg {...stageBase(p)}>
    <path data-draw d="M18 18h82v74H18z" />
    <path data-draw d="M18 32h82M18 46h82M18 60h82M18 74h82M44 18v74M72 18v74" />
    <path data-draw d="M78 85h18M78 88.5h18" stroke="var(--red)" strokeWidth={1.3} />
    <path data-draw d="M112 92V66M124 92V52M136 92V40M148 92V28" />
    <path data-draw d="M10 104h140" opacity=".5" />
  </svg>
);

export const StageSupport = (p: P) => (
  <svg {...stageBase(p)}>
    <circle data-draw cx="40" cy="52" r="18" />
    <circle data-draw cx="120" cy="52" r="18" />
    <path data-draw d="M58 46c14-8 30-8 44 0M58 58c14 8 30 8 44 0" />
    <path data-draw d="m31 52 6 6 12-13" />
    <path data-draw d="m111 52 6 6 12-13" stroke="var(--red)" strokeWidth={1.4} />
    <path data-draw d="M10 104h140" opacity=".5" />
  </svg>
);

export const serviceIcons = {
  register: IconRegister,
  report: IconReport,
  ledger: IconLedger,
  audit: IconAudit,
  payroll: IconPayroll,
} as const;

export const supportIcons = {
  planning: IconPlanning,
  consult: IconConsult,
  choice: IconChoice,
  analysis: IconAnalysis,
} as const;

export const stageIcons = [StageConsult, StageDocs, StageLedger, StageSupport];
