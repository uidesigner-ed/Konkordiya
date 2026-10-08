import type { Metadata } from "next";
import { site } from "@/config/site";
import { content } from "@/content/uk";
import { homeSeo, services, serviceHref } from "@/content/services";
import { getSettings } from "@/lib/server/settings";
import { TrackingLoader } from "@/components/analytics/TrackingLoader";

/** Публічний сайт: стартовий скрипт, schema.org організації, аналітика й теги клієнта */

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    ...(s.gscVerification ? { verification: { google: s.gscVerification } } : {}),
    ...(s.noindexSite ? { robots: { index: false, follow: false } } : {}),
  };
}

// До гідратації: позначаємо JS/рух/повторний візит, щоб не було спалаху контенту.
// on-cover — лише головна (hero на першому екрані); перехід на /#секція — без прелоадера.
const boot = `(function(){var d=document.documentElement,l=location;d.classList.add('js');if(l.pathname==='/')d.classList.add('on-cover');try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('js-motion');if(sessionStorage.getItem('konk-intro')||l.hash.length>1)d.classList.add('visited')}catch(e){}})();`;

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": ["AccountingService", "LocalBusiness"],
    "@id": `${site.url}/#business`,
    name: `${site.name} — бухгалтерські послуги`,
    alternateName: "Бухгалтерська компанія «Конкордія»",
    legalName: site.legalName,
    description: homeSeo.description,
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
      itemListElement: [
        ...services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.h1, url: `${site.url}${serviceHref(s.slug)}` } })),
        ...content.extra.items.map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
      ],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    alternateName: "Конкордія — бухгалтерські послуги",
    url: site.url,
    inLanguage: "uk",
    publisher: { "@id": `${site.url}/#business` },
  },
];

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: boot }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {s.gtmId && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${s.gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
      )}
      {children}
      <TrackingLoader
        ga4Id={s.ga4Id}
        gtmId={s.gtmId}
        pixelId={s.metaPixelId}
        customHead={s.customHead}
        customBody={s.customBody}
        customConsent={s.customConsent}
        privacyUrl={site.privacyUrl}
      />
    </>
  );
}
