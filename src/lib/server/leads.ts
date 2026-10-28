import "server-only";
import { db, parseJson } from "./db";
import { contactMethods } from "@/components/forms/lead-options";
import { esc, fmtKyiv, managersChatId, tg } from "./telegram";

/**
 * Заявки з форм сайту й Telegram-бота: зберігаються в базі й надходять у групу менеджерів
 * з кнопками статусів («Беру в роботу», «Опрацьована») — щоб двоє менеджерів не відповідали одному клієнту.
 */

export type LeadStatus = "new" | "work" | "done" | "spam";
export const leadStatuses: { id: LeadStatus; label: string }[] = [
  { id: "new", label: "Нова" },
  { id: "work", label: "В роботі" },
  { id: "done", label: "Опрацьована" },
  { id: "spam", label: "Спам" },
];

export type LeadSource = "form" | "telegram_bot";
export const leadSourceLabel: Record<LeadSource, string> = { form: "Форма на сайті", telegram_bot: "Telegram-бот" };

export type Lead = {
  id: number;
  name: string;
  phone: string;
  contact: string;
  service: string;
  message: string;
  page: string;
  utm: Record<string, string>;
  status: LeadStatus;
  createdAt: number;
  source: LeadSource;
  tgChatId: string;
  tgUsername: string;
  tgMessageId: number | null;
  /** Хто взяв у роботу (ім’я в Telegram або в адмінці) */
  assignee: string;
};

export type LeadInput = Pick<Lead, "name" | "phone" | "contact" | "service" | "message" | "page" | "utm"> &
  Partial<Pick<Lead, "source" | "tgChatId" | "tgUsername">>;

export async function recentLeadsFrom(ipHash: string, windowMs = 60 * 60 * 1000) {
  const c = await db();
  const { rows } = await c.execute({
    sql: "SELECT COUNT(*) AS n FROM leads WHERE ip_hash = ? AND created_at > ?",
    args: [ipHash, Date.now() - windowMs],
  });
  return Number(rows[0].n);
}

export async function createLead(l: LeadInput, ipHash: string) {
  const c = await db();
  const r = await c.execute({
    sql: `INSERT INTO leads (name, phone, contact, service, message, page, utm, ip_hash, created_at, source, tg_chat_id, tg_username)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      l.name,
      l.phone,
      l.contact,
      l.service,
      l.message,
      l.page,
      JSON.stringify(l.utm),
      ipHash,
      Date.now(),
      l.source ?? "form",
      l.tgChatId || null,
      l.tgUsername || null,
    ],
  });
  const id = Number(r.lastInsertRowid);
  await notifyManagers(id).catch(() => {});
  return id;
}

const toLead = (r: Record<string, unknown>): Lead => ({
  id: Number(r.id),
  name: String(r.name),
  phone: String(r.phone),
  contact: String(r.contact ?? ""),
  service: String(r.service ?? ""),
  message: String(r.message ?? ""),
  page: String(r.page ?? ""),
  utm: parseJson<Record<string, string>>(r.utm, {}),
  status: (leadStatuses.some((s) => s.id === r.status) ? r.status : "new") as LeadStatus,
  createdAt: Number(r.created_at),
  source: r.source === "telegram_bot" ? "telegram_bot" : "form",
  tgChatId: String(r.tg_chat_id ?? ""),
  tgUsername: String(r.tg_username ?? ""),
  tgMessageId: r.tg_message_id == null ? null : Number(r.tg_message_id),
  assignee: String(r.assignee ?? ""),
});

export async function getLead(id: number) {
  const c = await db();
  const { rows } = await c.execute({ sql: "SELECT * FROM leads WHERE id = ?", args: [id] });
  return rows[0] ? toLead(rows[0]) : null;
}

export async function listLeads() {
  const c = await db();
  const { rows } = await c.execute("SELECT * FROM leads ORDER BY created_at DESC LIMIT 500");
  return rows.map(toLead);
}

export async function countNewLeads() {
  const c = await db();
  const { rows } = await c.execute("SELECT COUNT(*) AS n FROM leads WHERE status = 'new'");
  return Number(rows[0].n);
}

/** assignee: рядок — записати, null — очистити, не передано — не чіпати */
export async function setLeadStatus(id: number, status: LeadStatus, assignee?: string | null) {
  const c = await db();
  if (assignee === undefined) {
    await c.execute({ sql: "UPDATE leads SET status = ? WHERE id = ?", args: [status, id] });
  } else {
    await c.execute({ sql: "UPDATE leads SET status = ?, assignee = ? WHERE id = ?", args: [status, assignee, id] });
  }
  await syncManagersMessage(id).catch(() => {});
}

export async function deleteLead(id: number) {
  const c = await db();
  await c.execute({ sql: "DELETE FROM leads WHERE id = ?", args: [id] });
}

/* ── Повідомлення в групу менеджерів ── */

const statusLine: Record<LeadStatus, string> = {
  new: "🟡 Нова",
  work: "🔵 В роботі",
  done: "🟢 Опрацьована",
  spam: "⚪ Спам",
};

/** Звідки прийшов клієнт — зрозумілою мовою */
export function describeSource(utm: Record<string, string>) {
  const parts: string[] = [];
  if (utm.gclid) parts.push("Google Ads");
  else if (utm.fbclid) parts.push("реклама Meta (Facebook / Instagram)");
  if (utm.utm_source) parts.push([utm.utm_source, utm.utm_medium].filter(Boolean).join(" / "));
  if (utm.utm_campaign) parts.push(`кампанія «${utm.utm_campaign}»`);
  return parts.length ? parts.join(" · ") : "без рекламних міток (пошук, прямий перехід або соцмережі)";
}

function managersText(l: Lead) {
  const contact = l.contact && l.source === "form" ? contactMethods.find((m) => m.id === l.contact)?.label ?? l.contact : "";
  const telegram = l.tgUsername
    ? `@${esc(l.tgUsername)}`
    : l.tgChatId
      ? `<a href="tg://user?id=${esc(l.tgChatId)}">відкрити профіль</a>`
      : "";
  return [
    `<b>${l.status === "new" ? "🆕 Нова заявка" : "Заявка"} №${l.id}</b> · ${leadSourceLabel[l.source]}`,
    "",
    l.service ? `<b>Послуга:</b> ${esc(l.service)}` : null,
    `<b>Ім’я:</b> ${esc(l.name)}`,
    `<b>Телефон:</b> ${esc(l.phone)}`,
    contact ? `<b>Зручний зв’язок:</b> ${esc(contact)}` : null,
    telegram ? `<b>Telegram:</b> ${telegram}` : null,
    `<b>Питання:</b> ${l.message ? esc(l.message) : "—"}`,
    `<b>Дата:</b> ${fmtKyiv(l.createdAt)}`,
    `<b>Джерело:</b> ${esc(describeSource(l.utm))}`,
    l.page ? `<b>Сторінка сайту:</b> ${esc(l.page)}` : null,
    "",
    `<b>Статус:</b> ${statusLine[l.status]}${l.assignee && l.status !== "new" ? ` — ${esc(l.assignee)}` : ""}`,
  ]
    .filter((x) => x !== null)
    .join("\n");
}

function managersButtons(l: Lead) {
  const b: { text: string; callback_data: string }[] = [];
  if (l.status === "new") b.push({ text: "🔵 Беру в роботу", callback_data: `lead:${l.id}:work` });
  if (l.status === "new" || l.status === "work") b.push({ text: "🟢 Опрацьована", callback_data: `lead:${l.id}:done` });
  if (l.status === "work" || l.status === "done") b.push({ text: "↩️ Повернути в нові", callback_data: `lead:${l.id}:new` });
  return { inline_keyboard: b.length ? [b] : [] };
}

async function notifyManagers(id: number) {
  const chat = managersChatId();
  const l = await getLead(id);
  if (!chat || !l) return;
  const msg = await tg<{ message_id: number }>("sendMessage", {
    chat_id: chat,
    text: managersText(l),
    parse_mode: "HTML",
    reply_markup: managersButtons(l),
    link_preview_options: { is_disabled: true },
  });
  if (msg?.message_id) {
    const c = await db();
    await c.execute({ sql: "UPDATE leads SET tg_message_id = ? WHERE id = ?", args: [msg.message_id, id] });
  }
}

/** Оновити повідомлення в групі після зміни статусу (з Telegram або з адмінки) */
async function syncManagersMessage(id: number) {
  const chat = managersChatId();
  const l = await getLead(id);
  if (!chat || !l?.tgMessageId) return;
  await tg("editMessageText", {
    chat_id: chat,
    message_id: l.tgMessageId,
    text: managersText(l),
    parse_mode: "HTML",
    reply_markup: managersButtons(l),
    link_preview_options: { is_disabled: true },
  });
}
