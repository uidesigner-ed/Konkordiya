import "server-only";
import { db } from "./db";
import type { Role } from "./auth";

export type UserRow = { id: number; email: string; name: string; role: Role; createdAt: number; lastLoginAt: number | null };

export async function listUsers(): Promise<UserRow[]> {
  const c = await db();
  const { rows } = await c.execute("SELECT id, email, name, role, created_at, last_login_at FROM users ORDER BY created_at");
  return rows.map((r) => ({
    id: Number(r.id),
    email: String(r.email),
    name: String(r.name),
    role: r.role === "admin" ? "admin" : "editor",
    createdAt: Number(r.created_at),
    lastLoginAt: r.last_login_at == null ? null : Number(r.last_login_at),
  }));
}

export async function findUserByEmail(email: string) {
  const c = await db();
  const { rows } = await c.execute({ sql: "SELECT id, password_hash FROM users WHERE email = ?", args: [email] });
  return rows[0] ? { id: Number(rows[0].id), passwordHash: String(rows[0].password_hash) } : null;
}

export async function countAdmins() {
  const c = await db();
  const { rows } = await c.execute("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'");
  return Number(rows[0].n);
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 120;
