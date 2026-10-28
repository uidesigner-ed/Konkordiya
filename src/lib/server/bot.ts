import "server-only";
import crypto from "node:crypto";
import { db, parseJson } from "./db";
import { esc, isWorkingTime, managersChatId, tg } from "./telegram";
import { createLead, getLead, recentLeadsFrom, setLeadStatus, type LeadStatus } from "./leads";
import { sendGa4Event } from "./ga4";
import { site } from "@/config/site";
import { normalizePhone, PHONE_ERROR } from "@/lib/phone";

/**
 * Сценарій @konkordiya_bot: послуга → ім’я → телефон → питання → заявка в групу менеджерів.
 * Стан діалогу — у таблиці tg_sessions; візит із сайту (джерело, ідентифікатори GA4) — у tg_visits.
 * Параметр посилання t.me/konkordiya_bot?start=…:
 *   <ключ візиту>                 — звичайна кнопка Telegram на сайті;
 *   s_<послуга>[-<ключ візиту>]   — кнопка з наперед обраною послугою (напр. s_military з блоку «Військовим»).
 */

export const BOT_SERVICES = [
  { key: "fop", label: "Бухгалтерія для ФОП" },
  { key: "tov", label: "Бухгалтерія для ТОВ" },
  { key: "support", label: "Бухгалтерський супровід бізнесу" },
  { key: "consult", label: "Бухгалтерська консультація" },
  { key: "military", label: "Допомога військовим" },
  { key: "other", label: "Інше питання" },
] as const;
const serviceByKey = (key?: string) => BOT_SERVICES.find((s) => s.key === key)?.label;

const SKIP = "Пропустити";
const SESSION_TTL = 24 * 60 * 60 * 1000;

type Step = "service" | "name" | "phone" | "question";
type Session = { step: Step; service?: string; name?: string; phone?: string; visit?: string };
export type Visit = { page?: string; utm?: Record<string, string>; clientId?: string; sessionId?: string };

/* ── Мінімальні типи оновлень Telegram ── */
type TgUser = { id: number; first_name?: string; last_name?: string; username?: string; is_bot?: boolean };
type TgChat = { id: number; type: "private" | "group" | "supergroup" | "channel" };
type TgMessage = {
  message_id: number;
  from?: TgUser;
  chat: TgChat;
  text?: string;
  contact?: { phone_number: string; user_id?: number };
  migrate_to_chat_id?: number;
};
type TgCallback = { id: string; from: TgUser; data?: string; message?: { message_id: number; chat: TgChat } };
export type TgUpdate = { update_id: number; message?: TgMessage; callback_query?: TgCallback };

/* ── Тексти ── */
const T = {
  welcome:
    "Вітаємо! 👋 Це бот бухгалтерської компанії «Конкордія».\n\n" +
    "Залиште заявку — і наш менеджер зв’яжеться з вами. Оберіть, будь ласка, послугу:",
  chooseService: "Оберіть, будь ласка, послугу кнопкою нижче 👇",
  name: "Як до вас звертатися?",
  nameInvalid: "Напишіть, будь ласка, ваше ім’я (від 2 символів).",
  phone: () =>
    "Залиште номер телефону — натисніть кнопку «📱 Надіслати номер» нижче або введіть його вручну.\n\n" +
    `<i>Надсилаючи заявку, ви погоджуєтеся з обробкою персональних даних згідно з <a href="${site.url}${site.privacyUrl}">Політикою конфіденційності</a>.</i>`,
  phoneInvalid: `${PHONE_ERROR} — наприклад, +380 50 123 45 67.`,
  preselected: (service: string) =>
    "Вітаємо! 👋 Це бот бухгалтерської компанії «Конкордія».\n\n" +
    `Ви обрали послугу: <b>${esc(service)}</b>. Залиште, будь ласка, контакти — і наш менеджер зв’яжеться з вами.`,
  question: "Коротко опишіть ваше питання — або натисніть «Пропустити».",
  tooMany: "Ви вже надіслали кілька заявок. Менеджер зв’яжеться з вами найближчим часом.",
  failed: "Не вдалося надіслати заявку 😔 Спробуйте, будь ласка, ще раз — /start — або зателефонуйте нам: " + site.phone.display,
  cancelled: "Заявку скасовано. Щоб почати знову, натисніть /start.",
  // Текст замовниці: робочий час — пн–пт 09:00–17:00 за Києвом
  doneWorking:
    "Дякуємо за звернення до бухгалтерської компанії «Конкордія»! 💙\n" +
    "Вашу заявку успішно отримано. Менеджер зв’яжеться з вами найближчим часом.",
  doneOffHours:
    "Дякуємо за звернення до бухгалтерської компанії «Конкордія»! 💙\n" +
    "Вашу заявку успішно отримано.\n" +
    "Наші менеджери працюють з понеділка по п’ятницю, з 09:00 до 17:00. Ми зв’яжемося з вами найближчого робочого дня.\n" +
    "Дякуємо за довіру!",
  again: "\n\nЩоб надіслати ще одну заявку, натисніть /start.",
};

const removeKeyboard = { remove_keyboard: true };
const servicesKeyboard = {
  inline_keyboard: BOT_SERVICES.map((s) => [{ text: s.label, callback_data: `svc:${s.key}` }]),
};
const changeServiceKeyboard = { inline_keyboard: [[{ text: "Обрати іншу послугу", callback_data: "svc:change" }]] };
const nameKeyboard = (from?: TgUser) => {
  const suggested = from?.first_name?.trim();
  return suggested ? { keyboard: [[{ text: suggested.slice(0, 60) }]], resize_keyboard: true, one_time_keyboard: true } : undefined;
};

/* ── Стан діалогу ── */
async function getSession(chatId: number): Promise<Session | null> {
  const c = await db();
  const { rows } = await c.execute({ sql: "SELECT data, updated_at FROM tg_sessions WHERE chat_id = ?", args: [String(chatId)] });
  if (!rows[0] || Date.now() - Number(rows[0].updated_at) > SESSION_TTL) return null;
  return parseJson<Session | null>(rows[0].data, null);
}
async function saveSession(chatId: number, s: Session) {
  const c = await db();
  await c.execute({
    sql: `INSERT INTO tg_sessions (chat_id, data, updated_at) VALUES (?, ?, ?)
          ON CONFLICT(chat_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    args: [String(chatId), JSON.stringify(s), Date.now()],
  });
}
async function dropSession(chatId: number) {
  const c = await db();
  await c.execute({ sql: "DELETE FROM tg_sessions WHERE chat_id = ?", args: [String(chatId)] });
}

/* ── Візит із сайту ── */
export async function saveVisit(token: string, v: Visit) {
  const c = await db();
  await c.execute({
    sql: "INSERT OR IGNORE INTO tg_visits (token, data, created_at) VALUES (?, ?, ?)",
    args: [token, JSON.stringify(v), Date.now()],
  });
  // Старші за 30 днів більше не потрібні
  await c.execute({ sql: "DELETE FROM tg_visits WHERE created_at < ?", args: [Date.now() - 30 * 24 * 60 * 60 * 1000] });
}
async function getVisit(token?: string): Promise<Visit> {
  if (!token) return {};
  const c = await db();
  const { rows } = await c.execute({ sql: "SELECT data FROM tg_visits WHERE token = ?", args: [token] });
  return parseJson<Visit>(rows[0]?.data, {});
}

const send = (chatId: number, text: string, reply_markup?: unknown) =>
  tg("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", link_preview_options: { is_disabled: true }, ...(reply_markup ? { reply_markup } : {}) });

const fullName = (u: TgUser) => [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || (u.username ? `@${u.username}` : "Менеджер");

/* ── Обробка оновлення від Telegram ── */
export async function handleUpdate(u: TgUpdate) {
  if (u.callback_query) return onCallback(u.callback_query);
  const m = u.message;
  if (!m || m.from?.is_bot) return;
  if (m.chat.type === "private") return onPrivate(m);
  return onGroup(m);
}

/** Група менеджерів: /chatid — дізнатися id для TELEGRAM_CHAT_ID */
async function onGroup(m: TgMessage) {
  if (m.migrate_to_chat_id) {
    console.error(`[telegram] група стала супергрупою — вкажіть TELEGRAM_CHAT_ID=${m.migrate_to_chat_id}`);
    return;
  }
  if (/^\/chatid(@\w+)?$/.test(m.text?.trim() ?? "")) {
    const current = managersChatId();
    await send(
      m.chat.id,
      `ID цього чату: <code>${m.chat.id}</code>\n` +
        (current === String(m.chat.id)
          ? "✅ Заявки вже надходять сюди."
          : "Впишіть його в .env на сервері: <code>TELEGRAM_CHAT_ID=" + m.chat.id + "</code> і перезапустіть сайт."),
    );
  }
}

async function onPrivate(m: TgMessage) {
  const chatId = m.chat.id;
  const text = m.text?.trim() ?? "";

  const start = text.match(/^\/start(?:\s+([\w-]{1,64}))?$/);
  if (start) {
    const p = start[1] ?? "";
    const preset = p.match(/^s_([a-z]+)(?:-([\w]{8,60}))?$/);
    if (preset) return startDialog(chatId, preset[2], serviceByKey(preset[1]), m.from);
    return startDialog(chatId, p || undefined);
  }
  if (text === "/cancel") {
    await dropSession(chatId);
    return send(chatId, T.cancelled, removeKeyboard);
  }

  const s = await getSession(chatId);
  if (!s) return startDialog(chatId);

  switch (s.step) {
    case "service":
      return send(chatId, T.chooseService, servicesKeyboard);

    case "name": {
      if (text.length < 2 || text.startsWith("/")) return send(chatId, T.nameInvalid);
      await saveSession(chatId, { ...s, name: text.slice(0, 80), step: "phone" });
      return send(chatId, T.phone(), {
        keyboard: [[{ text: "📱 Надіслати номер", request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      });
    }

    case "phone": {
      // Номер із кнопки «Надіслати номер» Telegram уже перевірив (буває без «+»)
      const phone = m.contact
        ? normalizePhone(`+${m.contact.phone_number.replace(/\D/g, "")}`)
        : normalizePhone(text);
      if (!phone) return send(chatId, T.phoneInvalid);
      await saveSession(chatId, { ...s, phone, step: "question" });
      return send(chatId, T.question, { keyboard: [[{ text: SKIP }]], resize_keyboard: true, one_time_keyboard: true });
    }

    case "question":
      return finish(chatId, s, text === SKIP ? "" : text.slice(0, 1000), m.from);
  }
}

async function startDialog(chatId: number, visit?: string, service?: string, from?: TgUser) {
  // Ключ візиту зберігаємо, навіть якщо клієнт натиснув Start вдруге без нього — щоб не втратити джерело
  const prev = await getSession(chatId);
  const v = visit ?? prev?.visit;
  if (service) {
    // Послугу обрано на сайті — одразу питаємо ім’я (послугу можна змінити кнопкою)
    await saveSession(chatId, { step: "name", service, visit: v });
    await send(chatId, T.preselected(service), changeServiceKeyboard);
    return send(chatId, T.name, nameKeyboard(from));
  }
  await saveSession(chatId, { step: "service", visit: v });
  await send(chatId, T.welcome, servicesKeyboard);
}

async function finish(chatId: number, s: Session, question: string, from?: TgUser) {
  if (!s.service || !s.name || !s.phone) return startDialog(chatId, s.visit);
  const ipHash = crypto.createHash("sha256").update(`konk:tg:${chatId}`).digest("hex").slice(0, 24);
  if ((await recentLeadsFrom(ipHash)) >= 5) {
    await dropSession(chatId);
    return send(chatId, T.tooMany, removeKeyboard);
  }
  const visit = await getVisit(s.visit);
  let id: number;
  try {
    id = await createLead(
      {
        name: s.name,
        phone: s.phone,
        contact: "telegram",
        service: s.service,
        message: question,
        page: visit.page ?? "",
        utm: visit.utm ?? {},
        source: "telegram_bot",
        tgChatId: String(chatId),
        tgUsername: from?.username ?? "",
      },
      ipHash,
    );
  } catch (e) {
    console.error("[bot] createLead:", e);
    return send(chatId, T.failed, removeKeyboard);
  }
  await dropSession(chatId);
  await send(chatId, (isWorkingTime() ? T.doneWorking : T.doneOffHours) + T.again, removeKeyboard);
  // Окрема подія від натискання кнопки Telegram (click_messenger) — без подвійного обліку
  await sendGa4Event(
    "telegram_bot_lead",
    { service: s.service, lead_source: "telegram_bot", ...(visit.page ? { page_path: visit.page } : {}), lead_id: id },
    { clientId: visit.clientId, sessionId: visit.sessionId },
  );
}

/* ── Кнопки: вибір послуги (клієнт) і статуси (група менеджерів) ── */
async function onCallback(q: TgCallback) {
  const data = q.data ?? "";
  const chat = q.message?.chat;

  const svc = data.match(/^svc:([a-z]+)$/);
  if (svc && chat?.type === "private") {
    const s = await getSession(chat.id);
    await tg("answerCallbackQuery", { callback_query_id: q.id });
    if (svc[1] === "change") {
      // Повернутися до вибору послуги, зберігши джерело візиту
      if (!s) return startDialog(chat.id);
      await saveSession(chat.id, { step: "service", visit: s.visit });
      return send(chat.id, T.chooseService, servicesKeyboard);
    }
    const service = serviceByKey(svc[1]);
    if (!service || !s) return startDialog(chat.id);
    await saveSession(chat.id, { ...s, service, step: "name" });
    // Прибираємо кнопки й показуємо вибір
    await tg("editMessageText", {
      chat_id: chat.id,
      message_id: q.message!.message_id,
      text: `Послуга: <b>${esc(service)}</b> ✓`,
      parse_mode: "HTML",
    });
    return send(chat.id, T.name, nameKeyboard(q.from));
  }

  const st = data.match(/^lead:(\d+):(new|work|done)$/);
  if (st) {
    // Статуси змінюють лише в групі менеджерів
    if (!chat || String(chat.id) !== managersChatId()) {
      return tg("answerCallbackQuery", { callback_query_id: q.id });
    }
    const id = Number(st[1]);
    const status = st[2] as LeadStatus;
    const lead = await getLead(id);
    if (!lead) return tg("answerCallbackQuery", { callback_query_id: q.id, text: "Заявку не знайдено (можливо, видалено).", show_alert: true });
    const who = fullName(q.from);
    // Захист від подвійної відповіді: заявку, яку вже взяли, інший менеджер не перехоплює
    if (status === "work" && lead.status === "work" && lead.assignee && lead.assignee !== who) {
      return tg("answerCallbackQuery", { callback_query_id: q.id, text: `Заявку вже взяв(ла) в роботу: ${lead.assignee}`, show_alert: true });
    }
    await setLeadStatus(id, status, status === "new" ? null : status === "work" ? who : lead.assignee || who);
    return tg("answerCallbackQuery", {
      callback_query_id: q.id,
      text: status === "work" ? "Заявка ваша ✅" : status === "done" ? "Позначено як опрацьовану" : "Повернуто в нові",
    });
  }

  await tg("answerCallbackQuery", { callback_query_id: q.id });
}
