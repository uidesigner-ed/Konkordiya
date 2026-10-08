import Link from "next/link";
import { site } from "@/config/site";
import { newsUi, type Article } from "@/content/news";
import {
  articleHref,
  articleNumber,
  categoryCounts,
  categoryHref,
  categoryLabel,
  formatDate,
  getAdjacent,
  getLatest,
  getPopular,
  getRelated,
  NEWS_PATH,
  readingTime,
  toc,
} from "@/lib/news";
import { LogoMark } from "@/components/ui/LogoMark";
import { IconArrowRight } from "@/components/ui/Icons";
import { RichText } from "@/components/ui/RichText";
import { Breadcrumbs } from "./Breadcrumbs";
import { NewsCover } from "./NewsCover";
import { NewsCard } from "./NewsCard";
import { ArticleBody } from "./ArticleBody";
import { ArticleToc } from "./ArticleToc";
import { ShareButtons } from "./ShareButtons";
import { ReadingProgress } from "./ReadingProgress";
import { CategoryList, LatestList, PopularList } from "./NewsLists";
import { NewsCta } from "./NewsCta";
import { NewsFx } from "./NewsFx";

/**
 * Сторінка статті. list — опубліковані статті (для «Нові», «Популярні», навігації та «Читайте також»).
 * preview — перегляд чернетки в адмінці (без розмітки schema.org).
 */
export function ArticleView({ a, list, preview = false }: { a: Article; list: Article[]; preview?: boolean }) {
  const url = `${site.url}${articleHref(a.slug)}`;
  const minutes = readingTime(a);
  const contents = toc(a);
  const { prev, next } = getAdjacent(list, a.slug);
  const related = getRelated(list, a);
  const n = articleNumber(list, a.slug);

  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.title,
    description: a.excerpt,
    datePublished: a.date,
    dateModified: a.updated ?? a.date,
    inLanguage: "uk",
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: `${site.url}/og.jpg`,
    articleSection: categoryLabel(a.category),
    keywords: a.tags.join(", "),
    timeRequired: `PT${minutes}M`,
    author: { "@type": "Organization", name: a.author, url: site.url },
    publisher: {
      "@type": "Organization",
      "@id": `${site.url}/#business`,
      name: site.name,
      logo: { "@type": "ImageObject", url: `${site.url}/icon.png` },
    },
    isPartOf: { "@id": `${site.url}${NEWS_PATH}#blog` },
  };

  return (
    <>
      <NewsFx />
      <ReadingProgress targetId="art-body" />

      <article className="art" aria-labelledby="art-title">
        <header className="art-head page-x">
          <Breadcrumbs
            items={[
              { label: newsUi.home, href: "/" },
              { label: newsUi.title, href: NEWS_PATH },
              { label: categoryLabel(a.category), href: categoryHref(a.category) },
              { label: a.title },
            ]}
          />
          <div className="art-head__grid">
            <div className="art-head__main">
              <p className="art-meta">
                <Link href={categoryHref(a.category)} className="nchip nchip--sm">
                  {categoryLabel(a.category)}
                </Link>
                <time dateTime={a.date}>{formatDate(a.date)}</time>
                <span className="art-meta__dot" aria-hidden />
                <span>
                  <span className="t-mono">{minutes}</span> {newsUi.minutes}
                </span>
              </p>
              <h1 id="art-title" className="art-title t-display">
                {a.title}
              </h1>
              <p className="art-lead t-lead">{a.excerpt}</p>
            </div>
            <div className="art-author">
              <span className="art-author__mark" aria-hidden>
                <LogoMark className="bg-paper" />
              </span>
              <span>
                <span className="art-author__name">{a.author}</span>
                <span className="art-author__role">Бухгалтерська компанія, Харків</span>
              </span>
            </div>
          </div>
        </header>

        <figure className="art-cover page-x">
          <div className="art-cover__frame">
            <div className="art-cover__inner">
              <NewsCover cover={a.cover} n={n} uid={`hw-${a.slug}`} wide className="ncv--wide" />
              <NewsCover cover={a.cover} n={n} uid={`hn-${a.slug}`} className="ncv--narrow" />
            </div>
          </div>
        </figure>

        <div className="art-grid page-x">
          <aside className="art-rail" aria-label={newsUi.toc}>
            <div className="art-rail__sticky">
              <ArticleToc items={contents} variant="rail" />
              <ShareButtons url={url} title={a.title} />
            </div>
          </aside>

          <div id="art-body" className="art-main">
            <ArticleToc items={contents} variant="inline" />

            <section className="art-summary" aria-labelledby="art-summary">
              <h2 id="art-summary" className="art-summary__title">
                <span className="ital">{newsUi.summary}</span>
              </h2>
              <ol>
                {a.summary.map((s, i) => (
                  <li key={i}>
                    <span className="t-mono" aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </section>

            <ArticleBody blocks={a.body} slug={a.slug} />

            <footer className="art-foot">
              <div className="art-tags">
                <p className="art-tags__title">{newsUi.tags}</p>
                <ul>
                  {a.tags.map((t) => (
                    <li key={t} className="art-tag">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <ShareButtons url={url} title={a.title} className="art-foot__share" />
              <p className="art-disclaimer">
                {a.updated && (
                  <>
                    {newsUi.updated}: <time dateTime={a.updated}>{formatDate(a.updated)}</time>.{" "}
                  </>
                )}
                {newsUi.disclaimer}
              </p>
            </footer>
          </div>

          <aside className="art-side" aria-label="Інші матеріали">
            <div className="art-side__sticky">
              <LatestList items={getLatest(list, a.slug, 3)} />
              <PopularList items={getPopular(list, a.slug, 4)} />
              <CategoryList counts={categoryCounts(list)} current={a.category} />
            </div>
          </aside>
        </div>
      </article>

      <NewsCta />

      <nav className="art-pager page-x" aria-label="Інші статті">
        {prev ? (
          <Link href={articleHref(prev.slug)} className="art-pager__link art-pager__link--prev" data-cursor={newsUi.read}>
            <span className="art-pager__dir">
              <IconArrowRight size={18} className="rotate-180" />
              {newsUi.prev}
            </span>
            <span className="art-pager__title t-display">{prev.title}</span>
          </Link>
        ) : (
          <Link href={NEWS_PATH} className="art-pager__link art-pager__link--prev">
            <span className="art-pager__dir">
              <IconArrowRight size={18} className="rotate-180" />
              {newsUi.allNews}
            </span>
            <span className="art-pager__title art-pager__title--soft t-display">{newsUi.backToFeed}</span>
          </Link>
        )}
        {next ? (
          <Link href={articleHref(next.slug)} className="art-pager__link art-pager__link--next" data-cursor={newsUi.read}>
            <span className="art-pager__dir">
              {newsUi.next}
              <IconArrowRight size={18} />
            </span>
            <span className="art-pager__title t-display">{next.title}</span>
          </Link>
        ) : (
          <Link href={NEWS_PATH} className="art-pager__link art-pager__link--next">
            <span className="art-pager__dir">
              {newsUi.allNews}
              <IconArrowRight size={18} />
            </span>
            <span className="art-pager__title art-pager__title--soft t-display">{newsUi.backToFeed}</span>
          </Link>
        )}
      </nav>

      <section className="art-related page-x" aria-labelledby="art-related">
        <div className="art-related__head">
          <h2 id="art-related" className="t-display art-related__title">
            <RichText parts={newsUi.related} />
          </h2>
          <Link href={NEWS_PATH} className="art-related__all link-line">
            {newsUi.allNews}
            <IconArrowRight size={18} />
          </Link>
        </div>
        <div className="art-related__grid">
          {related.map((r) => (
            <div key={r.slug} data-reveal>
              <NewsCard a={r} n={articleNumber(list, r.slug)} level={3} uid={`rel-${r.slug}`} />
            </div>
          ))}
        </div>
      </section>

      {!preview && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />}
    </>
  );
}
