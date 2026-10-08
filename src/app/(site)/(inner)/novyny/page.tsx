import { site } from "@/config/site";
import { newsUi } from "@/content/news";
import { articleHref, articleNumber, categoryCounts, formatDateNum, getPopular, NEWS_PATH, plural, searchText } from "@/lib/news";
import { getPublishedArticles } from "@/lib/server/articles";
import { pageMetadata } from "@/lib/server/seo";
import { Breadcrumbs } from "@/components/news/Breadcrumbs";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsIndex } from "@/components/news/NewsIndex";
import { PopularList } from "@/components/news/NewsLists";
import { NewsCta } from "@/components/news/NewsCta";
import { NewsFx } from "@/components/news/NewsFx";

export function generateMetadata() {
  return pageMetadata(NEWS_PATH);
}

export default async function NewsPage() {
  const list = await getPublishedArticles();
  const [latest] = list;
  const total = list.length;

  const ld = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${site.url}${NEWS_PATH}#blog`,
    name: newsUi.metaTitle,
    description: newsUi.metaDescription,
    url: `${site.url}${NEWS_PATH}`,
    inLanguage: "uk",
    publisher: { "@id": `${site.url}/#business` },
    blogPost: list.map((a) => ({
      "@type": "BlogPosting",
      headline: a.title,
      url: `${site.url}${articleHref(a.slug)}`,
      datePublished: a.date,
    })),
  };

  return (
    <>
      <NewsFx />
      <section className="nx-hero page-x" aria-labelledby="nx-title">
        <Breadcrumbs items={[{ label: newsUi.home, href: "/" }, { label: newsUi.title }]} />
        <h1 id="nx-title" className="nx-title t-display">
          <span className="nx-title__mask">
            <span className="nx-title__word">{newsUi.title}</span>
          </span>{" "}
          <span className="nx-title__mask nx-title__mask--ital">
            <span className="nx-title__word ital">{newsUi.titleItal}</span>
          </span>
        </h1>
        <div className="nx-hero__foot">
          <p className="nx-lead t-lead">{newsUi.lead}</p>
          <p className="nx-stat">
            <span className="nx-stat__n t-mono">{String(total).padStart(2, "0")}</span>
            <span>
              {plural(total, ["матеріал", "матеріали", "матеріалів"])}
              <br />
              {latest && (
                <>
                  {newsUi.updated.toLowerCase()} <span className="t-mono">{formatDateNum(latest.date)}</span>
                </>
              )}
            </span>
          </p>
        </div>
        <span className="nx-rule" aria-hidden />
      </section>

      <NewsIndex
        items={list.map((a) => ({ slug: a.slug, category: a.category, search: searchText(a) }))}
        categories={categoryCounts(list)}
        featured={latest && <NewsCard a={latest} n={articleNumber(list, latest.slug)} variant="featured" uid={`f-${latest.slug}`} />}
        cards={Object.fromEntries(list.map((a) => [a.slug, <NewsCard key={a.slug} a={a} n={articleNumber(list, a.slug)} />]))}
        aside={<PopularList items={getPopular(list)} />}
      />

      <NewsCta />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
