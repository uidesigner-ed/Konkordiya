// Скриншоти секцій для арт-рев'ю: node scripts/shots.mjs <out-dir> [vp...]
import { chromium } from "playwright";
import fs from "node:fs";

const OUT = process.argv[2] ?? "shots";
const URL = process.env.URL ?? "http://localhost:3000/";
const all = {
  desktop: { width: 1440, height: 900, dpr: 1 },
  mobile: { width: 390, height: 844, dpr: 2, mobile: true },
  tablet: { width: 768, height: 1024, dpr: 1, mobile: true },
  wide: { width: 1920, height: 1080, dpr: 1 },
  small: { width: 360, height: 740, dpr: 2, mobile: true },
};
const pick = process.argv.slice(3);
const vps = pick.length ? pick : ["desktop", "mobile"];
const ids = ["top", "z-kym-pratsiuiemo", "poslugy", "suprovid", "dodatkovo", "viiskovym", "perevagy", "etapy", "dosvid", "komanda", "vidguky", "kontakty", "footer"];

const browser = await chromium.launch();
for (const name of vps) {
  const vp = all[name];
  const dir = `${OUT}/${name}`;
  fs.mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dpr,
    isMobile: !!vp.mobile,
    hasTouch: !!vp.mobile,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${dir}/00-preloader.png` });
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${dir}/01-hero.png` });

  const scrollTo = (y) =>
    page.evaluate((y) => {
      const l = window.__lenis;
      if (l) l.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    }, y);

  // прогін донизу, щоб спрацювали всі тригери
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += Math.round(vp.height * 0.45)) {
    await scrollTo(y);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(600);

  let i = 2;
  for (const id of ids) {
    const top = await page.evaluate((id) => {
      const el = id === "footer" ? document.querySelector("footer") : document.getElementById(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY, h: r.height };
    }, id);
    if (!top) continue;
    const steps = id === "etapy" ? [0, 0.3, 0.55, 0.8] : top.h > vp.height * 1.4 ? [0, 0.5, 1] : [0];
    for (const [k, f] of steps.entries()) {
      const y = id === "etapy" ? top.top + f * (top.h - vp.height) : top.top + f * vp.height * (top.h / vp.height - 1) * 0.5 * (k ? 1 : 0) + k * vp.height * 0.0;
      const target = id === "etapy" ? y : top.top + k * vp.height * 0.95;
      await scrollTo(Math.max(0, Math.round(target)));
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${dir}/${String(i).padStart(2, "0")}-${id}-${k}.png` });
    }
    i++;
  }
  const overflow = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth }));
  console.log(name, "overflow", JSON.stringify(overflow), "errors", errors.slice(0, 5));
  await ctx.close();
}
await browser.close();
