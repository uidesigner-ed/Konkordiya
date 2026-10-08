"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { linkEvent, track } from "@/lib/track";

/**
 * Аналітика й теги клієнта:
 *  • Google tag (GA4) та/або Google Tag Manager — із Consent Mode v2 (до згоди — без cookies);
 *  • Meta Pixel — лише після згоди;
 *  • довільний код клієнта (head / body) — одразу або після згоди (налаштування в адмінці);
 *  • відстеження натискань на телефон, месенджери, пошту (lib/track.ts).
 * Скрипти підвантажуються після завантаження сторінки, щоб не гальмувати перший екран.
 */

type Consent = "granted" | "denied";
const KEY = "konk-consent";
const EVENT = "konk:consent";
/** Подія «відкрити вибір cookies» (футер надсилає її без імпорту цього модуля) */
export const OPEN = "konk:consent-open";

function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};

function whenIdle(fn: () => void) {
  const run = () =>
    typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback(fn, { timeout: 3000 })
      : window.setTimeout(fn, 1200);
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
}

function addScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

const GRANTED = { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted" };
const DENIED = { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" };

function initGoogle(ga4Id: string, gtmId: string, granted: boolean) {
  if (!ga4Id && !gtmId) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params -- gtag очікує саме arguments
    window.dataLayer!.push(arguments);
  };
  window.gtag("consent", "default", { ...DENIED, wait_for_update: 500 });
  if (granted) window.gtag("consent", "update", GRANTED);
  if (ga4Id) {
    window.gtag("js", new Date());
    window.gtag("config", ga4Id);
  }
  whenIdle(() => {
    if (ga4Id) addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`);
    if (gtmId) {
      window.dataLayer!.push({ "gtm.start": Date.now(), event: "gtm.js" });
      addScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`);
    }
  });
}

function loadPixel(pixelId: string) {
  if (!pixelId || window.fbq) return;
  const fbq = function (...args: unknown[]) {
    const f = fbq as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[] };
    if (f.callMethod) f.callMethod(...args);
    else f.queue.push(args);
  } as NonNullable<Window["fbq"]> & { queue: unknown[]; push: unknown; loaded: boolean; version: string };
  fbq.queue = [];
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  (window as unknown as { _fbq: unknown })._fbq = fbq;
  addScript("https://connect.facebook.net/en_US/fbevents.js");
  fbq("init", pixelId);
  fbq("track", "PageView");
}

/** Вставка HTML-коду з виконанням <script> (createContextualFragment, на відміну від innerHTML, їх запускає) */
function injectHtml(html: string, where: "head" | "body") {
  if (!html.trim()) return;
  const target = where === "head" ? document.head : document.body;
  const range = document.createRange();
  range.selectNode(target);
  const frag = range.createContextualFragment(html);
  if (where === "head") target.appendChild(frag);
  else target.insertBefore(frag, target.firstChild);
}

export function SiteTracking({
  ga4Id,
  gtmId,
  pixelId,
  customHead,
  customBody,
  customConsent,
  privacyUrl,
}: {
  ga4Id: string;
  gtmId: string;
  pixelId: string;
  customHead: string;
  customBody: string;
  customConsent: boolean;
  privacyUrl: string;
}) {
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribe, readConsent, () => "unknown" as const);
  const [reopened, setReopened] = useState(false);
  const started = useRef({ google: false, pixel: false, custom: false });
  const firstPath = useRef(pathname);

  const hasCustom = !!(customHead.trim() || customBody.trim());
  const needsConsent = !!(ga4Id || gtmId || pixelId || (hasCustom && customConsent));

  // Google — одразу (у режимі «відмова» до згоди); Pixel і теги з вимогою згоди — після неї
  useEffect(() => {
    if (consent === "unknown") return;
    const st = started.current;
    if (!st.google) {
      st.google = true;
      initGoogle(ga4Id, gtmId, consent === "granted");
    } else if (window.gtag) {
      window.gtag("consent", "update", consent === "granted" ? GRANTED : DENIED);
    }
    if (consent === "granted" && !st.pixel && pixelId) {
      st.pixel = true;
      whenIdle(() => loadPixel(pixelId));
    }
    if (consent === "denied") window.fbq?.("consent", "revoke");
    if (!st.custom && hasCustom && (!customConsent || consent === "granted")) {
      st.custom = true;
      whenIdle(() => {
        injectHtml(customHead, "head");
        injectHtml(customBody, "body");
      });
    }
  }, [consent, ga4Id, gtmId, pixelId, customHead, customBody, customConsent, hasCustom]);

  // Перегляд сторінки для Pixel при клієнтських переходах (GA4 рахує їх сам — «розширені вимірювання»)
  useEffect(() => {
    if (pathname === firstPath.current) return;
    firstPath.current = pathname;
    window.fbq?.("track", "PageView");
  }, [pathname]);

  // Мітки джерела (utm, gclid, fbclid) першого входу — для заявок
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const utm = Object.fromEntries([...q].filter(([k]) => /^(utm_\w+|gclid|fbclid)$/.test(k)));
      if (Object.keys(utm).length && !sessionStorage.getItem("konk-utm")) sessionStorage.setItem("konk-utm", JSON.stringify(utm));
    } catch {}
  }, []);

  // Кліки по телефону, месенджерах, пошті
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a) return;
      const ev = linkEvent(a.getAttribute("href") ?? "");
      if (!ev) return;
      track(ev.event, { ...ev.params, link_location: a.closest("[data-track-zone]")?.getAttribute("data-track-zone") ?? pathname }, ev.meta);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  // Посилання «Налаштування cookies» у футері
  useEffect(() => {
    document.documentElement.toggleAttribute("data-tracking", needsConsent);
    const open = () => setReopened(true);
    window.addEventListener(OPEN, open);
    return () => window.removeEventListener(OPEN, open);
  }, [needsConsent]);

  const decide = (v: Consent) => {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    setReopened(false);
    window.dispatchEvent(new Event(EVENT));
  };

  if (!needsConsent || consent === "unknown" || (consent !== null && !reopened)) return null;

  return (
    <div className="consent" role="region" aria-label="Згода на cookies">
      <p className="consent__text">
        Ми використовуємо cookies для аналітики та реклами, щоб робити сайт кращим.{" "}
        <a href={privacyUrl} target="_blank" rel="noopener" className="link-line">
          Політика конфіденційності
        </a>
      </p>
      <div className="consent__actions">
        <button type="button" className="consent__btn consent__btn--ghost" onClick={() => decide("denied")}>
          Лише необхідні
        </button>
        <button type="button" className="consent__btn" onClick={() => decide("granted")}>
          Прийняти
        </button>
      </div>
    </div>
  );
}
