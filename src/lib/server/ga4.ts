import "server-only";
import crypto from "node:crypto";
import { getSettings } from "./settings";

/**
 * GA4 Measurement Protocol — події, що стаються поза сайтом (заявка в Telegram-боті).
 *   GA4_API_SECRET — GA4 → Адміністратор → Потоки даних → потік сайту → «Секретні ключі API Measurement Protocol».
 *
 * Зв’язок із рекламою: кнопка Telegram на сайті передає боту client_id і session_id відвідувача
 * (cookies _ga, _ga_<ID>). Подія з тими самими ідентифікаторами потрапляє в ту саму сесію GA4 —
 * і отримує її джерело (зокрема Google Ads), тож після імпорту в Google Ads прив’язується до кліку по рекламі.
 */

const ENDPOINT = process.env.GA4_MP_ENDPOINT || "https://www.google-analytics.com/mp/collect";

export type VisitIds = { clientId?: string; sessionId?: string };

export async function sendGa4Event(name: string, params: Record<string, string | number>, ids: VisitIds = {}) {
  const secret = process.env.GA4_API_SECRET;
  const { ga4Id } = await getSettings();
  if (!secret || !ga4Id) return;
  // Без згоди на cookies client_id немає: подію все одно рахуємо (кількість заявок), але без реклами
  const consented = !!ids.clientId;
  const body = {
    client_id: ids.clientId || `${crypto.randomInt(1e9, 2e9)}.${Math.floor(Date.now() / 1000)}`,
    events: [
      {
        name,
        params: { ...params, ...(ids.sessionId ? { session_id: ids.sessionId } : {}), engagement_time_msec: 1 },
      },
    ],
    ...(consented ? {} : { consent: { ad_user_data: "DENIED", ad_personalization: "DENIED" } }),
  };
  try {
    const url = `${ENDPOINT}?measurement_id=${encodeURIComponent(ga4Id)}&api_secret=${encodeURIComponent(secret)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error(`[ga4] ${name}: HTTP ${res.status}`);
  } catch (e) {
    console.error(`[ga4] ${name}:`, e instanceof Error ? e.message : e);
  }
}
