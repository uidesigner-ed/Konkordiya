"use client";

import { useEffect } from "react";
import type Lenis from "lenis";
import { loadFx } from "@/lib/fx";
import { getLenis, scrollToTarget, setLenis } from "@/lib/lenis";
import { isIntroDone, onIntroDone, prefersReducedMotion } from "@/lib/motion";

/**
 * Позиція прокрутки при перезавантаженні / «Назад»: браузер відновлює її одразу, ще до анімацій,
 * а потім висоти змінюються (шрифти, піни) — і тригери блоків вище екрана застрягають у прихованому
 * стані (ScrollTrigger не виконує дій, якщо стан змінився під час refresh). Тому відновлюємо самі —
 * після того, як тригери створено й перераховано: стрибок униз запускає їхні анімації як звичайний скрол.
 */
const SCROLL_KEY = (path: string) => `konk-scroll:${path}`;

function savedScrollToRestore() {
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (!nav || (nav.type !== "reload" && nav.type !== "back_forward") || window.location.hash.length > 1) return 0;
  try {
    return Number(sessionStorage.getItem(SCROLL_KEY(window.location.pathname))) || 0;
  } catch {
    return 0;
  }
}

/** Lenis + синхронізація зі ScrollTrigger + плавні якорі. Обидві бібліотеки — ледачим чанком. */
export function SmoothScroll() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("hydrated");

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const restoreY = savedScrollToRestore();
    const saveScroll = () => {
      try {
        sessionStorage.setItem(SCROLL_KEY(window.location.pathname), String(Math.round(window.scrollY)));
      } catch {}
    };
    window.addEventListener("pagehide", saveScroll);

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
      // Шрифти й зображення змінюють висоти — перераховуємо тригери, потім повертаємо збережену позицію
      const loaded = new Promise<void>((r) => (document.readyState === "complete" ? r() : window.addEventListener("load", () => r(), { once: true })));
      Promise.all([document.fonts?.ready, restoreY ? loaded : null]).then(() => {
        if (dead) return;
        ScrollTrigger.refresh();
        if (restoreY) {
          // setTimeout, а не rAF: спрацює й у фоновій вкладці (перезавантажили й перемкнулися)
          setTimeout(() => {
            if (dead) return;
            const lenis = getLenis();
            if (lenis) lenis.scrollTo(restoreY, { immediate: true, force: true });
            else window.scrollTo(0, restoreY);
            ScrollTrigger.update();
          }, 0);
          return;
        }
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
      if (process.env.NODE_ENV !== "production") {
        Object.assign(window, { __lenis: lenis, __gsap: { gsap, ScrollTrigger } });
      }
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
      window.removeEventListener("pagehide", saveScroll);
      teardown();
    };
  }, []);

  return null;
}
