import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Односторінковий лендінг: CSS у <head> замість блокуючого запиту
  experimental: {
    inlineCss: true,
  },
  images: {
    // WebP кодується в рази швидше за AVIF — перший показ фото без затримки оптимізатора
    formats: ["image/webp"],
    qualities: [75, 85],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920, 2560],
  },
};

export default nextConfig;
