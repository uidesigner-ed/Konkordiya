import { site } from "@/config/site";

/**
 * Перед переходом у Telegram-бота додаємо до посилання ключ візиту (?start=…) і надсилаємо на сервер
 * джерело (utm, gclid) та ідентифікатори GA4 — так заявку з бота можна пов’язати з рекламним переходом.
 */

const cookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1);

/** _ga = GA1.1.<client_id> */
function gaClientId() {
  const parts = cookie("_ga")?.split(".");
  return parts && parts.length >= 4 ? parts.slice(2).join(".") : undefined;
}

/** _ga_<ID> = GS1.1.<session_id>.… або GS2.1.s<session_id>$o…  */
function gaSessionId(ga4Id: string) {
  const v = ga4Id ? cookie(`_ga_${ga4Id.replace(/^G-/, "")}`) : undefined;
  return v?.split(".")[2]?.match(/^s?(\d+)/)?.[1];
}

export function isBotLink(href: string) {
  try {
    const u = new URL(href, location.href);
    return /^(t\.me|telegram\.me)$/i.test(u.hostname) && u.pathname.replace(/\//g, "").toLowerCase() === site.telegramBot;
  } catch {
    return false;
  }
}

export function prepareBotLink(a: HTMLAnchorElement, ga4Id: string) {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(36).padStart(2, "0")).join("");
  const u = new URL(a.href);
  // Наперед обрана послуга (s_military тощо) зберігається: s_military-<ключ>
  const preset = u.searchParams.get("start")?.match(/^s_[a-z]+/)?.[0];
  u.searchParams.set("start", preset ? `${preset}-${token}` : token);
  a.href = u.toString();

  let utm: Record<string, string> = {};
  try {
    utm = JSON.parse(sessionStorage.getItem("konk-utm") ?? "{}") as Record<string, string>;
  } catch {}
  const payload = JSON.stringify({
    token,
    page: location.pathname,
    utm,
    clientId: gaClientId(),
    sessionId: gaSessionId(ga4Id),
  });
  // sendBeacon переживає перехід зі сторінки
  if (!navigator.sendBeacon?.("/api/tg-visit", new Blob([payload], { type: "application/json" }))) {
    fetch("/api/tg-visit", { method: "POST", body: payload, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
  }
}
