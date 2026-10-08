import "server-only";
import crypto from "node:crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

/**
 * Сесії адмінки: випадковий токен у httpOnly-cookie, у базі — лише його SHA-256.
 * Перевірка — у кожній сторінці та серверній дії адмінки (requireUser / requireAdmin).
 */

export type Role = "admin" | "editor";
export type SessionUser = { id: number; email: string; name: string; role: Role };

const COOKIE = "konk_admin";
const TTL = 14 * 24 * 60 * 60 * 1000;
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function clientIpHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return sha256(`konk:${ip}`).slice(0, 24);
}

export async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString("base64url");
  const now = Date.now();
  const c = await db();
  await c.execute({
    sql: "INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
    args: [sha256(token), userId, now + TTL, now],
  });
  await c.execute({ sql: "UPDATE users SET last_login_at = ? WHERE id = ?", args: [now, userId] });
  // Прибираємо прострочені
  await c.execute({ sql: "DELETE FROM sessions WHERE expires_at < ?", args: [now] });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL / 1000,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const c = await db();
    await c.execute({ sql: "DELETE FROM sessions WHERE id = ?", args: [sha256(token)] });
  }
  jar.delete(COOKIE);
}

/** Поточний користувач (або null). Кешується в межах одного запиту. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const c = await db();
  const { rows } = await c.execute({
    sql: `SELECT u.id, u.email, u.name, u.role FROM sessions s JOIN users u ON u.id = s.user_id
          WHERE s.id = ? AND s.expires_at > ?`,
    args: [sha256(token), Date.now()],
  });
  const r = rows[0];
  if (!r) return null;
  return { id: Number(r.id), email: String(r.email), name: String(r.name), role: r.role === "admin" ? "admin" : "editor" };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/admin?denied=1");
  return user;
}

/* ── Захист від перебору паролів ── */

export async function loginLocked(keys: string[]) {
  const c = await db();
  const now = Date.now();
  for (const key of keys) {
    const { rows } = await c.execute({ sql: "SELECT locked_until FROM login_attempts WHERE key = ?", args: [key] });
    const until = Number(rows[0]?.locked_until ?? 0);
    if (until > now) return Math.ceil((until - now) / 60000);
  }
  return 0;
}

export async function registerLoginFailure(keys: string[]) {
  const c = await db();
  const now = Date.now();
  for (const key of keys) {
    const { rows } = await c.execute({ sql: "SELECT count, first_at FROM login_attempts WHERE key = ?", args: [key] });
    const r = rows[0];
    const fresh = !r || now - Number(r.first_at) > LOCK_MS;
    const count = fresh ? 1 : Number(r.count) + 1;
    await c.execute({
      sql: `INSERT INTO login_attempts (key, count, first_at, locked_until) VALUES (?, ?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET count = excluded.count, first_at = excluded.first_at, locked_until = excluded.locked_until`,
      args: [key, count, fresh ? now : Number(r.first_at), count >= MAX_FAILS ? now + LOCK_MS : null],
    });
  }
}

export async function clearLoginFailures(keys: string[]) {
  const c = await db();
  for (const key of keys) await c.execute({ sql: "DELETE FROM login_attempts WHERE key = ?", args: [key] });
}
