"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { loadFx } from "@/lib/fx";
import { sections } from "@/content/uk";

/** Поле книги: номер поточного аркуша та назва розділу (лише десктоп). */
export function SheetIndicator() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let dead = false;
    let triggers: { kill: () => void }[] = [];
    loadFx().then(({ ScrollTrigger }) => {
      if (dead) return;
      triggers = sections.map((s, i) =>
        ScrollTrigger.create({
          trigger: `#${s.id}`,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setCurrent(i),
        }),
      );
    });
    return () => {
      dead = true;
      triggers.forEach((t) => t.kill());
    };
  }, []);

  const s = sections[current];
  const n = String(current + 1).padStart(2, "0");

  return (
    <div aria-hidden className="sheet-indicator">
      <div className="sheet-indicator__label">
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={s.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {s.label}
          </m.span>
        </AnimatePresence>
      </div>
      <div className="sheet-indicator__num t-mono">
        <span className="relative inline-block h-[1.2em] overflow-hidden align-bottom">
          <AnimatePresence mode="popLayout" initial={false}>
            <m.span
              key={n}
              className="block"
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
            >
              {n}
            </m.span>
          </AnimatePresence>
        </span>
        <span className="sheet-indicator__total">/{sections.length}</span>
      </div>
    </div>
  );
}
