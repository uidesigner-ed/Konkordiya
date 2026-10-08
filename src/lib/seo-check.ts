import { translit } from "./translit";

/**
 * Проста перевірка ключового запиту для редактора: де він є і чи немає перенасичення.
 * Українська відмінюється, тому порівнюємо за основами слів (без 1–2 останніх літер) — це приблизна оцінка.
 */

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’'ʼ`*]/g, "")
    .replace(/[^a-zа-яіїєґ0-9\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

function stem(word: string) {
  if (word.length > 6) return word.slice(0, -2);
  if (word.length > 4) return word.slice(0, -1);
  return word;
}

const STOP = new Set(["для", "та", "і", "й", "в", "у", "на", "з", "із", "зі", "до", "по", "від", "про", "або", "чи", "як", "що", "це"]);

/** Значущі основи запиту (без службових слів; абревіатури на кшталт «ФОП» лишаються) */
export function keywordStems(keyword: string) {
  return norm(keyword)
    .split(" ")
    .filter((w) => w.length >= 3 && !STOP.has(w))
    .map(stem);
}

export function hasKeyword(text: string, keyword: string) {
  const stems = keywordStems(keyword);
  if (!stems.length) return false;
  const t = norm(text);
  return stems.every((s) => t.includes(s));
}

/** Скільки разів трапляється найдовша основа запиту та частка від усіх слів, % */
export function keywordDensity(text: string, keyword: string) {
  const words = norm(text).split(" ").filter(Boolean);
  const stems = keywordStems(keyword).sort((a, b) => b.length - a.length);
  if (!words.length || !stems.length) return { count: 0, density: 0, words: words.length };
  const main = stems[0];
  const count = words.filter((w) => w.startsWith(main)).length;
  return { count, density: (count / words.length) * 100, words: words.length };
}

export type Check = { ok: boolean; warn?: boolean; text: string };

export function analyzeArticle(input: {
  keyword: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  firstParagraph: string;
  headings: string[];
  fullText: string;
}): Check[] {
  const kw = input.keyword.trim();
  if (!kw) return [];
  const d = keywordDensity(input.fullText, kw);
  const slugHit = keywordStems(kw).some((s) => input.slug.includes(translit(s).slice(0, 5)));
  return [
    { ok: hasKeyword(input.seoTitle, kw), text: "Запит є в SEO Title" },
    { ok: hasKeyword(input.title, kw), text: "Запит є в заголовку H1" },
    { ok: hasKeyword(input.seoDescription, kw), text: "Запит є в Meta Description" },
    { ok: hasKeyword(input.firstParagraph, kw), text: "Запит є на початку тексту (лід або перший абзац)" },
    { ok: input.headings.some((h) => hasKeyword(h, kw)), text: "Запит є хоча б в одному підзаголовку H2" },
    { ok: slugHit, text: "Запит відображено в URL" },
    d.density > 3
      ? { ok: false, warn: true, text: `Перенасичення: запит ~${d.count} раз (${d.density.toFixed(1)}% тексту). Краще до 2–3%.` }
      : d.count === 0
        ? { ok: false, text: "Запит не трапляється в тексті" }
        : { ok: true, text: `Щільність у межах норми: ~${d.count} раз (${d.density.toFixed(1)}%)` },
  ];
}
