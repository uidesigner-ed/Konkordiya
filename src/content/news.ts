/**
 * Розділ «Новини»: категорії, типи та підписи інтерфейсу (легкий модуль — потрапляє і в браузер).
 * Статті живуть у базі даних і редагуються в адмінці (/admin/articles);
 * стартове наповнення — у news-seed.ts (лише для сервера).
 *
 * Розмітка тексту: **жирний**. Блоки тіла статті:
 *   p — абзац, h2 — підзаголовок (id — якір для змісту), ul / ol — списки,
 *   check — чек-лист із заголовком, note — примітка, quote — цитата.
 */

import type { Rich } from "./uk";

export const categories = [
  { id: "podatky", label: "Податки" },
  { id: "fop", label: "ФОП" },
  { id: "oblik", label: "Облік" },
  { id: "kadry", label: "Кадри та зарплата" },
  { id: "hranty", label: "Гранти" },
  { id: "fondy", label: "Благодійні фонди" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

/** Мотив обкладинки (див. components/news/NewsCover.tsx) */
export type CoverId =
  | "fork"
  | "calendar"
  | "stack"
  | "lens"
  | "rebuild"
  | "scale"
  | "shield"
  | "steps"
  | "donut"
  | "nodes";

/** Мотиви обкладинок для вибору в адмінці */
export const covers: { id: CoverId; label: string }[] = [
  { id: "fork", label: "Розвилка (вибір)" },
  { id: "calendar", label: "Календар" },
  { id: "stack", label: "Документи" },
  { id: "lens", label: "Лупа (перевірка)" },
  { id: "rebuild", label: "Відновлення" },
  { id: "scale", label: "Терези" },
  { id: "shield", label: "Захист" },
  { id: "steps", label: "Сходи (зростання)" },
  { id: "donut", label: "Діаграма" },
  { id: "nodes", label: "Команда" },
];

export const blockTypes = [
  { t: "p", label: "Абзац" },
  { t: "h2", label: "Підзаголовок" },
  { t: "ul", label: "Список" },
  { t: "ol", label: "Нумерований список" },
  { t: "check", label: "Чек-лист" },
  { t: "note", label: "Примітка" },
  { t: "quote", label: "Цитата" },
] as const;

export type Block =
  | { t: "p"; text: string }
  | { t: "h2"; id: string; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "check"; title: string; items: string[] }
  | { t: "note"; label: string; text: string }
  | { t: "quote"; text: string; cite?: string };

/** SEO-поля статті (порожнє — береться із заголовка та ліду) */
export type ArticleSeo = {
  title?: string;
  description?: string;
  /** Головний ключовий запит — для перевірки в адмінці */
  keyword?: string;
  canonical?: string;
  noindex?: boolean;
  ogTitle?: string;
  ogDescription?: string;
};

export type Article = {
  /** Ідентифікатор у базі (немає у стартового наповнення) */
  id?: number;
  status?: "draft" | "published";
  /** Місце в блоці «Популярне» (1 — перше), null — не показувати */
  popularRank?: number | null;
  seo?: ArticleSeo;
  slug: string;
  title: string;
  /** Лід: 1–2 речення — під заголовком, у картці та в meta description */
  excerpt: string;
  category: CategoryId;
  tags: string[];
  /** Дата публікації, YYYY-MM-DD */
  date: string;
  /** Дата оновлення, якщо статтю редагували */
  updated?: string;
  author: string;
  cover: CoverId;
  /** «Коротко»: 2–4 головні тези */
  summary: string[];
  body: Block[];
};

export const newsUi = {
  navLabel: "Новини",
  title: "Новини",
  titleItal: "та статті",
  lead: "Пояснюємо зміни в податках, обліку та звітності простою мовою — для ФОП, компаній і благодійних фондів.",
  metaTitle: "Новини та статті про податки й облік — Конкордія",
  metaDescription:
    "Корисні статті від бухгалтерської компанії «Конкордія»: системи оподаткування, ФОП, звітність, кадровий облік, фінмоніторинг, гранти для військових і облік благодійних фондів.",
  home: "Головна",
  all: "Усі",
  featured: "Головне",
  filter: "Категорії",
  search: "Пошук статей",
  searchPlaceholder: "Пошук за темою",
  found: "Знайдено",
  empty: "За вашим запитом нічого не знайдено",
  reset: "Скинути фільтри",
  more: "Показати ще",
  read: "Читати",
  readArticle: "Читати статтю",
  minutes: "хв читання",
  popular: "Популярне",
  latest: "Нові",
  allNews: "Усі новини",
  backToFeed: "Повернутися до стрічки",
  toc: "Зміст",
  summary: "Коротко",
  share: "Поділитися",
  copy: "Копіювати посилання",
  copied: "Посилання скопійовано",
  tags: "Теми",
  updated: "Оновлено",
  published: "Опубліковано",
  prev: "Попередня стаття",
  next: "Наступна стаття",
  related: ["Читайте ", { i: "також" }] as Rich,
  progress: "Прочитано",
  disclaimer:
    "Матеріал має інформаційний характер і не є індивідуальною консультацією. Законодавство змінюється — перед ухваленням рішень зверніться до бухгалтера.",
  cta: {
    title: ["Потрібна консультація ", { i: "щодо вашої ситуації?" }] as Rich,
    text: "Напишіть нам у зручний месенджер — фахівець відповість на Ваші запитання та допоможе обрати оптимальне рішення.",
  },
} as const;
