"use client";

import { useRef } from "react";
import { useFx } from "@/lib/fx";
import { MQ } from "@/lib/motion";
import { content } from "@/content/uk";
import { SectionHead } from "@/components/ui/SectionHead";
import { supportIcons } from "@/components/ui/Icons";
import { SupportChart } from "./SupportChart";

/**
 * Податковий супровід: ліворуч «жива» схема (4 стани), праворуч пункти.
 * Десктоп — стан перемикається активним пунктом при прокрутці; мобільний — схема гортає стани сама.
 */
export function Support() {
  const root = useRef<HTMLElement>(null);
  const s = content.support;

  useFx(root, ({ gsap, ScrollTrigger }) => {
    const q = gsap.utils.selector(root);
    const card = q(".lc")[0] as HTMLElement;
    const groups = q(".lc-group");
    const num = card.querySelector<HTMLElement>("[data-lc-num]")!;
    const reduced = window.matchMedia(MQ.reduced).matches;

    // ── вступні таймлайни кожного стану (кінцеві значення = серверна розмітка) ──
    const build = (i: number) => {
      const g = groups[i];
      const sel = (x: string) => [...g.querySelectorAll(x)];
      const tl = gsap.timeline({ paused: true, defaults: { ease: "paper" } });
      if (i === 0) {
        tl.fromTo(sel(".lc-grid, .lc-axis"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.8, ease: "quill" }, 0)
          .fromTo(
            sel(".lc-seg"),
            { scaleY: 0, transformOrigin: "50% 100%" },
            { scaleY: 1, duration: 0.55, stagger: 0.16, ease: "power3.out" },
            0.15,
          )
          .fromTo(sel(".lc-link"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.6 }, 0.95)
          .fromTo(sel(".lc-delta"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.6, ease: "quill" }, 1.1)
          .fromTo(sel("text"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.3);
      }
      if (i === 1) {
        const cells = sel(".lc-cell");
        const dots = sel(".lc-dot") as SVGCircleElement[];
        tl.fromTo(
          cells,
          { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" },
          { opacity: 1, scale: 1, duration: 0.5, stagger: { each: 0.018, from: "end" } },
          0,
        )
          .fromTo(sel(".lc-axis, .lc-arrow"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.7, ease: "quill" }, 0.1)
          .fromTo(sel("text"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.3)
          .fromTo(sel(".lc-ghost"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.3, stagger: 0.06 }, 0.45);
        dots.forEach((d, k) => {
          const { fx, fy, tx, ty } = d.dataset;
          tl.fromTo(
            d,
            { attr: { cx: Number(fx), cy: Number(fy) }, scale: 0, transformOrigin: "50% 50%", fill: "#141210" },
            { scale: 1, duration: 0.35, ease: "back.out(3)", immediateRender: true },
            0.45 + k * 0.06,
          ).to(d, { attr: { cx: Number(tx), cy: Number(ty) }, fill: "#1F4D3A", duration: 1.1, ease: "power3.inOut" }, 1.05 + k * 0.09);
        });
        tl.fromTo(sel(".lc-trail"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.1, stagger: 0.09, ease: "power3.inOut" }, 1.05);
      }
      if (i === 2) {
        const crits = sel(".lc-crit");
        tl.fromTo(sel(".lc-spine"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.9, ease: "quill" }, 0);
        crits.forEach((cg, k) => {
          const t = 0.15 + k * 0.22;
          tl.fromTo(cg.querySelector("text"), { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.5 }, t)
            .fromTo(
              cg.querySelector(".lc-node"),
              { fill: "#ECE7DE", stroke: "#141210" },
              { fill: "#1F4D3A", stroke: "#1F4D3A", duration: 0.3 },
              t + 0.25,
            )
            .fromTo(cg.querySelector(".lc-node-tick"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.3 }, t + 0.32);
        });
        tl.fromTo(sel(".lc-branch:not(.lc-branch--hit)"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.5, stagger: 0.06 }, 1.05)
          .fromTo(sel(".lc-leaf:not(.lc-leaf--hit)"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, 1.2)
          .fromTo(sel(".lc-branch--hit"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.8, ease: "quill" }, 1.45)
          .fromTo(sel(".lc-leaf--hit"), { opacity: 0, scale: 0.8, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)" }, 2.0)
          .fromTo(sel(".lc-hit-tick"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.45 }, 2.3);
      }
      if (i === 3) {
        tl.fromTo(sel(".lc-grid, .lc-axis"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.8, ease: "quill" }, 0)
          .fromTo(sel(".lc-line--base"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.1, ease: "none" }, 0.2)
          .fromTo(sel(".lc-marker"), { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.6 }, 0.35)
          .fromTo(sel(".lc-line:not(.lc-line--base)"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.4, ease: "power2.inOut" }, 0.45)
          .fromTo(sel(".lc-area"), { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.1)
          .fromTo(sel(".lc-pt:not(.lc-pt--end)"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.3, stagger: 0.12, ease: "back.out(3)" }, 0.55)
          .fromTo(sel(".lc-pt--end"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.5, ease: "back.out(4)" }, 1.8)
          .fromTo(sel(".lc-chip"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, 1.95)
          .fromTo(sel("text"), { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.06 }, 0.3);
      }
      return tl;
    };

    const tls = groups.map((_, i) => build(i));
    // reduced motion: усі стани одразу у фінальному вигляді, перемикання — без анімації
    if (reduced) tls.forEach((t) => t.progress(1));
    let active = -1;
    const show = (i: number) => {
      if (i === active) return;
      tls[active]?.pause();
      active = i;
      card.dataset.active = String(i);
      num.textContent = String(i + 1);
      if (reduced) tls[i].progress(1);
      else tls[i].restart();
    };

    // пункти праворуч: маркер активного пункту, іконки прокреслюються
    const items = q(".sup-item");
    items.forEach((item) => {
      const paths = item.querySelectorAll("[data-draw]");
      if (!reduced) gsap.set(paths, { drawSVG: "0%" });
      ScrollTrigger.create({
        trigger: item,
        start: "top 62%",
        end: "bottom 38%",
        onToggle: (self) => item.classList.toggle("is-active", self.isActive),
        once: false,
        onEnter: () => !reduced && gsap.to(paths, { drawSVG: "100%", duration: 1.2, stagger: 0.08, ease: "power2.out", overwrite: true }),
      });
    });

    // кожен стан стартує, лише коли схема в полі зору
    let inView = false;
    let pending = 0;
    const watch = (trigger: Element) =>
      ScrollTrigger.create({
        trigger,
        start: "top 85%",
        end: "bottom 15%",
        onToggle: (self) => {
          inView = self.isActive;
          if (inView) show(pending);
        },
      });

    const mm = gsap.matchMedia();
    // десктоп: схема «прилипає», тому видимість рахуємо по всій сітці; стан = активний пункт
    mm.add("(min-width: 1024px)", () => {
      const view = watch(q(".sup-grid")[0]);
      const sts = items.map((item, i) =>
        ScrollTrigger.create({
          trigger: item,
          start: "top 62%",
          end: "bottom 38%",
          onToggle: (self) => {
            if (!self.isActive) return;
            pending = i;
            if (inView) show(i);
          },
        }),
      );
      return () => {
        view.kill();
        sts.forEach((t) => t.kill());
      };
    });
    // мобільний: автоперегортання станів, поки схема на екрані
    mm.add("(max-width: 1023px)", () => {
      const view = watch(card);
      return () => view.kill();
    });
    mm.add(MQ.mobile, () => {
      const timer = window.setInterval(() => {
        if (!inView || document.hidden) return;
        pending = (active + 1) % groups.length;
        show(pending);
      }, 4200);
      return () => window.clearInterval(timer);
    });
  });

  return (
    <section ref={root} id="suprovid" aria-labelledby="support-title" className="section page-x">
      <SectionHead n={4} id="support-title" title={s.title} className="sup-title" />
      <div className="sup-grid">
        <div className="sup-aside">
          <div className="sup-aside__sticky">
            <SupportChart />
          </div>
        </div>

        <div className="sup-list">
          {s.items.map((it) => {
            const Icon = supportIcons[it.icon as keyof typeof supportIcons];
            return (
              <article key={it.title} className="sup-item">
                <div className="sup-item__icon" aria-hidden>
                  <Icon size={64} />
                </div>
                <h3 className="sup-item__title t-display">{it.title}</h3>
                <p className="sup-item__text">{it.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
