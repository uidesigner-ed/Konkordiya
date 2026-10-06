// Збирає самохостингові шрифти: статичні накреслення з variable-джерел,
// підмножина = повна українська абетка + базова латиниця + типографіка + усі символи контенту.
// Запуск: node scripts/build-fonts.mjs   (після зміни текстів з новими символами — перезапустити)
import fs from "node:fs";
import path from "node:path";
import subsetFont from "subset-font";

const SRC = "fonts-src";
const OUT = "src/fonts";
const GH = "https://raw.githubusercontent.com/google/fonts/main/ofl";

const sources = {
  unbounded: { file: "Unbounded[wght].ttf", url: `${GH}/unbounded/Unbounded%5Bwght%5D.ttf`, lic: `${GH}/unbounded/OFL.txt` },
  onest: { file: "Onest[wght].ttf", url: `${GH}/onest/Onest%5Bwght%5D.ttf`, lic: `${GH}/onest/OFL.txt` },
  cormorant: {
    file: "CormorantGaramond-Italic[wght].ttf",
    url: `${GH}/cormorantgaramond/CormorantGaramond-Italic%5Bwght%5D.ttf`,
    lic: `${GH}/cormorantgaramond/OFL.txt`,
  },
  jetbrains: { file: "JetBrainsMono[wght].ttf", url: `${GH}/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf`, lic: `${GH}/jetbrainsmono/OFL.txt` },
};

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)).join("");
const ukrainian = range(0x410, 0x44f) + "ЄєІіЇїҐґЁё’ʼ";
const latin = range(0x20, 0x7e);
const typo = "«»„“”‘’—–‑…№₴%‰×·•©®™€$°′″   →←↗";
const contentChars = ["src/content/uk.ts", "src/config/site.ts"].map((f) => fs.readFileSync(f, "utf8")).join("");
const textChars = [...new Set([...(ukrainian + latin + typo + contentChars)])].filter((c) => c >= " ").join("");
// Моно на сайті — лише цифри та службові знаки (номери, лічильники, телефон)
const monoChars = "0123456789+-−()/.,:%№ " + "\u00a0";

const builds = [
  { src: "unbounded", out: "unbounded-500.woff2", wght: 500, text: textChars },
  { src: "onest", out: "onest-400.woff2", wght: 400, text: textChars },
  { src: "onest", out: "onest-500.woff2", wght: 500, text: textChars },
  { src: "cormorant", out: "cormorant-italic-500.woff2", wght: 500, text: textChars },
  { src: "jetbrains", out: "jetbrains-mono-300.woff2", wght: 300, text: monoChars },
  { src: "jetbrains", out: "jetbrains-mono-400.woff2", wght: 400, text: monoChars },
];

fs.mkdirSync(SRC, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

for (const [key, s] of Object.entries(sources)) {
  const p = path.join(SRC, s.file);
  if (!fs.existsSync(p)) {
    const res = await fetch(s.url);
    if (!res.ok) throw new Error(`Не вдалося завантажити ${s.url}`);
    fs.writeFileSync(p, Buffer.from(await res.arrayBuffer()));
  }
  const lic = path.join(OUT, `${key}-OFL.txt`);
  if (!fs.existsSync(lic)) {
    const res = await fetch(s.lic);
    fs.writeFileSync(lic, await res.text());
  }
}

for (const b of builds) {
  const input = fs.readFileSync(path.join(SRC, sources[b.src].file));
  const out = await subsetFont(input, b.text, { targetFormat: "woff2", variationAxes: { wght: b.wght } });
  fs.writeFileSync(path.join(OUT, b.out), out);
  console.log(b.out.padEnd(28), `${(out.length / 1024).toFixed(1)} KB`);
}
