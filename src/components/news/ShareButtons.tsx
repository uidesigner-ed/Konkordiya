"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { newsUi } from "@/content/news";
import { IconFacebook, IconLink, IconLinkedIn, IconShare, IconTelegram } from "@/components/ui/Icons";

/** Поділитися: месенджери, копіювання посилання з підтвердженням, системне меню на телефоні */
export function ShareButtons({ url, title, className = "" }: { url: string; title: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const [native, setNative] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- можливість відома лише в браузері
    setNative(typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches);
    return () => clearTimeout(timer.current);
  }, []);

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}`, Icon: IconTelegram },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: IconFacebook },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: IconLinkedIn },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className={`share ${className}`}>
      <p className="share__title">{newsUi.share}</p>
      <ul className="share__list">
        {native && (
          <li>
            <button
              type="button"
              className="share__btn"
              aria-label={newsUi.share}
              onClick={() => navigator.share({ url, title }).catch(() => {})}
            >
              <IconShare size={20} />
            </button>
          </li>
        )}
        {links.map(({ label, href, Icon }) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noopener noreferrer" className="share__btn" aria-label={`${newsUi.share}: ${label}`}>
              <Icon size={20} />
            </a>
          </li>
        ))}
        <li className="relative">
          <button type="button" className="share__btn" aria-label={newsUi.copy} onClick={copy} data-copied={copied}>
            <IconLink size={20} />
          </button>
          <AnimatePresence>
            {copied && (
              <m.span
                className="share__toast"
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {newsUi.copied}
              </m.span>
            )}
          </AnimatePresence>
          <span className="sr-only" aria-live="polite">
            {copied ? newsUi.copied : ""}
          </span>
        </li>
      </ul>
    </div>
  );
}
