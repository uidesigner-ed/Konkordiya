import "server-only";
import { cache } from "react";
import { db, parseJson } from "./db";

/** Налаштування сайту (адмінка → «Налаштування»). Порожні поля беруться зі змінних середовища. */
export type SiteSettings = {
  /** Google Analytics 4 — «G-XXXXXXXXXX» */
  ga4Id: string;
  /** Google Tag Manager — «GTM-XXXXXXX» (якщо теги ведуться через GTM) */
  gtmId: string;
  /** Google Ads — «AW-XXXXXXXXXX» (тег конверсій і ремаркетингу) */
  googleAdsId: string;
  /** Мітки конверсій Google Ads (частина після «AW-…/»): заявка, дзвінок, Telegram, WhatsApp, Instagram, пошта */
  adsLabelLead: string;
  adsLabelCall: string;
  adsLabelTelegram: string;
  adsLabelWhatsapp: string;
  adsLabelInstagram: string;
  adsLabelEmail: string;
  /** Meta Pixel — числовий ID */
  metaPixelId: string;
  /** Google Search Console — значення content з мета-тегу підтвердження */
  gscVerification: string;
  /** Довільні теги клієнта: код у <head> та на початку <body> */
  customHead: string;
  customBody: string;
  /** Завантажувати довільний код лише після згоди на cookies */
  customConsent: boolean;
  /** Закрити весь сайт від індексації (для тестового домену) */
  noindexSite: boolean;
};

const DEFAULTS: SiteSettings = {
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "G-3XE2N5ZHST",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
  googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-18360350961",
  adsLabelLead: "nEV1CLCJ1aUdEPHx8rJE", // «Надсилання форми для лідів»
  adsLabelCall: "UP5wCIO08aQdEPHx8rJE", // «Телефон — клік із сайту»
  adsLabelTelegram: "UXgTCMa83KQdEPHx8rJE", // «Месенджер — клік із сайту» (лише Telegram)
  adsLabelWhatsapp: "KQL6CM3q16UdEPHx8rJE", // «WhatsApp — клік із сайту»
  adsLabelInstagram: "",
  adsLabelEmail: "9ADqCMrq16UdEPHx8rJE", // «Пошта — клік із сайту»
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "1889888642445596",
  gscVerification: process.env.GOOGLE_SITE_VERIFICATION ?? "",
  customHead: "",
  customBody: "",
  customConsent: true,
  noindexSite: false,
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const c = await db();
  const { rows } = await c.execute("SELECT key, value FROM settings");
  const stored = Object.fromEntries(rows.map((r) => [String(r.key), parseJson<unknown>(r.value, null)]));
  const out = { ...DEFAULTS };
  for (const k of Object.keys(DEFAULTS) as (keyof SiteSettings)[]) {
    const v = stored[k];
    if (v === null || v === undefined || v === "") continue;
    (out as Record<string, unknown>)[k] = v;
  }
  return out;
});

export function validateSettings(input: Record<string, FormDataEntryValue | null>) {
  const s = (k: string, max = 200) => String(input[k] ?? "").trim().slice(0, max);
  const errors: Record<string, string> = {};
  const ga4Id = s("ga4Id").toUpperCase();
  if (ga4Id && !/^G-[A-Z0-9]{4,16}$/.test(ga4Id)) errors.ga4Id = "Формат: G-XXXXXXXXXX";
  const gtmId = s("gtmId").toUpperCase();
  if (gtmId && !/^GTM-[A-Z0-9]{4,12}$/.test(gtmId)) errors.gtmId = "Формат: GTM-XXXXXXX";
  const googleAdsId = s("googleAdsId").toUpperCase();
  if (googleAdsId && !/^AW-\d{6,16}$/.test(googleAdsId)) errors.googleAdsId = "Формат: AW-XXXXXXXXXX";
  // Мітка конверсії: можна вставити лише мітку, «AW-…/мітка» або весь фрагмент коду з send_to
  const label = (k: string) => {
    const v = s(k, 2000);
    const m = v.match(/AW-\d+\/([\w-]+)/);
    const out = m ? m[1] : v;
    if (out && !/^[\w-]{4,40}$/.test(out)) errors[k] = "Вставте мітку конверсії (частина після «AW-…/»)";
    return out;
  };
  const adsLabelLead = label("adsLabelLead");
  const adsLabelCall = label("adsLabelCall");
  const adsLabelTelegram = label("adsLabelTelegram");
  const adsLabelWhatsapp = label("adsLabelWhatsapp");
  const adsLabelInstagram = label("adsLabelInstagram");
  const adsLabelEmail = label("adsLabelEmail");
  const metaPixelId = s("metaPixelId");
  if (metaPixelId && !/^\d{8,20}$/.test(metaPixelId)) errors.metaPixelId = "Лише цифри, 8–20 знаків";
  // Можна вставити весь мета-тег — витягнемо значення content
  let gscVerification = s("gscVerification", 400);
  const m = gscVerification.match(/content=["']([^"']+)["']/);
  if (m) gscVerification = m[1];
  if (gscVerification && !/^[\w-]{10,100}$/.test(gscVerification)) errors.gscVerification = "Вставте код підтвердження або весь мета-тег";
  const data: SiteSettings = {
    ga4Id,
    gtmId,
    googleAdsId,
    adsLabelLead,
    adsLabelCall,
    adsLabelTelegram,
    adsLabelWhatsapp,
    adsLabelInstagram,
    adsLabelEmail,
    metaPixelId,
    gscVerification,
    customHead: String(input.customHead ?? "").slice(0, 20000),
    customBody: String(input.customBody ?? "").slice(0, 20000),
    customConsent: input.customConsent === "on",
    noindexSite: input.noindexSite === "on",
  };
  return { data, errors };
}

export async function saveSettings(data: SiteSettings) {
  const c = await db();
  await c.batch(
    Object.entries(data).map(([key, value]) => ({
      sql: "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      args: [key, JSON.stringify(value)],
    })),
    "write",
  );
}

/* ── SEO сторінок (перевизначення стандартних Title / Description) ── */

export type PageSeo = { title?: string; description?: string; noindex?: boolean; ogTitle?: string; ogDescription?: string };

export const getAllPageSeo = cache(async (): Promise<Record<string, PageSeo>> => {
  const c = await db();
  const { rows } = await c.execute("SELECT path, data FROM page_seo");
  return Object.fromEntries(rows.map((r) => [String(r.path), parseJson<PageSeo>(r.data, {})]));
});

export async function savePageSeo(path: string, seo: PageSeo) {
  const c = await db();
  await c.execute({
    sql: `INSERT INTO page_seo (path, data, updated_at) VALUES (?, ?, ?)
          ON CONFLICT(path) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    args: [path, JSON.stringify(seo), Date.now()],
  });
}
