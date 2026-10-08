import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { articles as seedArticles, popular as seedPopular } from "@/content/news-seed";

/**
 * База даних — SQLite-сумісний libSQL:
 *  • локально — файл data/konkordia.db (створюється сам);
 *  • на продакшні — Turso: DATABASE_URL=libsql://…  DATABASE_AUTH_TOKEN=…
 * Таблиці створюються автоматично, стартові статті та перший адміністратор — теж (див. bootstrap).
 */

let client: Client | null = null;
let ready: Promise<void> | null = null;

/** На Vercel без підключеної бази дані живуть у /tmp і зникають після перезапуску */
export const dbIsEphemeral = () => !process.env.DATABASE_URL && !!process.env.VERCEL;

function makeClient() {
  const url = process.env.DATABASE_URL;
  if (url) return createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  const dir = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return createClient({ url: `file:${path.join(dir, "konkordia.db")}` });
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor',
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    last_login_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'draft',
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    date TEXT NOT NULL,
    updated TEXT,
    author TEXT NOT NULL,
    cover TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '[]',
    body TEXT NOT NULL DEFAULT '[]',
    popular_rank INTEGER,
    seo TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    updated_by INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS page_seo (
    path TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    contact TEXT,
    service TEXT,
    message TEXT,
    page TEXT,
    utm TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    ip_hash TEXT,
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS leads_created ON leads(created_at)`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    first_at INTEGER NOT NULL,
    locked_until INTEGER
  )`,
];

async function migrate(c: Client) {
  if (!process.env.DATABASE_URL) {
    // Кілька процесів збірки відкривають один файл — чекаємо на блокування, а не падаємо
    await c.execute("PRAGMA busy_timeout = 15000").catch(() => {});
    await c.execute("PRAGMA journal_mode = WAL").catch(() => {});
  }
  await c.batch(SCHEMA, "write");
  await bootstrap(c);
}

/** Перший запуск: стартові статті й перший адміністратор (з ADMIN_EMAIL / ADMIN_PASSWORD) */
async function bootstrap(c: Client) {
  const { rows } = await c.execute("SELECT (SELECT COUNT(*) FROM articles) AS a, (SELECT COUNT(*) FROM users) AS u");
  const now = Date.now();

  if (Number(rows[0].a) === 0) {
    await c.batch(
      seedArticles.map((a) => {
        const rank = seedPopular.indexOf(a.slug);
        return {
          sql: `INSERT OR IGNORE INTO articles
            (slug, status, title, excerpt, category, tags, date, updated, author, cover, summary, body, popular_rank, seo, created_at, updated_at)
            VALUES (?, 'published', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '{}', ?, ?)`,
          args: [
            a.slug,
            a.title,
            a.excerpt,
            a.category,
            JSON.stringify(a.tags),
            a.date,
            a.updated ?? null,
            a.author,
            a.cover,
            JSON.stringify(a.summary),
            JSON.stringify(a.body),
            rank >= 0 ? rank + 1 : null,
            now,
            now,
          ],
        };
      }),
      "write",
    );
  }

  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (Number(rows[0].u) === 0 && email && password) {
    const { hashPassword } = await import("./password");
    await c.execute({
      sql: "INSERT OR IGNORE INTO users (email, name, role, password_hash, created_at) VALUES (?, ?, 'admin', ?, ?)",
      args: [email, process.env.ADMIN_NAME?.trim() || "Адміністратор", await hashPassword(password), now],
    });
  }
}

export async function db(): Promise<Client> {
  if (!client) client = makeClient();
  if (!ready) {
    ready = migrate(client).catch((e) => {
      ready = null;
      throw e;
    });
  }
  await ready;
  return client;
}

/** JSON із бази з запасним значенням */
export function parseJson<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== "string" || !raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
