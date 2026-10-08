"use client";

import { useRef } from "react";
import { useFx } from "@/lib/fx";
import { MQ } from "@/lib/motion";
import { content } from "@/content/uk";
import { SectionHead } from "@/components/ui/SectionHead";
import { IconTick } from "@/components/ui/Icons";

/** Додаткові послуги — список звірки: галочки ставляться одна за одною, внизу «Разом». */
/** Додаткові послуги з власними сторінками */
const extraLinks: Record<string, string> = {
  "Відновлення бухгалтерського обліку": "/poslugy/vidnovlennia-obliku",
  "Аутсорсинг бухгалтерії для бізнесу": "/poslugy/bukhhalterskyi-autsorsynh",
};

export function Extra() {
  const root = useRef<HTMLElement>(null);
  const e = content.extra;

  useFx(
    root,
    ({ gsap }) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.set(q(".extra-item [data-draw]"), { drawSVG: "0%" });
        q(".extra-item").forEach((item) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: "top 86%", once: true } });
          tl.from(item.querySelector(".extra-item__rule"), { scaleX: 0, duration: 1.2, ease: "quill" })
            .from(item.querySelector(".extra-item__text"), { y: 20, opacity: 0, duration: 0.9 }, 0.1)
            .from(item.querySelector("[data-box]"), { opacity: 0, scale: 0.6, transformOrigin: "center", duration: 0.5 }, 0.15)
            .to(item.querySelector("[data-draw]"), { drawSVG: "100%", duration: 0.55, ease: "power2.inOut" }, 0.45);
        });
        gsap.from(q(".extra-total"), {
          opacity: 0,
          y: 20,
          duration: 1,
          scrollTrigger: { trigger: q(".extra-total")[0], start: "top 92%", once: true },
        });
      });
    },
  );

  return (
    <section ref={root} id="dodatkovo" aria-labelledby="extra-title" className="section section--tint page-x">
      <div className="extra-grid">
        <SectionHead n={5} id="extra-title" title={e.title} className="extra-title" />
        <ul className="extra-list">
          {e.items.map((t) => (
            <li key={t} className="extra-item">
              <span className="extra-item__rule" aria-hidden />
              <IconTick className="extra-item__tick" size={34} />
              <span className="extra-item__text">
                {extraLinks[t] ? (
                  <a href={extraLinks[t]} className="link-line">
                    {t}
                  </a>
                ) : (
                  t
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="extra-total">
          <span className="extra-total__label">{e.totalLabel}</span>
          <span className="extra-total__dots" aria-hidden />
          <span className="t-mono total">{String(e.items.length).padStart(2, "0")}</span>
        </p>
      </div>
    </section>
  );
}
