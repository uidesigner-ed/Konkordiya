import { articles, categories, popular, type Article, type Block, type CategoryId } from "@/content/news";

/** Усі статті, від нових до старих */
export const allArticles: Article[] = [...articles].sort((a, b) => b.date.localeCompare(a.date));

export const NEWS_PATH = "/novyny";
export const articleHref = (slug: string) => `${NEWS_PATH}/${slug}`;
export const categoryHref = (id: CategoryId) => `${NEWS_PATH}?katehoriia=${id}`;

export function getArticle(slug: string) {
  return allArticles.find((a) => a.slug === slug);
}

export function categoryLabel(id: CategoryId) {
  return categories.find((c) => c.id === id)?.label ?? id;
}

export function categoryCounts() {
  return categories
    .map((c) => ({ ...c, count: allArticles.filter((a) => a.category === c.id).length }))
    .filter((c) => c.count > 0);
}

/** Номер статті в журналі: найстаріша — № 01 */
export function articleNumber(slug: string) {
  const i = allArticles.findIndex((a) => a.slug === slug);
  return String(allArticles.length - i).padStart(2, "0");
}

export function getPopular(exclude?: string, limit = 5) {
  const ranked = popular.map(getArticle).filter((a): a is Article => !!a);
  // Якщо рейтинг коротший за ліміт — доповнюємо найновішими
  const rest = allArticles.filter((a) => !ranked.includes(a));
  return [...ranked, ...rest].filter((a) => a.slug !== exclude).slice(0, limit);
}

export function getLatest(exclude?: string, limit = 4) {
  return allArticles.filter((a) => a.slug !== exclude).slice(0, limit);
}

/** Попередня = старіша, наступна = новіша */
export function getAdjacent(slug: string) {
  const i = allArticles.findIndex((a) => a.slug === slug);
  return { prev: allArticles[i + 1] ?? null, next: i > 0 ? allArticles[i - 1] : null };
}

/** «Читайте також»: та сама категорія → спільні теми → найновіші */
export function getRelated(article: Article, limit = 3) {
  const score = (a: Article) =>
    (a.category === article.category ? 10 : 0) + a.tags.filter((t) => article.tags.includes(t)).length * 3;
  return allArticles
    .filter((a) => a.slug !== article.slug)
    .map((a, i) => ({ a, s: score(a) - i * 0.01 }))
    .sort((x, y) => y.s - x.s)
    .slice(0, limit)
    .map((x) => x.a);
}

/* ── Текст ── */

const blockText = (b: Block): string => {
  switch (b.t) {
    case "ul":
    case "ol":
      return b.items.join(" ");
    case "check":
      return `${b.title} ${b.items.join(" ")}`;
    case "note":
      return b.text;
    default:
      return b.text;
  }
};

/** Час читання, хв (≈180 слів/хв для українського тексту) */
export function readingTime(a: Article) {
  const text = [a.title, a.excerpt, ...a.summary, ...a.body.map(blockText)].join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
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
