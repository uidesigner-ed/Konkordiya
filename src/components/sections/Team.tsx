"use client";

import { Photo } from "@/components/ui/Photo";
import { imageReady } from "@/lib/image";
import { useRef } from "react";
import { useFx } from "@/lib/fx";
import { MQ } from "@/lib/motion";
import { content } from "@/content/uk";
import { team } from "@/config/site";
import { SectionHead } from "@/components/ui/SectionHead";

const speeds = [0, -14, 10, -8, 16];

/** Наша команда — колаж-розкладка з різною глибиною паралаксу. */
export function Team() {
  const root = useRef<HTMLElement>(null);

  useFx(
    root,
    ({ gsap, ScrollTrigger }) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, (context) => {
        let dead = false;
        q(".team-photo").forEach((fig, k) => {
          const frame = fig.querySelector<HTMLElement>(".team-photo__frame")!;
          const img = frame.querySelector("img");
          const cap = fig.querySelector("figcaption");
          // до завантаження — прозорість (не маска: замаскований lazy-img браузер не вантажить),
          // потім шторка зліва направо, лише коли фото готове
          gsap.set(frame, { opacity: 0 });
          if (cap) gsap.set(cap, { opacity: 0, y: 16 });
          const reveal = context.add(`team${k}`, () => {
            gsap.fromTo(
              frame,
              { opacity: 1, clipPath: "inset(0% 100% 0% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "quill" },
            );
            gsap.fromTo(img, { scale: 1.15 }, { scale: 1, duration: 2, ease: "paper" });
            if (cap) gsap.to(cap, { opacity: 1, y: 0, duration: 1, delay: 0.5 });
          });
          ScrollTrigger.create({
            trigger: fig,
            start: "top 88%",
            once: true,
            onEnter: () => void imageReady(img).then(() => !dead && reveal()),
          });
        });
        return () => {
          dead = true;
        };
      });

      mm.add(MQ.desktop, () => {
        q(".team-photo").forEach((fig) => {
          const sp = Number((fig as HTMLElement).dataset.speed ?? 0);
          if (!sp) return;
          gsap.fromTo(
            fig,
            { yPercent: sp / 2 },
            { yPercent: -sp / 2, ease: "none", scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
      });
    },
  );

  return (
    <section ref={root} id="komanda" aria-labelledby="team-title" className="section page-x">
      <SectionHead n={10} id="team-title" title={content.team.title} className="team-title" />

      <div className="team-grid">
        {team.map((m, i) => {
          const names = m.people.map((p) => p.name).join(", ");
          return (
            <figure key={m.src} className={`team-photo team-photo--${i + 1}`} data-speed={speeds[i]}>
              <div className="team-photo__frame" data-cursor={m.people.length ? m.people[0].name : undefined}>
                <Photo
                  src={m.src}
                  alt={m.alt}
                  fill
                  sizes={i === 0 ? "(min-width: 1024px) 60vw, 92vw" : "(min-width: 1024px) 30vw, 92vw"}
                  className="object-cover"
                />
              </div>
              {m.people.length > 0 && (
                <figcaption className="team-photo__cap">
                  <span className="t-mono text-ink-2">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    {m.people.map((p, k) => (
                      <span key={k} className="block">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-ink-2"> · {p.role}</span>
                      </span>
                    ))}
                  </span>
                  <span className="sr-only">{names}</span>
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </section>
  );
}
