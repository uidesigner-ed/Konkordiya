"use client";

import { useFx } from "@/lib/fx";
import { MQ } from "@/lib/motion";

/**
 * Анімації сторінок новин при прокрутці (GSAP — ледачим чанком):
 * [data-reveal] — підйом із проявом; лінія над підзаголовком статті прокреслюється;
 * обкладинка статті — легкий паралакс. Те, що вже на екрані, не ховаємо.
 */
export function NewsFx() {
  useFx(null, ({ gsap, ScrollTrigger }) => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92;

      const els = gsap.utils.toArray<HTMLElement>("[data-reveal]").filter(below);
      if (els.length) {
        gsap.set(els, { autoAlpha: 0, y: 36 });
        // end: "max" — якщо проскочили елемент (перехід за змістом), він однаково з’явиться
        ScrollTrigger.batch(els, {
          start: "top 92%",
          end: "max",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08, ease: "paper", overwrite: true }),
        });
      }

      gsap.utils.toArray<HTMLElement>(".art-body h2").forEach((h) => {
        const rule = h.querySelector(".art-h2__rule");
        if (!rule || !below(h)) return;
        gsap.from(rule, { scaleX: 0, duration: 1.3, ease: "quill", scrollTrigger: { trigger: h, start: "top 90%", end: "max", once: true } });
      });
    });

    mm.add(MQ.desktop, () => {
      const cover = document.querySelector(".art-cover__frame");
      const inner = cover?.querySelector(".art-cover__inner");
      if (!cover || !inner) return;
      gsap.fromTo(
        inner,
        { yPercent: -4 },
        { yPercent: 4, ease: "none", scrollTrigger: { trigger: cover, start: "top bottom", end: "bottom top", scrub: true } },
      );
    });
  });
  return null;
}
