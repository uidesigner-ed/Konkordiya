"use client";

import { useRef } from "react";
import { useFx } from "@/lib/fx";
import { MQ } from "@/lib/motion";
import { content } from "@/content/uk";
import { stats } from "@/config/site";
import { IconArrow } from "@/components/ui/Icons";
import { SectionHead } from "@/components/ui/SectionHead";
import { Counter } from "@/components/ui/Counter";

/** «З ким ми працюємо» — реєстр-таблиця; рядок виділяється як у таблиці обліку. */
export function Audiences() {
  const root = useRef<HTMLElement>(null);
  const a = content.audiences;

  useFx(
    root,
    ({ gsap }) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(q(".reg-head > *"), {
          opacity: 0,
          y: 12,
          duration: 0.8,
          stagger: 0.08,
          scrollTrigger: { trigger: q(".reg")[0], start: "top 85%", once: true },
        });
        q(".reg-row").forEach((row) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 88%", once: true } });
          tl.from(row.querySelector(".reg-row__rule"), { scaleX: 0, duration: 1.4, ease: "quill" })
            .from(row.querySelector(".reg-row__abbr-text"), { yPercent: 105, duration: 1.2 }, 0.1)
            .from(row.querySelectorAll(".reg-row__name, .reg-row__text, .reg-row__stat"), { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.2);
        });
      });
    },
  );

  return (
    <section ref={root} id="z-kym-pratsiuiemo" aria-labelledby="audiences-title" className="section page-x">
      <SectionHead n={2} id="audiences-title" title={a.title} className="mb-14 lg:mb-24" />

      <table className="reg">
        <thead className="reg-head-wrap">
          <tr className="reg-head">
            {a.columns.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {a.items.map((it) => {
            const s = stats[it.stat as keyof typeof stats];
            return (
              <tr key={it.abbr} className="reg-row" tabIndex={0}>
                <th scope="row" className="reg-row__who">
                  <span className="reg-row__rule" aria-hidden />
                  <span className="reg-row__fill" aria-hidden />
                  <span className="reg-row__abbr t-display">
                    <span className="reg-row__abbr-text">{it.abbr}</span>
                  </span>
                  <span className="reg-row__name ital">{it.name}</span>
                </th>
                <td className="reg-row__text">
                  {it.text}
                  <a href={it.href} className="reg-row__link link-line">
                    {it.link}
                    <IconArrow size={14} />
                  </a>
                </td>
                <td className="reg-row__stat">
                  <span className="reg-row__num t-mono">
                    <Counter value={s.value} suffix={s.suffix} className="total" />
                  </span>
                  <span className="reg-row__statlabel">{it.statLabel}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
