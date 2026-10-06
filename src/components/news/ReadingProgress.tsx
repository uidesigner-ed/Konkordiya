"use client";

import { useEffect, useRef } from "react";
import { newsUi } from "@/content/news";

/**
 * Прогрес читання: тонка червона лінія вгорі + відсоток на полі книги (десктоп),
 * як номер аркуша на головній. Рахується по тілу статті.
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const bar = useRef<HTMLSpanElement>(null);
  const num = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    let raf = 0;
    let last = -1;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / r.height));
      bar.current!.style.transform = `scaleX(${p})`;
      const pct = Math.round(p * 100);
      if (pct !== last) {
        last = pct;
        num.current!.textContent = String(pct).padStart(2, "0");
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetId]);

  return (
    <>
      <div className="read-bar" aria-hidden>
        <span ref={bar} />
      </div>
      <div className="sheet-indicator read-ind" aria-hidden>
        <div className="sheet-indicator__label">{newsUi.progress}</div>
        <div className="sheet-indicator__num t-mono">
          <span ref={num}>00</span>
          <span className="sheet-indicator__total">%</span>
        </div>
      </div>
    </>
  );
}
