"use client";

import { useRef } from "react";
import { useFx } from "@/lib/fx";
import { getLenis } from "@/lib/lenis";
import { MQ } from "@/lib/motion";
import { content } from "@/content/uk";

function Group() {
  return (
    <div className="marquee__group">
      {content.marquee.map((w, i) => (
        <span key={w} className="marquee__item">
          <span className={i % 2 ? "marquee__word marquee__word--ital" : "marquee__word"}>{w}</span>
          <svg className="marquee__sep" viewBox="0 0 32 32" aria-hidden>
            <path d="M8 17.5 13 22.5 25 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ))}
    </div>
  );
}

/** Біжучий рядок: швидкість і напрям залежать від скролу, легкий нахил на розгоні. */
export function Marquee() {
  const root = useRef<HTMLDivElement>(null);

  useFx(
    root,
    ({ gsap }) => {
      const track = root.current?.querySelector<HTMLElement>(".marquee__track");
      if (!track) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        let x = 0;
        let dir = -1;
        let skew = 0;
        let width = (track.firstElementChild as HTMLElement).offsetWidth;
        const setX = gsap.quickSetter(track, "x", "px");
        const setSkew = gsap.quickSetter(track, "skewX", "deg");
        const ro = new ResizeObserver(() => {
          width = (track.firstElementChild as HTMLElement).offsetWidth;
        });
        ro.observe(track);
        let visible = true;
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(track);

        const tick = (_t: number, dt: number) => {
          if (!visible) return;
          const v = getLenis()?.velocity ?? 0;
          if (Math.abs(v) > 0.3) dir = v > 0 ? -1 : 1;
          const speed = 70 + Math.min(Math.abs(v) * 42, 1400);
          x += (dir * speed * dt) / 1000;
          if (x <= -width) x += width;
          if (x > 0) x -= width;
          skew += (gsap.utils.clamp(-7, 7, -v * 0.35) - skew) * 0.1;
          setX(x);
          setSkew(skew);
        };
        gsap.ticker.add(tick);
        return () => {
          gsap.ticker.remove(tick);
          ro.disconnect();
          io.disconnect();
        };
      });
    },
  );

  return (
    <div ref={root} className="marquee" aria-hidden>
      <div className="marquee__track">
        <Group />
        <Group />
      </div>
    </div>
  );
}
