/**
 * Створює адміністратора або скидає йому пароль — з ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME.
 * Потрібно, коли сайт уже запускався: автоматично адміністратор створюється лише в порожній базі.
 * Також знімає блокування входу після невдалих спроб і завершує старі сесії цього користувача.
 *
 *   node --env-file=.env scripts/set-admin.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";
const name = process.env.ADMIN_NAME?.trim() || "Адміністратор";

if (!email || !password) {
  console.error("✗ У .env немає ADMIN_EMAIL або ADMIN_PASSWORD");
  process.exit(1);
}
if (password.length < 10 || !/\d/.test(password) || !/[a-zа-яіїєґ]/i.test(password)) {
  console.error("✗ Пароль: щонайменше 10 символів, літери й цифри");
  process.exit(1);
}

const url = process.env.DATABASE_URL || `file:${path.join(process.cwd(), "data", "konkordia.db")}`;
if (url.startsWith("file:") && !fs.existsSync(url.slice(5))) {
  console.error("✗ Бази ще немає. Запустіть сайт і відкрийте його в браузері, потім повторіть.");
  process.exit(1);
}
const c = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });

// Той самий формат, що й у src/lib/server/password.ts
const N = 32768;
const salt = crypto.randomBytes(16);
const key = crypto.scryptSync(password.normalize("NFKC"), salt, 64, { N, r: 8, p: 1, maxmem: 256 * N * 8 });
const hash = `scrypt$${N}$8$1$${salt.toString("base64")}$${key.toString("base64")}`;

const { rows } = await c.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [email] });
let id;
if (rows[0]) {
  id = Number(rows[0].id);
  await c.execute({ sql: "UPDATE users SET password_hash = ?, role = 'admin' WHERE id = ?", args: [hash, id] });
  await c.execute({ sql: "DELETE FROM sessions WHERE user_id = ?", args: [id] });
  console.log(`✓ Пароль оновлено, роль — адміністратор: ${email}`);
} else {
  const r = await c.execute({
    sql: "INSERT INTO users (email, name, role, password_hash, created_at) VALUES (?, ?, 'admin', ?, ?)",
    args: [email, name, hash, Date.now()],
  });
  id = Number(r.lastInsertRowid);
  console.log(`✓ Створено адміністратора: ${email}`);
}
// Знімаємо блокування входу (і за поштою, і за IP — після перебору паролів)
await c.execute("DELETE FROM login_attempts");

const all = await c.execute("SELECT email, role FROM users ORDER BY id");
console.log("Користувачі в базі:", all.rows.map((u) => `${u.email} (${u.role})`).join(", "));
