/**
 * Транслітерація українського тексту латиницею за офіційною системою (Постанова КМУ № 55, 2010)
 * — для зрозумілих URL статей і якорів підзаголовків.
 */

const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie", ж: "zh", з: "z", и: "y", і: "i",
  ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "iu", я: "ia",
  // латиниця/інше — як є; російські літери — за подібністю
  ё: "io", ы: "y", э: "e", ъ: "",
};
/** На початку слова: є → ye, ї → yi, й → y, ю → yu, я → ya */
const START: Record<string, string> = { є: "ye", ї: "yi", й: "y", ю: "yu", я: "ya" };

export function translit(input: string) {
  const s = input.toLowerCase().replace(/[’'ʼ`]/g, "");
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const prev = s[i - 1];
    const atStart = i === 0 || !/[а-яґєії]/.test(prev ?? "");
    // «зг» → «zgh», щоб не плутати з «ж»
    if (ch === "г" && prev === "з") {
      out += "gh";
      continue;
    }
    if (atStart && START[ch]) out += START[ch];
    else if (ch in MAP) out += MAP[ch];
    else out += ch;
  }
  return out;
}

/** Slug для URL: латиниця, цифри, дефіси; до 80 символів по межі слова */
export function slugify(input: string, max = 80) {
  const s = translit(input)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return cut.slice(0, cut.lastIndexOf("-") > 20 ? cut.lastIndexOf("-") : max).replace(/-+$/, "");
}
