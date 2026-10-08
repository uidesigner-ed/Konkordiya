import "server-only";
import { cache } from "react";
import type { Row } from "@libsql/client";
import { categories, covers, type Article, type ArticleSeo, type Block } from "@/content/news";
import { slugify } from "@/lib/translit";
import { sortArticles } from "@/lib/news";
import { db, parseJson } from "./db";

function toArticle(r: Row): Article {
  return {
    id: Number(r.id),
    status: r.status === "published" ? "published" : "draft",
    slug: String(r.slug),
    title: String(r.title),
    excerpt: String(r.excerpt),
    category: String(r.category) as Article["category"],
    tags: parseJson<string[]>(r.tags, []),
    date: String(r.date),
    updated: r.updated ? String(r.updated) : undefined,
    author: String(r.author),
    cover: String(r.cover) as Article["cover"],
    summary: parseJson<string[]>(r.summary, []),
    body: parseJson<Block[]>(r.body, []),
    popularRank: r.popular_rank == null ? null : Number(r.popular_rank),
    seo: parseJson<ArticleSeo>(r.seo, {}),
  };
}

/* ── Сайт ── */

/** Опубліковані статті від нових до старих (один запит на рендер) */
export const getPublishedArticles = cache(async () => {
  const c = await db();
  const { rows } = await c.execute("SELECT * FROM articles WHERE status = 'published'");
  return sortArticles(rows.map(toArticle));
});

/* ── Адмінка ── */

export async function listArticles() {
  const c = await db();
  const { rows } = await c.execute("SELECT * FROM articles");
  return sortArticles(rows.map(toArticle));
}

export async function getArticleById(id: number) {
  const c = await db();
  const { rows } = await c.execute({ sql: "SELECT * FROM articles WHERE id = ?", args: [id] });
  return rows[0] ? toArticle(rows[0]) : null;
}

export async function deleteArticle(id: number) {
  const c = await db();
  await c.execute({ sql: "DELETE FROM articles WHERE id = ?", args: [id] });
}

export type ArticleErrors = Partial<Record<string, string>>;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, maxItems: number, maxLen: number) =>
  Array.isArray(v) ? v.map((x) => str(x, maxLen)).filter(Boolean).slice(0, maxItems) : [];

/** Перевірка й нормалізація статті з редактора. Сирий текст — без HTML (React екранує все). */
export function validateArticle(raw: unknown): { data: Article; errors: ArticleErrors } {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: ArticleErrors = {};

  const title = str(o.title, 160);
  if (title.length < 5) errors.title = "Заголовок — щонайменше 5 символів";

  const slug = slugify(str(o.slug, 120) || title);
  if (!slug) errors.slug = "Вкажіть адресу сторінки";

  const excerpt = str(o.excerpt, 320);
  if (excerpt.length < 20) errors.excerpt = "Лід — 1–2 речення, щонайменше 20 символів";

  const category = str(o.category, 20);
  if (!categories.some((c) => c.id === category)) errors.category = "Оберіть категорію";

  const cover = str(o.cover, 20);
  const date = str(o.date, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) errors.date = "Дата у форматі РРРР-ММ-ДД";
  const updatedRaw = str(o.updated, 10);
  const updated = /^\d{4}-\d{2}-\d{2}$/.test(updatedRaw) ? updatedRaw : undefined;

  const author = str(o.author, 80) || "Команда «Конкордії»";

  // Блоки: лише відомі типи; id підзаголовків — з тексту, унікальні в межах статті
  const ids = new Set<string>();
  const body: Block[] = [];
  for (const b of Array.isArray(o.body) ? o.body.slice(0, 300) : []) {
    const x = (b ?? {}) as Record<string, unknown>;
    switch (x.t) {
      case "p": {
        const text = str(x.text, 6000);
        if (text) body.push({ t: "p", text });
        break;
      }
      case "h2": {
        const text = str(x.text, 200);
        if (!text) break;
        const base = slugify(text, 60) || "rozdil";
        let id = base;
        for (let k = 2; ids.has(id); k++) id = `${base}-${k}`;
        ids.add(id);
        body.push({ t: "h2", id, text });
        break;
      }
      case "ul":
      case "ol": {
        const items = list(x.items, 50, 2000);
        if (items.length) body.push({ t: x.t, items });
        break;
      }
      case "check": {
        const items = list(x.items, 40, 400);
        if (items.length) body.push({ t: "check", title: str(x.title, 160) || "Чек-лист", items });
        break;
      }
      case "note": {
        const text = str(x.text, 3000);
        if (text) body.push({ t: "note", label: str(x.label, 40) || "Важливо", text });
        break;
      }
      case "quote": {
        const text = str(x.text, 1000);
        if (text) body.push({ t: "quote", text, ...(str(x.cite, 160) ? { cite: str(x.cite, 160) } : {}) });
        break;
      }
    }
  }
  if (!body.length) errors.body = "Додайте текст статті";

  const s = (o.seo && typeof o.seo === "object" ? o.seo : {}) as Record<string, unknown>;
  const canonical = str(s.canonical, 300);
  if (canonical && !/^https:\/\/[^\s]+$/.test(canonical)) errors.canonical = "Канонічна адреса — повний URL з https://";
  const seo: ArticleSeo = {
    title: str(s.title, 120) || undefined,
    description: str(s.description, 320) || undefined,
    keyword: str(s.keyword, 80) || undefined,
    canonical: canonical || undefined,
    noindex: s.noindex === true || undefined,
    ogTitle: str(s.ogTitle, 120) || undefined,
    ogDescription: str(s.ogDescription, 320) || undefined,
  };

  const rank = Number(o.popularRank);
  const data: Article = {
    id: Number(o.id) > 0 ? Number(o.id) : undefined,
    status: o.status === "published" ? "published" : "draft",
    slug,
    title,
    excerpt,
    category: category as Article["category"],
    tags: list(o.tags, 8, 40),
    date,
    updated,
    author,
    cover: (covers.some((c) => c.id === cover) ? cover : "stack") as Article["cover"],
    summary: list(o.summary, 5, 300),
    body,
    popularRank: Number.isInteger(rank) && rank >= 1 && rank <= 20 ? rank : null,
    seo,
  };
  return { data, errors };
}

/** Створити або оновити; повертає id або помилки (зокрема зайнятий slug) */
export async function saveArticle(a: Article, userId: number): Promise<{ id: number } | { errors: ArticleErrors }> {
  const c = await db();
  const clash = await c.execute({
    sql: "SELECT id FROM articles WHERE slug = ? AND id != ?",
    args: [a.slug, a.id ?? 0],
  });
  if (clash.rows.length) return { errors: { slug: "Така адреса вже є в іншої статті" } };

  const now = Date.now();
  const values = [
    a.slug,
    a.status ?? "draft",
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
    a.popularRank ?? null,
    JSON.stringify(a.seo ?? {}),
    now,
    userId,
  ];
  if (a.id) {
    await c.execute({
      sql: `UPDATE articles SET slug=?, status=?, title=?, excerpt=?, category=?, tags=?, date=?, updated=?, author=?, cover=?,
            summary=?, body=?, popular_rank=?, seo=?, updated_at=?, updated_by=? WHERE id = ?`,
      args: [...values, a.id],
    });
    return { id: a.id };
  }
  const r = await c.execute({
    sql: `INSERT INTO articles (slug, status, title, excerpt, category, tags, date, updated, author, cover, summary, body,
          popular_rank, seo, updated_at, updated_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [...values, now],
  });
  return { id: Number(r.lastInsertRowid) };
}
