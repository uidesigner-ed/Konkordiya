// Генерує public/og.jpg (1200×630) з scripts/og.html: node scripts/og.mjs
import { chromium } from "playwright";
import path from "node:path";
import sharp from "sharp";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto("file://" + path.resolve("scripts/og.html"));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
const png = await page.screenshot();
await sharp(png).jpeg({ quality: 88, mozjpeg: true }).toFile("public/og.jpg");
await browser.close();
console.log("public/og.jpg");
