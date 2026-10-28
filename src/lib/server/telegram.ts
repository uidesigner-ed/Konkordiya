import "server-only";

/**
 * Telegram Bot API: один бот (@konkordiya_bot) і для діалогу з клієнтами, і для сповіщень
 * у груповий чат менеджерів «Заявки Конкордія».
 *   TELEGRAM_BOT_TOKEN       — токен від @BotFather
 *   TELEGRAM_CHAT_ID         — id групи менеджерів (команда /chatid у групі)
 *   TELEGRAM_WEBHOOK_SECRET  — секрет вебхука (scripts/telegram-setup.mjs)
 */

// Адресу API можна підмінити для локальних тестів без справжнього бота
const API = process.env.TELEGRAM_API_BASE || "https://api.telegram.org";

export const managersChatId = () => process.env.TELEGRAM_CHAT_ID?.trim() ?? "";

type TgResponse<T> = { ok: boolean; result?: T; description?: string; parameters?: { migrate_to_chat_id?: number } };

/** Виклик методу Bot API; null — помилка (пишеться в лог, роботу сайту не зупиняє) */
export async function tg<T = unknown>(method: string, body: Record<string, unknown>): Promise<T | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(`${API}/bot${token}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(6000),
    });
    const json = (await res.json().catch(() => null)) as TgResponse<T> | null;
    if (json?.ok) return (json.result ?? true) as T;
    const why = json?.description ?? `HTTP ${res.status}`;
    // Повторне редагування тим самим текстом — не помилка
    if (!why.includes("message is not modified")) {
      const migrated = json?.parameters?.migrate_to_chat_id;
      console.error(
        `[telegram] ${method}: ${why}` +
          (migrated ? ` — група стала супергрупою, вкажіть TELEGRAM_CHAT_ID=${migrated}` : ""),
      );
    }
  } catch (e) {
    console.error(`[telegram] ${method}:`, e instanceof Error ? e.message : e);
  }
  return null;
}

/** Екранування для parse_mode: "HTML" */
export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const fmtKyiv = (ms: number) =>
  new Date(ms).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Kyiv",
  });

/** Робочий час менеджерів: пн–пт, 09:00–17:00 за Києвом */
export function isWorkingTime(ms = Date.now()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Kyiv",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(ms));
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  return !["Sat", "Sun"].includes(weekday) && hour >= 9 && hour < 17;
}
