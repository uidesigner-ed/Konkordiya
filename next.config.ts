import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Корінь проєкту — ця тека (інакше Turbopack шукає lock-файли вище за деревом)
  turbopack: { root: path.join(__dirname) },
  // inlineCss вимкнено: Next дублює вбудований CSS ще й у RSC-даних сторінки (×3 до ваги HTML),
  // окремий кешований файл стилів виходить швидшим (заміри Lighthouse, жовтень 2026)
  experimental: {
    inlineCss: false,
  },
  images: {
    // WebP кодується в рази швидше за AVIF — перший показ фото без затримки оптимізатора
    formats: ["image/webp"],
    qualities: [75, 85],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920, 2560],
  },
};

export default nextConfig;
