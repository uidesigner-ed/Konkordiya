import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { allArticles, articleHref, NEWS_PATH } from "@/lib/news";

export default function sitemap(): MetadataRoute.Sitemap {
  const latest = allArticles[0]?.date;
  return [
    { url: site.url, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}${NEWS_PATH}`, lastModified: latest ? new Date(latest) : new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...allArticles.map((a) => ({
      url: `${site.url}${articleHref(a.slug)}`,
      lastModified: new Date(a.updated ?? a.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
