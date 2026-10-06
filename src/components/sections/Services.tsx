"use client";

import { useRef } from "react";
import { useFx } from "@/lib/fx";
import { MQ } from "@/lib/motion";
import { content } from "@/content/uk";
import { site } from "@/config/site";
import { SectionHead } from "@/components/ui/SectionHead";
import { IconArrow, serviceIcons } from "@/components/ui/Icons";

/** Основні послуги — індекс-список: рядок розсувається, іконка прокреслюється. */
export function Services() {
  const root = useRef<HTMLElement>(null);
  const s = content.services;

  useFx(
    root,
    ({ gsap }) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        q(".svc-row").forEach((row) => {
          gsap.from(row.querySelectorAll(".svc-row__rule"), {
            scaleX: 0,
            duration: 1.4,
            ease: "quill",
            scrollTrigger: { trigger: row, start: "top 90%", once: true },
          });
          const texts = row.querySelectorAll(".svc-row__num, .svc-row__title-in, .svc-row__more");
          if (!texts.length) return; // завершальна лінія списку — без тексту
          gsap.from(texts, {
            yPercent: 60,
            opacity: 0,
            duration: 1.1,
            stagger: 0.06,
            scrollTrigger: { trigger: row, start: "top 90%", once: true },
          });
        });
      });

      // Іконка прокреслюється при наведенні/фокусі
      mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
        const handlers: [Element, () => void, () => void][] = [];
        q(".svc-row__link").forEach((link) => {
          const paths = link.querySelectorAll("[data-draw]");
          gsap.set(paths, { drawSVG: "0%" });
          const enter = (() => {
            gsap.to(paths, { drawSVG: "100%", duration: 0.9, stagger: 0.06, ease: "power2.out", overwrite: true });
          });
          const leave = (() => {
            gsap.to(paths, { drawSVG: "0%", duration: 0.4, ease: "power2.in", overwrite: true });
          });
          link.addEventListener("pointerenter", enter);
          link.addEventListener("focus", enter);
          link.addEventListener("pointerleave", leave);
          link.addEventListener("blur", leave);
          handlers.push([link, enter, leave]);
        });
        return () =>
          handlers.forEach(([l, e, lv]) => {
            l.removeEventListener("pointerenter", e);
            l.removeEventListener("focus", e);
            l.removeEventListener("pointerleave", lv);
            l.removeEventListener("blur", lv);
          });
      });
    },
  );

  return (
    <section ref={root} id="poslugy" aria-labelledby="services-title" className="section page-x">
      <SectionHead n={3} id="services-title" title={s.title} className="svc-title mb-14 lg:mb-20" />

      <ol className="svc-list">
        {s.items.map((it, i) => {
          const Icon = serviceIcons[it.icon as keyof typeof serviceIcons];
          return (
            <li key={it.title} className="svc-row">
              <span className="svc-row__rule" aria-hidden />
              <a
                href={site.consultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="svc-row__link"
                data-cursor={s.more}
                aria-label={`${it.title} — ${s.more.toLowerCase()} у Telegram`}
              >
                <span className="svc-row__num t-mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="svc-row__title t-display">
                  <span className="svc-row__title-in">{it.title}</span>
                </span>
                <span className="svc-row__icon" aria-hidden>
                  <Icon size={56} />
                </span>
                <span className="svc-row__more" aria-hidden>
                  <span>{s.more}</span>
                  <IconArrow size={16} />
                </span>
              </a>
            </li>
          );
        })}
        <li aria-hidden className="svc-row svc-row--end">
          <span className="svc-row__rule" />
        </li>
      </ol>
    </section>
  );
}
