import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { services, serviceHref, SERVICES_PATH } from "@/content/services";
import { articleHref, NEWS_PATH } from "@/lib/news";
import { getPublishedArticles } from "@/lib/server/articles";
import { getAllPageSeo, getSettings } from "@/lib/server/settings";

/** XML-карта сайту: головна, послуги, новини та опубліковані статті (без закритих від індексації) */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, pageSeo, settings] = await Promise.all([getPublishedArticles(), getAllPageSeo(), getSettings()]);
  if (settings.noindexSite) return [];
  const now = new Date();
  const latest = articles[0]?.date ? new Date(articles[0].updated ?? articles[0].date) : now;
  const url = (path: string) => `${site.url}${path === "/" ? "" : path}`;

  const pages: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: url(SERVICES_PATH), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...services.map((s) => ({
      url: url(serviceHref(s.slug)),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: url(NEWS_PATH), lastModified: latest, changeFrequency: "weekly", priority: 0.7 },
    ...articles
      .filter((a) => !a.seo?.noindex && !a.seo?.canonical)
      .map((a) => ({
        url: url(articleHref(a.slug)),
        lastModified: new Date(a.updated ?? a.date),
        changeFrequency: "yearly" as const,
        priority: 0.6,
      })),
  ];
  return pages.filter((p) => !pageSeo[p.url.replace(site.url, "") || "/"]?.noindex);
}
