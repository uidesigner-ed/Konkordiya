"use client";

import { useEffect, useRef } from "react";
import { markIntroDone } from "@/lib/motion";
import { loadFx } from "@/lib/fx";
import { Logo } from "@/components/ui/LogoMark";

/**
 * «Звірка»: лічильник 000 → 100, лінія розлінування заповнюється,
 * підсумок підкреслюється подвійною рискою, аркуш відгортається вгору.
 * Лише на першому візиті в сесії і лише якщо рух дозволено.
 */
function Reel({ digits }: { digits: number[] }) {
  return (
    <span className="preloader__reel">
      <span data-reel className="preloader__reel-track">
        {digits.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </span>
    </span>
  );
}

export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const el = ref.current;
    if (!el) return;
    const skip = !html.classList.contains("js-motion") || html.classList.contains("visited");
    if (skip) {
      markIntroDone();
      return;
    }

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    // Одометр: барабани цифр крутяться трансформами (текст малюється один раз).
    // Без GSAP — rAF і WAAPI, щоб старт не чекав на чанк анімацій.
    const [hund, tens, units] = el.querySelectorAll<HTMLElement>("[data-reel]");
    const bar = el.querySelector<HTMLElement>("[data-pre-bar]")!;
    const dbl = el.querySelectorAll<HTMLElement>("[data-pre-dbl]");
    const inner = el.querySelector<HTMLElement>("[data-pre-inner]")!;
    const inOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const QUILL = "cubic-bezier(0.7, 0, 0.12, 1)";
    const start = performance.now() + 150;
    const DURATION = 1050;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      dbl.forEach((d, i) =>
        d.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
          duration: 280,
          delay: i * 70,
          easing: QUILL,
          fill: "forwards",
        }),
      );
      // Аркуш відгортається, коли шар анімацій уже готовий (але не довше ніж 2.5 с)
      const ready = Promise.race([loadFx(), new Promise((r) => setTimeout(r, 2500))]);
      timer = setTimeout(async () => {
        await ready;
        try {
          sessionStorage.setItem("konk-intro", "1");
        } catch {}
        markIntroDone();
        inner.animate([{ transform: "translateY(0)" }, { transform: "translateY(-18%)" }], {
          duration: 900,
          easing: QUILL,
          fill: "forwards",
        });
        const out = el.animate([{ clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)" }], {
          duration: 900,
          easing: QUILL,
          fill: "forwards",
        });
        out.onfinish = () => (el.style.display = "none");
      }, 420);
    };

    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / DURATION));
      const e = inOut(t);
      const v = e * 100;
      units.style.transform = `translate3d(0, ${-v}em, 0)`;
      tens.style.transform = `translate3d(0, ${-Math.floor(v / 10)}em, 0)`;
      hund.style.transform = `translate3d(0, ${-Math.floor(v / 100)}em, 0)`;
      bar.style.transform = `scaleX(${e})`;
      if (t < 1) raf = requestAnimationFrame(tick);
      else finish();
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref} className="preloader" aria-hidden>
      <div data-pre-inner className="preloader__inner page-x">
        <div className="preloader__top">
          <Logo />
        </div>
        <div className="preloader__figure">
          <span className="preloader__num t-mono">
            <Reel digits={[0, 1]} />
            <Reel digits={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]} />
            <Reel digits={Array.from({ length: 101 }, (_, i) => i % 10)} />
          </span>
          <div className="preloader__double">
            <span data-pre-dbl />
            <span data-pre-dbl />
          </div>
        </div>
        <div className="preloader__rule">
          <span data-pre-bar />
        </div>
        <p className="preloader__note">
          Наведемо лад <span className="ital">у фінансах</span>
        </p>
      </div>
    </div>
  );
}
