import "server-only";
import { db, parseJson } from "./db";

/** Заявки з форм сайту: зберігаються в базі, за наявності бота — дублюються в Telegram */

export type LeadStatus = "new" | "work" | "done" | "spam";
export const leadStatuses: { id: LeadStatus; label: string }[] = [
  { id: "new", label: "Нова" },
  { id: "work", label: "В роботі" },
  { id: "done", label: "Опрацьована" },
  { id: "spam", label: "Спам" },
];

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
};

export type LeadInput = Omit<Lead, "id" | "status" | "createdAt">;

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
  await c.execute({
    sql: `INSERT INTO leads (name, phone, contact, service, message, page, utm, ip_hash, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [l.name, l.phone, l.contact, l.service, l.message, l.page, JSON.stringify(l.utm), ipHash, Date.now()],
  });
  await notifyTelegram(l).catch(() => {});
}

/** TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID — сповіщення про нову заявку (необов’язково) */
async function notifyTelegram(l: LeadInput) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  const lines = [
    "Нова заявка з сайту «Конкордія»",
    `Ім’я: ${l.name}`,
    `Телефон: ${l.phone}`,
    l.contact && `Зв’язок: ${l.contact}`,
    l.service && `Послуга: ${l.service}`,
    l.message && `Повідомлення: ${l.message}`,
    l.page && `Сторінка: ${l.page}`,
  ].filter(Boolean);
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text: lines.join("\n") }),
    signal: AbortSignal.timeout(4000),
  });
}

export async function listLeads() {
  const c = await db();
  const { rows } = await c.execute("SELECT * FROM leads ORDER BY created_at DESC LIMIT 500");
  return rows.map(
    (r): Lead => ({
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
    }),
  );
}

export async function countNewLeads() {
  const c = await db();
  const { rows } = await c.execute("SELECT COUNT(*) AS n FROM leads WHERE status = 'new'");
  return Number(rows[0].n);
}

export async function setLeadStatus(id: number, status: LeadStatus) {
  const c = await db();
  await c.execute({ sql: "UPDATE leads SET status = ? WHERE id = ?", args: [status, id] });
}

export async function deleteLead(id: number) {
  const c = await db();
  await c.execute({ sql: "DELETE FROM leads WHERE id = ?", args: [id] });
}
