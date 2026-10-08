import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getSettings } from "@/lib/server/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { noindexSite } = await getSettings();
  return {
    // Тестовий домен (галочка в адмінці) — закритий повністю
    rules: noindexSite
      ? { userAgent: "*", disallow: "/" }
      : { userAgent: "*", allow: "/", disallow: ["/admin"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
