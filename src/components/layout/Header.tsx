"use client";

import { useEffect, useRef, useState } from "react";
import { onIntroDone, prefersReducedMotion } from "@/lib/motion";
import { nav, content } from "@/content/uk";
import { site } from "@/config/site";
import { Logo } from "@/components/ui/LogoMark";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { IconPhone } from "@/components/ui/Icons";
import { Menu } from "./Menu";

export function Header() {
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
          <a href="#top" className="site-header__logo" aria-label={`${site.name} — на початок сторінки`}>
            <Logo />
          </a>

          <nav aria-label="Основна навігація" className="site-header__nav">
            <ul className="flex items-center gap-8 xl:gap-10">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="link-line text-[15px]">
                    {n.label}
                  </a>
                </li>
              ))}
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
      <Menu open={open} onClose={() => setOpen(false)} returnFocus={menuBtn} />
    </>
  );
}
