import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/config/site";
import "./globals.css";

// Шрифти — самохостингові підмножини (scripts/build-fonts.mjs): повна українська абетка
// (і, ї, є, ґ) + латиниця + типографіка, статичні накреслення з variable-джерел (OFL).
const unbounded = localFont({
  src: [{ path: "../fonts/unbounded-500.woff2", weight: "500", style: "normal" }],
  variable: "--font-unbounded",
  display: "swap",
  fallback: ["Arial Black", "sans-serif"],
});
const cormorant = localFont({
  src: [{ path: "../fonts/cormorant-italic-500.woff2", weight: "500", style: "italic" }],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "serif"],
});
const onest = localFont({
  src: [
    { path: "../fonts/onest-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/onest-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-onest",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "sans-serif"],
});
// Моно — лише цифри (лічильники, номери аркушів, телефон)
const jetbrains = localFont({
  src: [
    { path: "../fonts/jetbrains-mono-300.woff2", weight: "300", style: "normal" },
    { path: "../fonts/jetbrains-mono-400.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-jetbrains",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

/** Спільна база; title / description / OG кожна сторінка задає сама (lib/server/seo.ts) */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  authors: [{ name: site.founder }],
  formatDetection: { telephone: true, email: true, address: true },
};

export const viewport: Viewport = {
  themeColor: "#F5F2EC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="uk"
      suppressHydrationWarning
      className={`${unbounded.variable} ${cormorant.variable} ${onest.variable} ${jetbrains.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
