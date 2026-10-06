// Збирає скриншоти у листи 2×2 (desktop) або 4×1 (mobile) для рев'ю
import sharp from "sharp";
import fs from "node:fs";
const [dir, out, cols = "2", scale = "0.5"] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".png")).sort();
const C = Number(cols);
const per = C === 2 ? 4 : C;
fs.mkdirSync(out, { recursive: true });
for (let s = 0; s < files.length; s += per) {
  const batch = files.slice(s, s + per);
  const imgs = await Promise.all(
    batch.map(async (f) => {
      const m = await sharp(`${dir}/${f}`).metadata();
      const w = Math.round(m.width * Number(scale));
      const h = Math.round(m.height * Number(scale));
      return { buf: await sharp(`${dir}/${f}`).resize(w, h).png().toBuffer(), w, h, f };
    }),
  );
  const w = imgs[0].w, h = imgs[0].h;
  const rows = Math.ceil(imgs.length / C);
  const comp = [];
  imgs.forEach((im, k) => {
    comp.push({ input: im.buf, left: (k % C) * (w + 8), top: Math.floor(k / C) * (h + 28) + 24 });
    comp.push({
      input: Buffer.from(`<svg width="${w}" height="22"><text x="4" y="16" font-size="14" font-family="Arial">${im.f}</text></svg>`),
      left: (k % C) * (w + 8),
      top: Math.floor(k / C) * (h + 28) + 2,
    });
  });
  await sharp({ create: { width: C * (w + 8), height: rows * (h + 28), channels: 3, background: "#999" } })
    .composite(comp)
    .jpeg({ quality: 82 })
    .toFile(`${out}/sheet-${String(s / per).padStart(2, "0")}.jpg`);
}
console.log("ok", Math.ceil(files.length / per));
