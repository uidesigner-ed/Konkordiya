import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site } from "@/config/site";
import { content } from "@/content/uk";
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

const title = "Конкордія — бухгалтерські послуги в Харкові | Євгенія Турковська";
const description =
  "Бухгалтерські рішення для бізнесу від Євгенії Турковської: супровід ФОП, ТОВ та благодійних фондів, податковий облік і звітність, кадри та зарплата, підтримка військових. 21 рік на ринку.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description,
  applicationName: site.name,
  authors: [{ name: site.founder }],
  keywords: [
    "бухгалтерські послуги Харків",
    "бухгалтер для ФОП",
    "бухгалтерський супровід ТОВ",
    "облік для благодійних фондів",
    "податкова звітність",
    "аутсорсинг бухгалтерії",
    "реєстрація ФОП",
    "Євгенія Турковська",
    "Конкордія",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title,
    description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: content.hero.title.plain }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.jpg"] },
  robots: { index: true, follow: true },
  formatDetection: { telephone: true, email: true, address: true },
};

export const viewport: Viewport = {
  themeColor: "#F5F2EC",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["AccountingService", "LocalBusiness"],
  "@id": `${site.url}/#business`,
  name: `${site.name} — бухгалтерські послуги`,
  legalName: site.legalName,
  description,
  url: site.url,
  image: `${site.url}/og.jpg`,
  logo: `${site.url}/icon.png`,
  telephone: "+380754966271",
  email: site.email,
  priceRange: "₴₴",
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: "Харківська область",
    addressCountry: "UA",
    ...(site.address.postalCode ? { postalCode: site.address.postalCode } : {}),
  },
  geo: { "@type": "GeoCoordinates", latitude: site.address.lat, longitude: site.address.lng },
  hasMap: site.address.mapUrl,
  areaServed: [
    { "@type": "City", name: "Харків" },
    { "@type": "Country", name: "Україна" },
  ],
  founder: { "@type": "Person", name: site.founder, jobTitle: "Директор" },
  sameAs: [site.social.instagram, site.social.linkedin, site.social.telegram],
  knowsLanguage: ["uk"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Бухгалтерські послуги",
    itemListElement: [...content.services.items.map((s) => s.title), ...content.support.items.map((s) => s.title), ...content.extra.items].map(
      (name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } }),
    ),
  },
};

// До гідратації: позначаємо JS/рух/повторний візит, щоб не було спалаху контенту
// on-cover — лише головна (hero на першому екрані); перехід на /#секція — без прелоадера
const boot = `(function(){var d=document.documentElement,l=location;d.classList.add('js');if(l.pathname==='/')d.classList.add('on-cover');try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('js-motion');if(sessionStorage.getItem('konk-intro')||l.hash.length>1)d.classList.add('visited')}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="uk"
      suppressHydrationWarning
      className={`${unbounded.variable} ${cormorant.variable} ${onest.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
