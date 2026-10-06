"use client";

import { AnimatePresence, m, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";

type Mode = "default" | "link" | "label";

/**
 * Кастомний курсор: червона крапка-перо + смарагдове кільце.
 * Над [data-cursor="..."] кільце розгортається в коло з підписом.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("default");
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);
  const [dark, setDark] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 420, damping: 34, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 420, damping: 34, mass: 0.5 });

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- вмикаємо лише на клієнті з мишею
    setEnabled(true);
    const html = document.documentElement;
    html.classList.add("has-cursor");

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t || !t.closest) return;
      setDark(!!t.closest("[data-cursor-dark]"));
      const labelled = t.closest<HTMLElement>("[data-cursor]");
      if (labelled && labelled.dataset.cursor) {
        setMode("label");
        setLabel(labelled.dataset.cursor);
        return;
      }
      if (t.closest("a, button, [role='button'], label, summary")) {
        setMode("link");
        return;
      }
      setMode("default");
    };
    const leave = () => setVisible(false);
    const down = () => html.classList.add("cursor-down");
    const up = () => html.classList.remove("cursor-down");

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="cursor" data-visible={visible} data-mode={mode} data-dark={dark}>
      <m.div className="cursor__ring" style={{ x: rx, y: ry }}>
        <AnimatePresence>
          {mode === "label" && (
            <m.span
              key={label}
              className="cursor__label"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {label}
            </m.span>
          )}
        </AnimatePresence>
      </m.div>
      <m.div className="cursor__dot" style={{ x, y }} />
    </div>
  );
}
