"use client";

import { useRef } from "react";
import { useFx } from "@/lib/fx";
import { MQ } from "@/lib/motion";
import { content } from "@/content/uk";
import { SectionHead } from "@/components/ui/SectionHead";
import { RichText } from "@/components/ui/RichText";

/** Переваги як гістограма зростання + величезна фраза «Ви займаєтесь бізнесом. Ми — цифрами.» */
export function Advantages() {
  const root = useRef<HTMLElement>(null);
  const a = content.advantages;

  useFx(
    root,
    ({ gsap, ScrollTrigger }) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: q(".adv-chart")[0], start: "top 80%", end: "bottom 98%", scrub: 0.9 },
        });
        q(".adv-bar").forEach((bar, i) => {
          tl.fromTo(bar.querySelector(".adv-bar__fill"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: 1 }, i * 0.35);
          tl.from(bar.querySelectorAll(".adv-bar__content > *"), { y: 30, opacity: 0, stagger: 0.12, duration: 0.6, ease: "power2.out" }, i * 0.35 + 0.5);
        });
      });

      // Фраза: рядки роз'їжджаються назустріч один одному (лише десктоп)
      mm.add(MQ.desktop, () => {
        const st = { trigger: q(".adv-phrase")[0], start: "top bottom", end: "bottom top", scrub: true };
        gsap.fromTo(q(".adv-phrase__human"), { xPercent: -8 }, { xPercent: 4, ease: "none", scrollTrigger: st });
        gsap.fromTo(q(".adv-phrase__numbers"), { xPercent: 0 }, { xPercent: -9, ease: "none", scrollTrigger: st });
      });

      mm.add(MQ.mobile, () => {
        q(".adv-bar").forEach((bar) => {
          gsap.fromTo(
            bar.querySelector(".adv-bar__fill"),
            { clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "quill", scrollTrigger: { trigger: bar, start: "top 85%", once: true } },
          );
        });
      });

      mm.add(MQ.motion, () => {
        gsap.from(q(".adv-intro"), { y: 40, opacity: 0, duration: 1.2, scrollTrigger: { trigger: q(".adv-intro")[0], start: "top 88%", once: true } });


        const scr = q(".adv-phrase__scramble")[0];
        if (scr) {
          const final = scr.textContent ?? "";
          ScrollTrigger.create({
            trigger: scr,
            start: "top 80%",
            once: true,
            onEnter: () => {
              scr.style.minWidth = `${scr.offsetWidth}px`;
              gsap.to(scr, {
                duration: 1.8,
                scrambleText: { text: final, chars: "0123456789", revealDelay: 0.5, speed: 0.5 },
              });
            },
          });
        }
      });
    },
  );

  return (
    <section ref={root} id="perevagy" aria-labelledby="adv-title" className="section page-x adv">
      <div className="adv-top">
        <SectionHead n={7} id="adv-title" title={a.title} />
        <p className="adv-intro t-lead">
          <RichText parts={a.intro} />
        </p>
      </div>

      <ol className="adv-chart">
        {a.items.map((it, i) => (
          <li key={it.n} className="adv-bar" style={{ "--h": 0.44 + i * 0.13 } as React.CSSProperties}>
            <div className="adv-bar__fill">
              <div className="adv-bar__content">
                <span className="adv-bar__num t-mono">{it.n}</span>
                <h3 className="adv-bar__title">{it.title}</h3>
                <p className="adv-bar__text">{it.text}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="adv-phrase">
        <span className="sr-only">{`${a.phrase.human} ${a.phrase.numbers}`}</span>
        <span className="adv-phrase__human ital" aria-hidden>
          {a.phrase.human}
        </span>
        <span className="adv-phrase__numbers t-display" aria-hidden>
          Ми — <span className="adv-phrase__scramble">цифрами.</span>
        </span>
      </p>
    </section>
  );
}
