import "server-only";
import type { Metadata } from "next";
import { site } from "@/config/site";
import { newsUi } from "@/content/news";
import { homeSeo, services, servicesHub, serviceHref, SERVICES_PATH } from "@/content/services";
import { NEWS_PATH } from "@/lib/news";
import { getAllPageSeo, getSettings, type PageSeo } from "./settings";

/** Сторінки сайту з налаштовуваним SEO (адмінка → «Сторінки») */
export type SeoPage = { path: string; name: string; group: string; title: string; description: string; keywords: string[] };

export const seoPages: SeoPage[] = [
  { path: "/", name: "Головна", group: "Основні", ...homeSeo },
  { path: SERVICES_PATH, name: "Послуги (усі)", group: "Основні", title: servicesHub.title, description: servicesHub.description, keywords: servicesHub.keywords },
  {
    path: NEWS_PATH,
    name: "Новини (стрічка)",
    group: "Основні",
    title: newsUi.metaTitle,
    description: newsUi.metaDescription,
    keywords: [],
  },
  ...services.map((s) => ({
    path: serviceHref(s.slug),
    name: s.nav,
    group: "Послуги",
    title: s.title,
    description: s.description,
    keywords: s.keywords,
  })),
];

type Opts = {
  title: string;
  description: string;
  path: string;
  override?: PageSeo;
  type?: "website" | "article";
  extra?: Partial<Metadata>;
};

/** Повний набір метаданих сторінки: title, description, canonical, OG, Twitter, robots */
export async function buildMetadata({ title, description, path, override = {}, type = "website", extra = {} }: Opts): Promise<Metadata> {
  const settings = await getSettings();
  const t = override.title?.trim() || title;
  const d = override.description?.trim() || description;
  const ogTitle = override.ogTitle?.trim() || t;
  const ogDescription = override.ogDescription?.trim() || d;
  const noindex = settings.noindexSite || !!override.noindex;
  const url = `${site.url}${path === "/" ? "" : path}`;
  return {
    title: { absolute: t },
    description: d,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    openGraph: {
      type,
      locale: site.locale,
      url,
      siteName: site.name,
      title: ogTitle,
      description: ogDescription,
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: { card: "summary_large_image", title: ogTitle, description: ogDescription, images: ["/og.jpg"] },
    ...extra,
  };
}

/** Метадані статичної сторінки з реєстру з урахуванням перевизначень з адмінки */
export async function pageMetadata(path: string, extra?: Partial<Metadata>) {
  const page = seoPages.find((p) => p.path === path);
  const overrides = await getAllPageSeo();
  return buildMetadata({
    title: page?.title ?? site.name,
    description: page?.description ?? "",
    path,
    override: overrides[path],
    extra,
  });
}
