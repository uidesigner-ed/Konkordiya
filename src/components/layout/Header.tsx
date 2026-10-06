"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { onIntroDone, prefersReducedMotion } from "@/lib/motion";
import { nav, navHref, content } from "@/content/uk";
import { site } from "@/config/site";
import { Logo } from "@/components/ui/LogoMark";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { IconPhone } from "@/components/ui/Icons";
import { Menu } from "./Menu";

/** base: "" — головна (якорі секцій), "/" — внутрішні сторінки (посилання на /#секція) */
export function Header({ base = "" }: { base?: string }) {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 240);
        last = y;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return onIntroDone(() => {
      el.style.opacity = "1";
      if (prefersReducedMotion()) return;
      el.animate([{ transform: "translateY(-100%)" }, { transform: "translateY(0)" }], {
        duration: 1100,
        delay: 500,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "backwards",
      });
    });
  }, []);

  return (
    <>
      <header
        ref={ref}
        data-intro="fade"
        className="site-header"
        data-hidden={hidden && !open}
        data-scrolled={scrolled}
      >
        <div className="site-header__inner">
          <a
            href={base ? "/" : "#top"}
            className="site-header__logo"
            aria-label={base ? `${site.name} — на головну` : `${site.name} — на початок сторінки`}
          >
            <Logo />
          </a>

          <nav aria-label="Основна навігація" className="site-header__nav">
            <ul className="flex items-center gap-6 xl:gap-10">
              {nav.map((n) => {
                const current = !n.href.startsWith("#") && pathname.startsWith(n.href);
                const props = {
                  className: "link-line text-[15px]",
                  "aria-current": current ? ("page" as const) : undefined,
                };
                return (
                  <li key={n.href}>
                    {/* Усередині розділу — клієнтський перехід; між головною та розділом — повне завантаження */}
                    {base && !n.href.startsWith("#") ? (
                      <Link href={n.href} {...props}>
                        {n.label}
                      </Link>
                    ) : (
                      <a href={navHref(n.href, base)} {...props}>
                        {n.label}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3 md:gap-5 xl:gap-7">
            <a href={site.phone.href} className="site-header__phone t-mono link-line">
              {site.phone.display}
            </a>
            <SocialLinks className="hidden xl:flex" size={20} />
            <a href={site.phone.href} className="call-btn" aria-label={`Зателефонувати: ${site.phone.display}`}>
              <IconPhone size={20} />
            </a>
            <button
              ref={menuBtn}
              type="button"
              className="menu-toggle"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen(true)}
            >
              <span className="menu-toggle__text">{content.ui.menu}</span>
              <span className="menu-toggle__lines" aria-hidden>
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>
      <Menu open={open} onClose={() => setOpen(false)} returnFocus={menuBtn} base={base} />
    </>
  );
}
