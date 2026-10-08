import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { services, serviceHref, serviceUi, getService, SERVICES_PATH } from "@/content/services";
import { newsUi } from "@/content/news";
import { articleNumber, NEWS_PATH } from "@/lib/news";
import { getPublishedArticles } from "@/lib/server/articles";
import { pageMetadata } from "@/lib/server/seo";
import { Breadcrumbs } from "@/components/news/Breadcrumbs";
import { NewsCover } from "@/components/news/NewsCover";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsFx } from "@/components/news/NewsFx";
import { Button } from "@/components/ui/Button";
import { IconArrow, IconArrowRight } from "@/components/ui/Icons";
import { LeadBlock, StagesBlock, WhyBlock } from "@/components/services/ServiceBlocks";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return pageMetadata(serviceHref(slug));
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();
  const index = services.indexOf(s);
  const n = String(index + 1).padStart(2, "0");

  const articles = await getPublishedArticles();
  const related = articles.filter((a) => (s.news as string[]).includes(a.category)).slice(0, 3);
  const others = services.filter((x) => x.slug !== s.slug);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${site.url}${serviceHref(s.slug)}#service`,
    name: s.h1,
    serviceType: s.keywords[0],
    description: s.description,
    url: `${site.url}${serviceHref(s.slug)}`,
    provider: { "@id": `${site.url}/#business` },
    areaServed: { "@type": "City", name: "Харків" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: s.includesTitle,
      itemListElement: s.includes.map((it) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: it.title } })),
    },
  };

  return (
    <>
      <NewsFx />
      <section className="svp-hero page-x" aria-labelledby="svp-title">
        <Breadcrumbs
          items={[{ label: newsUi.home, href: "/" }, { label: serviceUi.breadcrumb, href: SERVICES_PATH }, { label: s.nav }]}
        />
        <p className="svp-eyebrow">
          <span className="t-mono">№ {n}</span>
          <span>Послуга · Харків</span>
        </p>
        <h1 id="svp-title" className="svp-title t-display">
          {s.h1}
        </h1>
        <div className="svp-hero__foot">
          <p className="svp-lead-text t-lead">{s.lead}</p>
          <div className="svp-hero__cta">
            <Button href="#zaiavka" external={false} size="lg" cursor={serviceUi.toForm}>
              {serviceUi.toForm}
            </Button>
            <a href={site.phone.href} className="svp-hero__phone t-mono link-line">
              {site.phone.display}
            </a>
          </div>
        </div>
        <span className="nx-rule" aria-hidden />
      </section>

      <section className="svp-sec svp-intro page-x" aria-label="Про послугу">
        <div className="svp-intro__text" data-reveal>
          {s.intro.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <div className="svp-intro__art" aria-hidden data-reveal>
          <NewsCover cover={s.cover} n={n} uid={`svc-${s.slug}`} />
        </div>
      </section>

      <section className="svp-sec svp-inc page-x" aria-labelledby="svp-inc">
        <h2 id="svp-inc" className="svp-h2 t-display" data-reveal>
          {s.includesTitle}
        </h2>
        <ol className="svp-inc__grid">
          {s.includes.map((it, i) => (
            <li key={it.title} id={it.id} className="svp-inc__item" data-reveal>
              <span className="svp-inc__n t-mono">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="svp-inc__title">{it.title}</h3>
              <p className="svp-inc__text">{it.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="svp-sec svp-aud page-x" aria-labelledby="svp-aud">
        <h2 id="svp-aud" className="svp-h2 t-display" data-reveal>
          {s.audienceTitle}
        </h2>
        <ul className="svp-aud__list">
          {s.audience.map((a) => (
            <li key={a} data-reveal>
              <span className="svp-aud__tick" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M5 12.5l4.5 4.5L19.5 6" />
                </svg>
              </span>
              {a}
            </li>
          ))}
        </ul>
      </section>

      <StagesBlock />
      <WhyBlock />

      <section className="svp-sec svp-faq page-x" aria-labelledby="svp-faq">
        <h2 id="svp-faq" className="svp-h2 t-display" data-reveal>
          {serviceUi.faqTitle}
        </h2>
        <div className="svp-faq__list">
          {s.faq.map((f, i) => (
            <details key={f.q} className="svp-faq__item" open={i === 0} data-reveal>
              <summary>
                <h3>{f.q}</h3>
                <span className="svp-faq__icon" aria-hidden />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <LeadBlock location={`service:${s.slug}`} service={s.nav} />

      {related.length > 0 && (
        <section className="svp-sec svp-news page-x" aria-labelledby="svp-news">
          <div className="art-related__head">
            <h2 id="svp-news" className="svp-h2 t-display">
              {serviceUi.newsTitle}
            </h2>
            <Link href={NEWS_PATH} className="art-related__all link-line">
              {newsUi.allNews}
              <IconArrowRight size={18} />
            </Link>
          </div>
          <div className="art-related__grid">
            {related.map((r) => (
              <div key={r.slug} data-reveal>
                <NewsCard a={r} n={articleNumber(articles, r.slug)} level={3} uid={`svn-${r.slug}`} />
              </div>
            ))}
          </div>
        </section>
      )}

      <nav className="svp-sec svp-other page-x" aria-labelledby="svp-other">
        <h2 id="svp-other" className="svp-h2 t-display">
          {serviceUi.otherTitle}
        </h2>
        <ul className="svp-other__list">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={serviceHref(o.slug)} className="svp-other__link" data-cursor={serviceUi.more}>
                <span>{o.nav}</span>
                <IconArrow size={18} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
