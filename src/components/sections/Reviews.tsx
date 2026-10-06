"use client";

import { useRef } from "react";
import { useFx } from "@/lib/fx";
import { MQ } from "@/lib/motion";
import { content } from "@/content/uk";
import { site } from "@/config/site";
import { SectionHead } from "@/components/ui/SectionHead";
import { Button } from "@/components/ui/Button";
import { IconStar } from "@/components/ui/Icons";

function Stars({ size = 16 }: { size?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-red" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar key={i} size={size} />
      ))}
    </span>
  );
}

/** Відгуки — три голоси в розбіжній сітці, рейтинг Google «відмінно». */
export function Reviews() {
  const root = useRef<HTMLElement>(null);
  const r = content.reviews;

  useFx(
    root,
    ({ gsap }) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        q(".rev").forEach((rev) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: rev, start: "top 86%", once: true } });
          tl.from(rev.querySelector(".rev__rule"), { scaleX: 0, duration: 1.3, ease: "quill" })
            .from(rev.querySelector(".rev__mark"), { yPercent: 60, opacity: 0, duration: 1 }, 0.1)
            .from(rev.querySelectorAll(".rev__text, .rev__author"), { y: 26, opacity: 0, duration: 1, stagger: 0.1 }, 0.2);
        });
        gsap.from(q(".rev-rating > *"), {
          y: 16,
          opacity: 0,
          duration: 0.9,
          stagger: 0.08,
          scrollTrigger: { trigger: q(".rev-rating")[0], start: "top 90%", once: true },
        });
      });
      mm.add(MQ.desktop, () => {
        q(".rev").forEach((rev, i) => {
          gsap.fromTo(
            rev,
            { y: [0, 80, 30][i] },
            { y: [0, -60, -20][i], ease: "none", scrollTrigger: { trigger: q(".rev-grid")[0], start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
      });
    },
  );

  return (
    <section ref={root} id="vidguky" aria-labelledby="reviews-title" className="section page-x">
      <div className="rev-head">
        <SectionHead n={11} id="reviews-title" title={r.title} />
        <div className="rev-rating">
          <p className="rev-rating__source">
            <span className="rev-rating__g" aria-hidden>
              G
            </span>
            {r.ratingSource}
          </p>
          <p className="rev-rating__value">
            <span className="ital">{r.rating}</span>
            <Stars size={20} />
          </p>
          <Button href={site.reviewsUrl} variant="outline" cursor={r.more}>
            {r.more}
          </Button>
        </div>
      </div>

      <div className="rev-grid">
        {r.items.map((it) => (
          <figure key={it.author} className="rev">
            <span className="rev__rule" aria-hidden />
            <span className="rev__mark" aria-hidden>
              “
            </span>
            <blockquote className="rev__text">
              <p>{it.text}</p>
            </blockquote>
            <figcaption className="rev__author">
              <span className="font-medium text-ink">{it.author}</span>
              <Stars size={13} />
              <span className="sr-only">Оцінка: 5 з 5</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
