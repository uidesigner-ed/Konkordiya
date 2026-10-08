"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { imageReady } from "@/lib/image";
import { useEffect, useRef, useState } from "react";
import { useFx } from "@/lib/fx";
import { MQ, onIntroDone } from "@/lib/motion";
import { content } from "@/content/uk";
import { site, stats } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";

const DigitField = dynamic(() => import("@/components/webgl/DigitField"), { ssr: false });

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Слова в масках — розмітка з сервера, щоб текст малювався вже на першому кадрі */
function Words({ text }: { text: string }) {
  const parts = text.split(" ");
  return (
    <>
      {parts.map((w, i) => (
        <span key={i}>
          <span className="hero__w-mask">
            <span className="hero__w">{w}</span>
          </span>
          {i < parts.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const [field, setField] = useState(false);
  const h = content.hero;

  // Перший екран — «обкладинка» книги: поле з червоною лінією з'являється, коли відгортаємо її
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const html = document.documentElement;
    const io = new IntersectionObserver(([e]) => html.classList.toggle("on-cover", e.isIntersecting), {
      rootMargin: "0px 0px -55% 0px",
    });
    io.observe(el);
    return () => {
      io.disconnect();
      html.classList.remove("on-cover");
    };
  }, []);

  // WebGL — декоративний шар: вантажимо після інтро, при першій взаємодії або коли браузер вільний
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const events = ["pointermove", "pointerdown", "touchstart", "wheel", "keydown", "scroll"] as const;
    const go = () => {
      cleanup();
      if ("requestIdleCallback" in window) requestIdleCallback(() => setField(true), { timeout: 600 });
      else setField(true);
    };
    const cleanup = () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, go));
    };
    const off = onIntroDone(() => {
      if (!supportsWebGL()) return;
      events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
      timer = setTimeout(go, 4500);
    });
    return () => {
      off();
      cleanup();
    };
  }, []);

  useFx(
    root,
    ({ gsap, ScrollTrigger, SplitText }) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, (context) => {
        const splits: SplitText[] = [];
        const chars = q(".hero__ch");
        const words = q(".hero__w");
        const sub = SplitText.create(q(".hero__sub"), { type: "lines", mask: "lines", linesClass: "split-line", aria: "none" });
        splits.push(sub);

        // Повторний візит без прелоадера: заголовок уже на екрані — не ховаємо його вдруге
        const animateTitle = !document.documentElement.classList.contains("visited");
        if (animateTitle) {
          gsap.set(chars, { yPercent: 105 });
          gsap.set(words, { yPercent: 110 });
        }
        gsap.set(sub.lines, { yPercent: 105 });
        gsap.set(q("[data-hero-rule]"), { scaleX: 0 });
        gsap.set(q(".hero__cta, .hero__stat"), { clipPath: "inset(0% 0% 100% 0%)", y: 28 });

        // Таймлайн створюється пізніше (після прелоадера), але реєструється в контексті,
        // щоб коректно відкочуватись при ремаунті/зміні медіа-запиту
        // Портрет з'являється лише повністю завантаженим (жодної «прогрузки» по рядках)
        const portrait = q(".hero__portrait")[0] as HTMLElement;
        const revealPortrait = context.add("heroPortrait", () => {
          // «двері» від центру назовні — ціла картинка, жодної асоціації з прогрузкою знизу вгору
          const cp = getComputedStyle(portrait).clipPath;
          if (cp === "none" || cp === "inset(0px)") return; // аварійний показ уже спрацював
          gsap.fromTo(
            portrait,
            { clipPath: "inset(0% 50% 0% 50%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.5,
              ease: "quill",
              // фіксуємо відкритий стан поверх CSS-маски «до завантаження»
              onComplete: () => void (portrait.style.clipPath = "none"),
            },
          );
          gsap.fromTo(portrait.querySelector("img"), { scale: 1.08, yPercent: 3 }, { scale: 1, yPercent: 0, duration: 2.2, ease: "paper" });
        });
        let dead = false;
        const play = context.add("heroIntro", () => {
          imageReady(portrait.querySelector("img")).then(() => !dead && revealPortrait());
          const tl = gsap.timeline({ defaults: { ease: "paper" } });
          if (animateTitle) {
            tl.to(chars, { yPercent: 0, duration: 1.35, stagger: 0.035 }, 0).to(
              words,
              { yPercent: 0, duration: 1.2, stagger: 0.07 },
              0.18,
            );
          }
          tl.to(sub.lines, { yPercent: 0, duration: 1.1, stagger: 0.08 }, 0.55)
            .to(q(".hero__cta"), { y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 1, clearProps: "clipPath" }, 0.7)
            .to(q("[data-hero-rule]"), { scaleX: 1, duration: 1.4, stagger: 0.1, ease: "quill" }, 0.6)
            .to(q(".hero__stat"), { y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 1, stagger: 0.08, clearProps: "clipPath" }, 0.8);
        });
        const off = onIntroDone(() => play());

        return () => {
          dead = true;
          off();
          splits.forEach((s) => s.revert());
          gsap.set([...chars, ...words], { clearProps: "transform" });
        };
      });

      // Паралакс при виході з hero
      mm.add(MQ.desktop, () => {
        const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
        // портрет «опускається» за край обкладинки (низ обрізаний overflow) — нижній зріз фото ніколи не видно
        gsap.to(q(".hero__portrait"), { yPercent: 9, ease: "none", scrollTrigger: st });
        gsap.to(q(".hero__line--1"), { xPercent: -6, ease: "none", scrollTrigger: st });
        gsap.to(q(".hero__field"), { yPercent: 18, opacity: 0.4, ease: "none", scrollTrigger: st });
      });

      mm.add(MQ.reduced, () => {
        gsap.set(q("[data-intro]"), { opacity: 1, clipPath: "none" });
      });

      return () => ScrollTrigger.refresh();
    },
  );

  return (
    <section
      ref={root}
      id="top"
      aria-labelledby="hero-title"
      className="hero page-x"
    >
      <div className="hero__field" aria-hidden>
        {field && <DigitField focusX={0.6} />}
      </div>

      {/* Поки фото вантажиться — сховане маскою (не opacity: так воно не стає «пізнім» LCP) */}
      <div className="hero__portrait" data-intro="curtain">
        <Image
          src="/images/yevheniia-portrait.webp"
          alt={h.portraitAlt}
          fill
          // у реальному Chrome портрет — LCP-елемент: вантажимо одразу (маска лише ховає до готовності)
          loading="eager"
          sizes="(min-width: 1024px) 42vw, 100vw"
          className="object-contain object-bottom"
        />
      </div>

      <h1 id="hero-title" className="hero__title t-display" aria-label={`${h.eyebrow}. ${h.title.plain}`}>
        <span className="hero__eyebrow" aria-hidden>
          {h.eyebrow}
        </span>
        {/* Символи першого рядка рендеряться на сервері: вони малюються вже на FCP (LCP не «переїжджає» на інтро) */}
        <span className="hero__line hero__line--1" aria-hidden>
          {Array.from("Бухгалтерські").map((ch, i) => (
            <span key={i} className="hero__ch-mask">
              <span className="hero__ch">{ch}</span>
            </span>
          ))}
        </span>
        <span className="hero__line hero__line--2" aria-hidden>
          <Words text="рішення для бізнесу" />
        </span>
        <span className="hero__line hero__line--3" aria-hidden>
          <Words text="від Євгенії Турковської" />
        </span>
      </h1>

      <div className="hero__aside">
        <p className="hero__sub t-lead">{h.subtitle}</p>
        <div className="hero__cta">
          <Button href={site.consultUrl} cursor={content.ui.write} size="lg">
            {h.cta}
          </Button>
        </div>
      </div>

      <dl className="hero__stats">
        {h.stats.map((s) => {
          const v = stats[s.key as keyof typeof stats];
          return (
            <div key={s.key} className="hero__stat">
              <span data-hero-rule className="hero__stat-rule" aria-hidden />
              <dt className="hero__stat-label">
                <span className="font-medium text-ink">{s.label}</span>
                <span className="text-ink-2"> — {s.note}</span>
              </dt>
              <dd className="hero__stat-value t-mono">
                <Counter value={v.value} suffix={v.suffix} afterIntro className="total" />
              </dd>
            </div>
          );
        })}
      </dl>

    </section>
  );
}
