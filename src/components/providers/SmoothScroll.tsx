"use client";

import { useEffect } from "react";
import type Lenis from "lenis";
import { loadFx } from "@/lib/fx";
import { scrollToTarget, setLenis } from "@/lib/lenis";
import { isIntroDone, onIntroDone, prefersReducedMotion } from "@/lib/motion";

/** Lenis + синхронізація зі ScrollTrigger + плавні якорі. Обидві бібліотеки — ледачим чанком. */
export function SmoothScroll() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("hydrated");

    let dead = false;
    let teardown = () => {};

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute("href") ?? "";
      if (hash.length < 2) return;
      const el = document.querySelector<HTMLElement>(hash);
      if (!el) return;
      e.preventDefault();
      scrollToTarget(el);
      history.replaceState(null, "", hash);
    };
    document.addEventListener("click", onClick);

    const reduced = prefersReducedMotion();
    Promise.all([reduced ? null : import("lenis"), loadFx()]).then(([lenisMod, { gsap, ScrollTrigger }]) => {
      if (dead) return;
      // Шрифти змінюють висоти — перераховуємо тригери
      document.fonts?.ready.then(() => {
        ScrollTrigger.refresh();
        // Прийшли за посиланням на якір (/#poslugy з іншої сторінки): після пінів і шрифтів
        // позиції зсунулися — доводимо до цілі ще раз
        const hash = decodeURIComponent(window.location.hash);
        const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
        if (target) requestAnimationFrame(() => scrollToTarget(target, { immediate: true }));
      });
      if (!lenisMod) return;

      const lenis: Lenis = new lenisMod.default({
        lerp: 0.095,
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.4,
      });
      setLenis(lenis);
      if (process.env.NODE_ENV !== "production") (window as unknown as { __lenis: Lenis }).__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      let offIntro = () => {};
      if (!isIntroDone()) {
        lenis.stop();
        offIntro = onIntroDone(() => lenis.start());
      }
      teardown = () => {
        offIntro();
        gsap.ticker.remove(tick);
        lenis.destroy();
        setLenis(null);
      };
    });

    return () => {
      dead = true;
      document.removeEventListener("click", onClick);
      teardown();
    };
  }, []);

  return null;
}
