"use client";

import { useRef } from "react";
import { useFx } from "@/lib/fx";
import { MQ } from "@/lib/motion";
import { content } from "@/content/uk";
import { SectionHead } from "@/components/ui/SectionHead";
import { stageIcons } from "@/components/ui/Icons";

/** Етапи співпраці — горизонтальна стрічка з «проводкою», що прокреслюється крізь усі аркуші. */
export function Stages() {
  const root = useRef<HTMLElement>(null);
  const s = content.stages;

  useFx(
    root,
    ({ gsap, ScrollTrigger }) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        const track = q(".stages__track")[0] as HTMLElement;
        const distance = () => track.scrollWidth - window.innerWidth;
        const counter = q(".stages__current")[0] as HTMLElement;

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: q(".stages__pin")[0],
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              const n = Math.min(s.items.length, Math.floor(self.progress * s.items.length * 0.999) + 1);
              const txt = String(n).padStart(2, "0");
              if (counter.textContent !== txt) counter.textContent = txt;
            },
          },
        });

        gsap.fromTo(
          q(".stages__line-fill"),
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { trigger: q(".stages__pin")[0], start: "top top", end: () => `+=${distance()}`, scrub: 1 } },
        );

        // Ілюстрації прокреслюються в такт прокрутці (scrub), а не одноразово:
        // перші панелі вже в кадрі на старті стрічки — їх малюємо, поки секція заїжджає на екран,
        // решту — коли вони виїжджають справа під час горизонтального скролу.
        const vw = window.innerWidth;
        q(".stage").forEach((panel, i) => {
          const el = panel as HTMLElement;
          const paths = el.querySelectorAll("[data-draw]");
          const draw = gsap
            .timeline({ defaults: { ease: "none" } })
            .fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1, stagger: 0.14 }, 0)
            .fromTo(el.querySelector(".stage__node"), { scale: 0 }, { scale: 1, duration: 0.3, ease: "back.out(3)" }, 0.1);
          const inFrameAtStart = el.offsetLeft < vw * 0.9;
          ScrollTrigger.create({
            animation: draw,
            scrub: 0.8,
            ...(inFrameAtStart
              ? // ілюстрація ~380px нижче верху секції: вікно — коли вона вже видима, до початку піну
                { trigger: root.current, start: `top ${56 - i * 10}%`, end: `top ${i ? -12 : -2}%` }
              : { trigger: el, containerAnimation: tween, start: "left 95%", end: "left 35%" }),
            onUpdate: (self) => el.classList.toggle("is-in", self.progress > 0.6),
          });
          gsap.fromTo(
            el.querySelector(".stage__num"),
            { xPercent: 30 },
            { xPercent: -30, ease: "none", scrollTrigger: { trigger: el, containerAnimation: tween, start: "left right", end: "right left", scrub: true } },
          );
        });
      });

      mm.add(MQ.mobile, () => {
        gsap.fromTo(
          q(".stages__line-fill"),
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: q(".stages__track")[0], start: "top 70%", end: "bottom 70%", scrub: true } },
        );
        q(".stage").forEach((panel) => {
          const el = panel as HTMLElement;
          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                end: "top 38%",
                scrub: 0.8,
                onUpdate: (self) => el.classList.toggle("is-in", self.progress > 0.6),
              },
            })
            .fromTo(el.querySelectorAll("[data-draw]"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 1, stagger: 0.14 });
        });
      });
    },
  );

  return (
    <section ref={root} id="etapy" aria-labelledby="stages-title" className="stages">
      <div className="stages__pin">
        <div className="stages__head page-x">
          <SectionHead n={8} id="stages-title" title={s.title} />
          <p className="stages__progress t-mono" aria-hidden>
            <span className="stages__current">01</span>
            <span className="text-ink-2">/{String(s.items.length).padStart(2, "0")}</span>
            <span className="stages__hint">{s.hint}</span>
          </p>
        </div>

        <ol className="stages__track">
          <li className="stages__line" aria-hidden>
            <span className="stages__line-fill" />
          </li>
          {s.items.map((title, i) => {
            const Art = stageIcons[i];
            return (
              <li key={title} className="stage">
                <span className="stage__num t-display" aria-hidden>
                  {i + 1}
                </span>
                <span className="stage__node" aria-hidden />
                <div className="stage__art" aria-hidden>
                  <Art />
                </div>
                <h3 className="stage__title t-display">
                  <span className="sr-only">Етап {i + 1}. </span>
                  {title}
                </h3>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
