"use client";

import { useRef } from "react";
import { useFx } from "@/lib/fx";
import { MQ, onIntroDone } from "@/lib/motion";

/**
 * Лічильник, що справді рахує, коли потрапляє в поле зору.
 * На сервері рендериться фінальне значення (SEO, без JS, reduced motion).
 */
export function Counter({
  value,
  suffix = "",
  pad = 0,
  afterIntro = false,
  className = "",
}: {
  value: number;
  suffix?: string;
  pad?: number;
  afterIntro?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => String(Math.round(n)).padStart(pad, "0");

  useFx(
    ref,
    ({ gsap, ScrollTrigger }) => {
      const el = ref.current;
      if (!el) return;
      const num = el.querySelector<HTMLElement>("[data-num]")!;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const state = { v: 0 };
        num.textContent = fmt(0);
        el.style.setProperty("--total-progress", "0");
        const run = () =>
          gsap.to(state, {
            v: value,
            duration: Math.min(2.4, 1.2 + value / 400),
            ease: "power3.out",
            onUpdate: () => {
              num.textContent = fmt(state.v);
            },
            onStart: () => el.style.setProperty("--total-progress", "1"),
          });
        let st: ScrollTrigger | undefined;
        let tween: gsap.core.Tween | undefined;
        let delay: gsap.core.Tween | undefined;
        const arm = () => {
          st = ScrollTrigger.create({
            trigger: el,
            start: "top 92%",
            once: true,
            onEnter: () => {
              tween = run();
            },
          });
        };
        const off = afterIntro
          ? onIntroDone(() => {
              delay = gsap.delayedCall(0.9, arm);
            })
          : (arm(), () => {});
        return () => {
          off();
          delay?.kill();
          tween?.kill();
          st?.kill();
          num.textContent = fmt(value);
          el.style.removeProperty("--total-progress");
        };
      });
    },
    [value],
  );

  return (
    <span ref={ref} className={`tnum ${className}`}>
      <span data-num>{fmt(value)}</span>
      {suffix && <span className="counter__suffix">{suffix}</span>}
    </span>
  );
}
