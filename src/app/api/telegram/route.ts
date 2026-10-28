import crypto from "node:crypto";
import { handleUpdate, type TgUpdate } from "@/lib/server/bot";

/** Вебхук @konkordiya_bot. Підключення: node --env-file=.env scripts/telegram-setup.mjs */
export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";
  const got = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  // Лише запити від Telegram (секрет задається під час підключення вебхука)
  if (!secret || got.length !== secret.length || !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(secret))) {
    return new Response("forbidden", { status: 403 });
  }
  try {
    await handleUpdate((await request.json()) as TgUpdate);
  } catch (e) {
    // 200 навіть при помилці — інакше Telegram повторюватиме те саме оновлення
    console.error("[bot]", e);
  }
  return new Response("ok");
}
