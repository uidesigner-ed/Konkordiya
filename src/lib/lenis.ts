"use client";

import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  instance = l;
}

export function getLenis() {
  return instance;
}

/** Плавний перехід до якоря з урахуванням Lenis (або нативний, якщо його немає). */
export function scrollToTarget(target: string | HTMLElement, opts: { immediate?: boolean } = {}) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, { offset: 0, duration: 1.6, immediate: opts.immediate, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    el.scrollIntoView({ behavior: opts.immediate ? "auto" : "smooth", block: "start" });
  }
  // Фокус на секцію для клавіатури та скрінрідерів
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}
