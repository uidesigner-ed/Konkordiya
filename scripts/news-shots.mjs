// Скриншоти розділу «Новини» для рев'ю: node scripts/news-shots.mjs <out-dir> [vp...]
import { chromium } from "playwright";
import fs from "node:fs";

const OUT = process.argv[2] ?? "shots-news";
const BASE = process.env.URL ?? "http://localhost:3000";
const all = {
  desktop: { width: 1440, height: 900, dpr: 1 },
  laptop: { width: 1280, height: 800, dpr: 1 },
  lg: { width: 1024, height: 768, dpr: 1 },
  tablet: { width: 768, height: 1024, dpr: 1, mobile: true },
  mobile: { width: 390, height: 844, dpr: 2, mobile: true },
  small: { width: 360, height: 740, dpr: 2, mobile: true },
  wide: { width: 1920, height: 1080, dpr: 1 },
};
const pages = (process.env.PAGES ?? "/novyny,/novyny/yak-obraty-systemu-opodatkuvannia").split(",");
const pick = process.argv.slice(3);
const vps = pick.length ? pick : ["desktop", "mobile"];

const browser = await chromium.launch();
for (const name of vps) {
  const vp = all[name];
  fs.mkdirSync(`${OUT}/${name}`, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dpr,
    isMobile: !!vp.mobile,
    hasTouch: !!vp.mobile,
  });
  for (const path of pages) {
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1800);
    const slug = path.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "home";
    await page.screenshot({ path: `${OUT}/${name}/${slug}-0-first.png` });
    // Прокручуємо донизу кроками, щоб спрацювали появи
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += Math.round(vp.height * 0.6)) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(220);
    }
    await page.waitForTimeout(1400);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${name}/${slug}-full.png`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(name, path, "overflowX:", overflow, errors.length ? "ERRORS: " + errors.join(" | ") : "no errors");
    await page.close();
  }
  await ctx.close();
}
await browser.close();
