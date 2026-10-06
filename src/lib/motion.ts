"use client";

/** Глобальні прапорці руху та подія завершення інтро (прелоадер → hero). */

type Listener = () => void;
const listeners = new Set<Listener>();
let introDone = false;

export function onIntroDone(cb: Listener) {
  if (introDone) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function markIntroDone() {
  if (introDone) return;
  introDone = true;
  listeners.forEach((cb) => cb());
  listeners.clear();
}

export function isIntroDone() {
  return introDone;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isFinePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Медіа-запити для gsap.matchMedia */
export const MQ = {
  desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
  motion: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;
