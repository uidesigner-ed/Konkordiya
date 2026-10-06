"use client";

import { Photo } from "@/components/ui/Photo";
import { useRef } from "react";
import { useFx } from "@/lib/fx";
import { MQ } from "@/lib/motion";
import { content } from "@/content/uk";
import { stats } from "@/config/site";
import { SectionHead } from "@/components/ui/SectionHead";
import { Counter } from "@/components/ui/Counter";

/** Досвід — текст на розлінованому аркуші заповнюється чорнилом у такт прокрутці. */
export function Experience() {
  const root = useRef<HTMLElement>(null);
  const e = content.experience;

  useFx(
    root,
    ({ gsap, SplitText }) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const split = SplitText.create(q(".exp-text p"), {
          type: "words",
          aria: "none",
          autoSplit: true,
          onSplit(self) {
            return gsap.fromTo(
              self.words,
              { opacity: 0.14 },
              {
                opacity: 1,
                stagger: 0.1,
                ease: "none",
                scrollTrigger: { trigger: q(".exp-text")[0], start: "top 78%", end: "bottom 58%", scrub: 0.6 },
              },
            );
          },
        });

        gsap.fromTo(
          q(".exp-photo"),
          { clipPath: "inset(12% 12% 12% 12%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: { trigger: q(".exp-photo")[0], start: "top 90%", end: "top 30%", scrub: true },
          },
        );
        gsap.fromTo(
          q(".exp-photo img"),
          // запас масштабу (10% з кожного боку) більший за зсув — краї кадру не оголюються
          { yPercent: -6, scale: 1.2 },
          { yPercent: 6, scale: 1.2, ease: "none", scrollTrigger: { trigger: q(".exp-photo")[0], start: "top bottom", end: "bottom top", scrub: true } },
        );
        return () => split.revert();
      });
    },
  );

  return (
    <section ref={root} id="dosvid" aria-labelledby="exp-title" className="section page-x">
      <div className="exp-grid">
        <div className="exp-media">
          <div className="exp-photo">
            <Photo
              src="/images/experience.jpg"
              alt={e.photoAlt}
              fill
              sizes="(min-width: 1024px) 40vw, 92vw"
              className="object-cover object-center"
            />
          </div>
          <p className="exp-years">
            <span className="ital exp-years__small">{e.years.before}</span>
            <span className="t-display exp-years__num">
              <Counter value={stats.years.value} />
            </span>
            <span className="ital exp-years__small">{e.years.after}</span>
          </p>
        </div>

        <div className="exp-body">
          <SectionHead n={9} id="exp-title" title={[e.title]} className="mb-10 lg:mb-14" />
          <div className="exp-text ruled">
            {e.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
