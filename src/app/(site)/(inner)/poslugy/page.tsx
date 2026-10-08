import Link from "next/link";
import { site } from "@/config/site";
import { content } from "@/content/uk";
import { newsUi } from "@/content/news";
import { services, servicesHub, serviceHref, serviceUi, SERVICES_PATH } from "@/content/services";
import { pageMetadata } from "@/lib/server/seo";
import { Breadcrumbs } from "@/components/news/Breadcrumbs";
import { NewsFx } from "@/components/news/NewsFx";
import { IconArrow } from "@/components/ui/Icons";
import { LeadBlock, StagesBlock, WhyBlock } from "@/components/services/ServiceBlocks";

export function generateMetadata() {
  return pageMetadata(SERVICES_PATH);
}

/** Додаткові послуги, що мають власні сторінки */
const extraLinks: Record<string, string> = {
  "Відновлення бухгалтерського обліку": serviceHref("vidnovlennia-obliku"),
  "Аутсорсинг бухгалтерії для бізнесу": serviceHref("bukhhalterskyi-autsorsynh"),
};

export default function ServicesPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: servicesHub.h1,
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.h1,
      url: `${site.url}${serviceHref(s.slug)}`,
    })),
  };

  return (
    <>
      <NewsFx />
      <section className="svp-hero page-x" aria-labelledby="svh-title">
        <Breadcrumbs items={[{ label: newsUi.home, href: "/" }, { label: serviceUi.breadcrumb }]} />
        {/* H1 = «Бухгалтерські послуги для бізнесу» */}
        <h1 id="svh-title" className="nx-title t-display svh-title">
          <span className="nx-title__mask">
            <span className="nx-title__word">Бухгалтерські</span>
          </span>{" "}
          <span className="nx-title__mask">
            <span className="nx-title__word">послуги</span>
          </span>{" "}
          <span className="nx-title__mask nx-title__mask--ital">
            <span className="nx-title__word ital">для бізнесу</span>
          </span>
        </h1>
        <div className="nx-hero__foot">
          <p className="nx-lead t-lead">{servicesHub.lead}</p>
          <p className="nx-stat">
            <span className="nx-stat__n t-mono">{String(services.length).padStart(2, "0")}</span>
            <span>
              напрямів
              <br />
              супроводу
            </span>
          </p>
        </div>
        <span className="nx-rule" aria-hidden />
      </section>

      <section className="svp-sec svh page-x" aria-label="Перелік послуг">
        <ol className="svh-list">
          {services.map((s, i) => (
            <li key={s.slug} className="svh-row" data-reveal>
              <Link href={serviceHref(s.slug)} className="svh-row__link" data-cursor={serviceUi.more}>
                <span className="svh-row__n t-mono">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="svh-row__title t-display">{s.h1}</h2>
                <p className="svh-row__text">{s.lead}</p>
                <span className="svh-row__arrow" aria-hidden>
                  <IconArrow size={20} />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="svp-sec svp-aud page-x" aria-labelledby="svh-extra">
        <h2 id="svh-extra" className="svp-h2 t-display" data-reveal>
          {servicesHub.extraTitle}
        </h2>
        <ul className="svp-aud__list">
          {content.extra.items.map((it) => (
            <li key={it} data-reveal>
              <span className="svp-aud__tick" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M5 12.5l4.5 4.5L19.5 6" />
                </svg>
              </span>
              {extraLinks[it] ? (
                <Link href={extraLinks[it]} className="link-line">
                  {it}
                </Link>
              ) : (
                it
              )}
            </li>
          ))}
        </ul>
      </section>

      <StagesBlock />
      <WhyBlock />
      <LeadBlock location="services" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
