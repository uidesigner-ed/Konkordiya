import { saveVisit, type Visit } from "@/lib/server/bot";

/**
 * Кнопка Telegram на сайті перед переходом у бота надсилає сюди (sendBeacon) ключ візиту
 * разом із джерелом (utm, gclid) та ідентифікаторами GA4 — бот отримає ключ у /start.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 4000) return new Response(null, { status: 413 });
  let input: Record<string, unknown>;
  try {
    input = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return new Response(null, { status: 400 });
  }
  const token = typeof input.token === "string" ? input.token : "";
  if (!/^[\w-]{8,64}$/.test(token)) return new Response(null, { status: 400 });

  const str = (v: unknown, re: RegExp) => (typeof v === "string" && re.test(v) ? v : undefined);
  const utmIn = input.utm && typeof input.utm === "object" ? (input.utm as Record<string, unknown>) : {};
  const visit: Visit = {
    page: str(input.page, /^\/[^\s]{0,199}$/),
    utm: Object.fromEntries(
      Object.entries(utmIn)
        .filter(([k, v]) => /^(utm_(source|medium|campaign|term|content)|gclid|fbclid)$/.test(k) && typeof v === "string")
        .map(([k, v]) => [k, String(v).slice(0, 200)]),
    ),
    clientId: str(input.clientId, /^\d{1,20}\.\d{1,20}$/),
    sessionId: str(input.sessionId, /^\d{1,20}$/),
  };
  await saveVisit(token, visit);
  return new Response(null, { status: 204 });
}
