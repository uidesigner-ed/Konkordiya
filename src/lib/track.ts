/**
 * Події конверсій для Google Analytics 4 / Google Tag Manager і Meta Pixel.
 *
 *  GA4 (рекомендовано позначити як «ключові події»):
 *    generate_lead    — відправлено заявку з форми
 *    click_call       — натиснуто телефон
 *    click_messenger  — натиснуто Telegram / WhatsApp / Viber / Instagram
 *    click_email      — натиснуто пошту
 *  Google Ads: ті самі події; якщо задано мітку конверсії для події —
 *    додатково надсилається конверсія (send_to: AW-…/мітка), одна на кожну дію.
 *    Ключ мітки — «подія» або точніше «подія:месенджер» (напр. click_messenger:telegram).
 *  Meta Pixel: Lead (заявка), Contact (дзвінок, месенджер, пошта).
 *  GTM: ті самі назви приходять у dataLayer як { event: "…" } — тригер «Користувацька подія».
 */

type Params = Record<string, string | number | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[] };
  }
}

/** «подія» або «подія:месенджер» → «AW-…/мітка» конверсії Google Ads (з налаштувань сайту) */
let adsConversions: Record<string, string> = {};
export function setAdsConversions(map: Record<string, string>) {
  adsConversions = map;
}

export function track(event: string, params: Params = {}, meta?: { event: string; params?: Params }) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  window.gtag?.("event", event, params);
  const sendTo = adsConversions[`${event}:${params.messenger}`] ?? adsConversions[event];
  // Цінність — як у фрагментах конверсій Google Ads; надсилання не затримує перехід за посиланням
  if (sendTo) window.gtag?.("event", "conversion", { send_to: sendTo, value: 1.0, currency: "UAH" });
  if (meta) window.fbq?.("track", meta.event, meta.params ?? {});
}

export function trackLead(params: Params = {}) {
  track("generate_lead", params, { event: "Lead", params: { content_name: String(params.form_location ?? "form") } });
}

/** Класифікація посилання за href; null — не відстежуємо */
export function linkEvent(href: string): { event: string; params: Params; meta?: { event: string; params?: Params } } | null {
  const h = href.trim().toLowerCase();
  if (h.startsWith("tel:")) return { event: "click_call", params: { phone: h.slice(4) }, meta: { event: "Contact", params: { content_name: "phone" } } };
  if (h.startsWith("mailto:")) return { event: "click_email", params: {}, meta: { event: "Contact", params: { content_name: "email" } } };
  // Кнопки «Поділитися» — окрема подія, не контакт
  if (/t\.me\/share|facebook\.com\/sharer|linkedin\.com\/sharing/.test(h)) {
    const method = h.includes("t.me") ? "telegram" : h.includes("facebook") ? "facebook" : "linkedin";
    return { event: "share", params: { method } };
  }
  const messenger = /(^|\/\/)(t\.me|telegram\.me)\//.test(h)
    ? "telegram"
    : /wa\.me\/|whatsapp\.com/.test(h)
      ? "whatsapp"
      : h.startsWith("viber:")
        ? "viber"
        : /instagram\.com|ig\.me\//.test(h)
          ? "instagram"
          : /m\.me\/|messenger\.com/.test(h)
            ? "facebook_messenger"
            : null;
  if (messenger)
    return { event: "click_messenger", params: { messenger }, meta: { event: "Contact", params: { content_name: messenger } } };
  if (/linkedin\.com/.test(h)) return { event: "click_social", params: { network: "linkedin" } };
  return null;
}
