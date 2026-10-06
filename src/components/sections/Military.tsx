"use client";

import { Photo } from "@/components/ui/Photo";
import { imageReady } from "@/lib/image";
import { useRef } from "react";
import { useFx } from "@/lib/fx";
import { MQ } from "@/lib/motion";
import { content } from "@/content/uk";
import { site } from "@/config/site";
import { SectionHead } from "@/components/ui/SectionHead";
import { Button } from "@/components/ui/Button";

/** Підтримка військових — темний аркуш, особисте звернення Євгенії рядок за рядком. */
export function Military() {
  const root = useRef<HTMLElement>(null);
  const m = content.military;

  useFx(
    root,
    ({ gsap, ScrollTrigger, SplitText }) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      // Темний аркуш «розгортається» на всю ширину при вході
      mm.add(MQ.desktop, () => {
        gsap.fromTo(
          root.current,
          { clipPath: "inset(0% 4.5% 0% 4.5% round 36px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 20%", scrub: true },
          },
        );
      });

      mm.add(MQ.motion, (context) => {
        const split = SplitText.create(q(".mil-quote p"), {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          aria: "none",
          autoSplit: true,
          onSplit(self) {
            return gsap.fromTo(
              self.lines,
              { yPercent: 100 },
              {
                yPercent: 0,
                stagger: 0.12,
                ease: "none",
                scrollTrigger: { trigger: q(".mil-quote")[0], start: "top 80%", end: "bottom 62%", scrub: 0.8 },
              },
            );
          },
        });

        // Фото з'являється цілим, коли завантажене й декодоване, — без шторки «знизу вгору»
        const photo = q(".mil-photo")[0] as HTMLElement;
        gsap.set(photo, { opacity: 0, y: 60 });
        const revealPhoto = context.add("milPhoto", () => {
          gsap.to(photo, { opacity: 1, y: 0, duration: 1.5, ease: "paper" });
          gsap.fromTo(photo.querySelector("img"), { scale: 1.06 }, { scale: 1, duration: 2.2, ease: "paper" });
        });
        let dead = false;
        ScrollTrigger.create({
          trigger: photo,
          start: "top 85%",
          once: true,
          onEnter: () => void imageReady(photo.querySelector("img")).then(() => !dead && revealPhoto()),
        });
        gsap.fromTo(
          q(".mil-glyph"),
          { yPercent: 20 },
          { yPercent: -25, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
        gsap.from(q(".mil-sign, .mil-cta"), {
          y: 30,
          opacity: 0,
          duration: 1.1,
          stagger: 0.12,
          scrollTrigger: { trigger: q(".mil-sign")[0], start: "top 90%", once: true },
        });
        return () => {
          dead = true;
          split.revert();
        };
      });
    },
  );

  return (
    <section ref={root} id="viiskovym" aria-labelledby="military-title" className="military" data-cursor-dark>
      <span className="mil-glyph" aria-hidden>
        «
      </span>
      <div className="mil-grid page-x">
        <div className="mil-media">
          <div className="mil-photo">
            <div className="mil-photo__inner">
            <Photo
              src="/images/yevheniia-lace.webp"
              alt={m.photoAlt}
              fill
              sizes="(min-width: 1024px) 36vw, 90vw"
              className="object-contain object-bottom"
            />
            </div>
          </div>
        </div>

        <div className="mil-body">
          <SectionHead n={6} id="military-title" title={m.title} tone="paper" className="mil-title" />
          <blockquote className="mil-quote">
            {m.quote.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </blockquote>
          <p className="mil-sign">
            <span className="mil-sign__rule" aria-hidden />
            <span>
              <span className="ital mil-sign__name">{m.author}</span>
              <span className="mil-sign__role">{m.authorRole}</span>
            </span>
          </p>
          <div className="mil-cta">
            <p className="mil-cta__text">{m.cta}</p>
            <Button href={site.consultUrl} variant="light" size="lg" cursor={m.button}>
              {m.button}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
