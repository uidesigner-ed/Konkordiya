import { categories, type Article, type Block, type CategoryId } from "@/content/news";

/**
 * Чисті функції над списком статей (список приходить із бази — lib/server/articles.ts).
 * Без звернень до БД, тож придатні й для клієнтських компонентів.
 */

export const NEWS_PATH = "/novyny";
export const articleHref = (slug: string) => `${NEWS_PATH}/${slug}`;
export const categoryHref = (id: CategoryId) => `${NEWS_PATH}?katehoriia=${id}`;

/** Від нових до старих */
export function sortArticles(list: Article[]) {
  return [...list].sort((a, b) => b.date.localeCompare(a.date) || (b.id ?? 0) - (a.id ?? 0));
}

export function categoryLabel(id: string) {
  return categories.find((c) => c.id === id)?.label ?? id;
}

export function categoryCounts(list: Article[]) {
  return categories
    .map((c) => ({ id: c.id as string, label: c.label as string, count: list.filter((a) => a.category === c.id).length }))
    .filter((c) => c.count > 0);
}

/** Номер статті в журналі: найстаріша — № 01 (список — від нових до старих) */
export function articleNumber(list: Article[], slug: string) {
  const i = list.findIndex((a) => a.slug === slug);
  return String(i < 0 ? list.length + 1 : list.length - i).padStart(2, "0");
}

/** «Популярне»: спершу за ручним рейтингом, далі — найновіші */
export function getPopular(list: Article[], exclude?: string, limit = 5) {
  const ranked = list
    .filter((a) => a.popularRank != null)
    .sort((a, b) => (a.popularRank ?? 0) - (b.popularRank ?? 0));
  const rest = list.filter((a) => a.popularRank == null);
  return [...ranked, ...rest].filter((a) => a.slug !== exclude).slice(0, limit);
}

export function getLatest(list: Article[], exclude?: string, limit = 4) {
  return list.filter((a) => a.slug !== exclude).slice(0, limit);
}

/** Попередня = старіша, наступна = новіша */
export function getAdjacent(list: Article[], slug: string) {
  const i = list.findIndex((a) => a.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return { prev: list[i + 1] ?? null, next: i > 0 ? list[i - 1] : null };
}

/** «Читайте також»: та сама категорія → спільні теми → найновіші */
export function getRelated(list: Article[], article: Article, limit = 3) {
  const score = (a: Article) =>
    (a.category === article.category ? 10 : 0) + a.tags.filter((t) => article.tags.includes(t)).length * 3;
  return list
    .filter((a) => a.slug !== article.slug)
    .map((a, i) => ({ a, s: score(a) - i * 0.01 }))
    .sort((x, y) => y.s - x.s)
    .slice(0, limit)
    .map((x) => x.a);
}

/* ── Текст ── */

export function blockText(b: Block): string {
  switch (b.t) {
    case "ul":
    case "ol":
      return b.items.join(" ");
    case "check":
      return `${b.title} ${b.items.join(" ")}`;
    case "quote":
      return `${b.text} ${b.cite ?? ""}`;
    default:
      return b.text;
  }
}

/** Увесь текст статті — для часу читання та SEO-перевірок */
export function articleText(a: Pick<Article, "title" | "excerpt" | "summary" | "body">) {
  return [a.title, a.excerpt, ...a.summary, ...a.body.map(blockText)].join(" ").replace(/\*\*/g, "");
}

/** Час читання, хв (≈180 слів/хв для українського тексту) */
export function readingTime(a: Pick<Article, "title" | "excerpt" | "summary" | "body">) {
  const words = articleText(a).split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 180));
}

export function toc(a: Article) {
  return a.body.filter((b): b is Extract<Block, { t: "h2" }> => b.t === "h2").map((b) => ({ id: b.id, text: b.text }));
}

/** Пошуковий рядок статті (для фільтра на клієнті) */
export function searchText(a: Article) {
  return [a.title, a.excerpt, categoryLabel(a.category), ...a.tags].join(" ").toLowerCase();
}

/* ── Дати ── */

const MONTHS = [
  "січня",
  "лютого",
  "березня",
  "квітня",
  "травня",
  "червня",
  "липня",
  "серпня",
  "вересня",
  "жовтня",
  "листопада",
  "грудня",
];

/** «1 жовтня 2026» — однаково на сервері та клієнті */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** «01.10.2026» — для моно-цифр */
export function formatDateNum(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** 1 матеріал · 2 матеріали · 5 матеріалів */
export function plural(n: number, forms: [string, string, string]) {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1];
  return forms[2];
}
