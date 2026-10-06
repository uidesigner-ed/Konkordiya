"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, type RefObject } from "react";
import { sections, content } from "@/content/uk";
import { site } from "@/config/site";
import { getLenis, scrollToTarget } from "@/lib/lenis";
import { Logo } from "@/components/ui/LogoMark";
import { SocialLinks } from "@/components/ui/SocialLinks";

const EASE_PANEL = [0.76, 0, 0.24, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Повноекранне меню: аркуш відгортається зверху, розділи — як зміст книги. */
export function Menu({
  open,
  onClose,
  returnFocus,
}: {
  open: boolean;
  onClose: () => void;
  returnFocus: RefObject<HTMLButtonElement | null>;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      document.documentElement.classList.add("menu-open");
      const t = setTimeout(() => closeBtn.current?.focus(), 50);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        if (e.key === "Tab" && panel.current) {
          const f = panel.current.querySelectorAll<HTMLElement>("a, button");
          const first = f[0];
          const last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      window.addEventListener("keydown", onKey);
      return () => {
        clearTimeout(t);
        window.removeEventListener("keydown", onKey);
      };
    }
    lenis?.start();
    document.documentElement.classList.remove("menu-open");
  }, [open, onClose]);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onClose();
    returnFocus.current?.blur();
    setTimeout(() => scrollToTarget(`#${id}`), 520);
  };

  return (
    <AnimatePresence onExitComplete={() => returnFocus.current?.focus({ preventScroll: true })}>
      {open && (
        <m.div
          ref={panel}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label={content.ui.menu}
          className="menu"
          data-cursor-dark
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.8, ease: EASE_PANEL }}
        >
          <div className="menu__top">
            <Logo tone="paper" />
            <button ref={closeBtn} type="button" className="menu-toggle menu-toggle--close" onClick={onClose}>
              <span className="menu-toggle__text">{content.ui.close}</span>
              <span className="menu-toggle__lines" aria-hidden>
                <span />
                <span />
              </span>
            </button>
          </div>

          <nav aria-label="Розділи сайту" className="menu__nav">
            <ol className="menu__list">
              {sections.map((s, i) => (
                <li key={s.id} className="menu__item">
                  <m.a
                    href={`#${s.id}`}
                    onClick={(e) => go(e, s.id)}
                    className="menu__link"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "-110%", transition: { duration: 0.4, ease: EASE_PANEL } }}
                    transition={{ delay: 0.28 + i * 0.035, duration: 0.9, ease: EASE_OUT }}
                  >
                    <span className="menu__num t-mono">{String(i + 1).padStart(2, "0")}</span>
                    <span className="menu__label">{s.label}</span>
                  </m.a>
                </li>
              ))}
            </ol>
          </nav>

          <m.div
            className="menu__aside"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.8, ease: EASE_OUT } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <a href={site.phone.href} className="t-mono menu__contact link-line">
              {site.phone.display}
            </a>
            <a href={`mailto:${site.email}`} className="menu__contact link-line">
              {site.email}
            </a>
            <a href={site.address.mapUrl} target="_blank" rel="noopener noreferrer" className="menu__contact link-line">
              {site.address.display}
            </a>
            <SocialLinks className="flex -ml-2.5 mt-2" size={24} />
            <p className="menu__slogan">{content.footer.slogan}</p>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
