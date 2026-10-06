// Обробка оригінальних фото зі старого сайту в єдиний теплий стиль.
// Запуск: node scripts/process-images.mjs
import sharp from "sharp";
import fs from "node:fs";

const SRC = "assets-src/original/";
const OUT = "public/images/";

// Теплий грейд: трохи приглушена насиченість, тепліший баланс, м'який контраст
const warm = (img) =>
  img
    .modulate({ saturation: 0.86, brightness: 1.01 })
    .recomb([
      [1.04, 0.02, 0.0],
      [0.01, 1.0, 0.0],
      [0.0, 0.02, 0.93],
    ])
    .linear(0.96, 6);

const photos = {
  "DSC_9654-1.png": "team-group",
  "DSC_9668-1.png": "team-archive",
  "DSC_9791-1.png": "team-desk",
  "DSC_9812-1.png": "team-office",
  "DSC_9882-1.png": "team-shelves",
};

for (const [file, name] of Object.entries(photos)) {
  const meta = await sharp(SRC + file).metadata();
  // В оригіналах «запечені» прозорі заокруглені кути (~24px) — обрізаємо їх
  const c = 16;
  const cropped = await sharp(SRC + file)
    .extract({ left: c, top: c, width: meta.width - c * 2, height: meta.height - c * 2 })
    .flatten({ background: "#F5F2EC" })
    .png()
    .toBuffer();
  await warm(sharp(cropped).resize({ width: (meta.width - c * 2) * 2, kernel: "lanczos3" }))
    .sharpen({ sigma: 0.9, m1: 0.6, m2: 1.4 })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(OUT + name + ".jpg");
  console.log("photo", name);
}

// Досвід: Євгенія за робочим столом (фото від клієнта, без прозорості)
{
  const src = "yevheniia-office.webp";
  const meta = await sharp(SRC + src).metadata();
  await warm(sharp(SRC + src).resize({ width: Math.round(meta.width * 1.6), kernel: "lanczos3" }))
    .sharpen({ sigma: 0.8, m1: 0.5, m2: 1.2 })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(OUT + "experience.jpg");
  console.log("photo experience");
}

// Вирізані портрети (апскейл від клієнта, 2000px заввишки):
// прибираємо «запечену» темну тінь (низька альфа + темні пікселі) та біле розмиття внизу.
async function cutout(file, name, { cutoff, keepRows, scale = 1 }) {
  const meta = await sharp(SRC + file).metadata();
  const base = keepRows
    ? sharp(SRC + file).extract({ left: 0, top: 0, width: meta.width, height: keepRows })
    : sharp(SRC + file);
  const { data, info } = await base.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    data[i + 3] = a < cutoff ? 0 : Math.round(((a - cutoff) / (255 - cutoff)) * 255);
  }
  const cleaned = await sharp(data, { raw: info }).png().toBuffer();
  const t = await sharp(cleaned).trim({ threshold: 1 }).png().toBuffer();
  const m = await sharp(t).metadata();
  let img = sharp(t);
  if (scale !== 1) img = img.resize({ width: Math.round(m.width * scale), kernel: "lanczos3" }).sharpen({ sigma: 0.8 });
  await warm(img).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(OUT + name + ".webp");
  console.log("cutout", name);
}
await cutout("yevheniia-portrait-hq.webp", "yevheniia-portrait", { cutoff: 80 });
await cutout("yevheniia-lace-hq.webp", "yevheniia-lace", { cutoff: 20, keepRows: 1812 });

// Логотип-монограма → біла маска на прозорому тлі (колір задається у CSS через mask-image)
{
  const { data, info } = await sharp(SRC + "logo-wb-1.png")
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    data[i] = data[i + 1] = data[i + 2] = 255;
  }
  const mask = await sharp(data, { raw: info }).png().toBuffer();
  const t = await sharp(mask).trim({ threshold: 1 }).png().toBuffer();
  // Маска відображається ~26×33px — тримаємо 3× запас і мінімальну вагу
  await sharp(t).resize({ height: 120 }).png({ compressionLevel: 9, palette: true }).toFile(OUT + "logo-mark.png");

  // Фавікон та apple-icon: смарагдова монограма на папері
  const tint = async (size, pad) => {
    const inner = size - pad * 2;
    const colored = await sharp(t)
      .resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .tint("#1F4D3A")
      .png()
      .toBuffer();
    const { data: d, info: inf } = await sharp(colored).raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < d.length; i += 4) {
      d[i] = 0x1f;
      d[i + 1] = 0x4d;
      d[i + 2] = 0x3a;
    }
    const solid = await sharp(d, { raw: inf }).png().toBuffer();
    return sharp({ create: { width: size, height: size, channels: 4, background: "#F5F2EC" } })
      .composite([{ input: solid, gravity: "center" }])
      .png();
  };
  await (await tint(256, 28)).png({ palette: true }).toFile("src/app/icon.png");
  await (await tint(180, 22)).toFile("src/app/apple-icon.png");
  console.log("logo");
}

fs.rmSync("src/app/favicon.ico", { force: true });
