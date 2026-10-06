"use client";

import { useEffect, useRef } from "react";
import { useFx } from "@/lib/fx";
import { MQ } from "@/lib/motion";
import { content, nav } from "@/content/uk";
import { site } from "@/config/site";
import { SocialLinks } from "@/components/ui/SocialLinks";

/** Футер: слоган, навігація та величезний «КОНКОРДІЯ», що підводиться з-під лінії. */
export function Footer() {
  const root = useRef<HTMLElement>(null);
  const word = useRef<HTMLParagraphElement>(null);
  const f = content.footer;

  // Підганяємо кегль, щоб слово займало всю ширину
  useEffect(() => {
    const el = word.current;
    if (!el) return;
    const fit = () => {
      const parent = el.parentElement!;
      el.style.fontSize = "100px";
      const w = el.scrollWidth;
      const target = parent.clientWidth;
      el.style.fontSize = `${(100 * target) / w}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el.parentElement!);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, []);

  useFx(
    root,
    ({ gsap }) => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(q(".footer-word__ch"), {
          yPercent: 102,
          duration: 1.3,
          stagger: 0.05,
          ease: "paper",
          scrollTrigger: { trigger: word.current, start: "top 98%", once: true },
        });
        gsap.from(q(".footer-word__rule"), {
          scaleX: 0,
          duration: 1.6,
          ease: "quill",
          scrollTrigger: { trigger: word.current, start: "top 100%", once: true },
        });
      });
    },
  );

  return (
    <footer ref={root} className="site-footer page-x">
      <div className="footer-top">
        <p className="footer-slogan t-display">
          {f.slogan.replace(/!$/, "")}
          <span className="text-red">!</span>
        </p>
        <nav aria-label="Навігація у футері" className="footer-nav">
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="link-line">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <ul>
            <li>
              <a href={site.phone.href} className="link-line t-mono">
                {site.phone.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="link-line">
                {site.email}
              </a>
            </li>
            <li>
              <a href={site.address.mapUrl} target="_blank" rel="noopener noreferrer" className="link-line">
                {site.address.display}
              </a>
            </li>
          </ul>
          <SocialLinks className="flex -ml-2.5" size={22} />
        </nav>
      </div>

      <div className="footer-word-wrap">
        <p ref={word} className="footer-word t-display">
          <span className="sr-only">{site.name}</span>
          {f.wordmark.split("").map((ch, i) => (
            <span key={i} className="footer-word__mask" aria-hidden>
              <span className="footer-word__ch">{ch}</span>
            </span>
          ))}
        </p>
        <span className="footer-word__rule" aria-hidden />
      </div>

      <div className="footer-bottom">
        <p>{f.copyright}</p>
        <a href={site.privacyUrl} target="_blank" rel="noopener" className="link-line">
          {f.privacy}
        </a>
        <a href="#top" className="link-line">
          {f.toTop}
        </a>
      </div>
    </footer>
  );
}
