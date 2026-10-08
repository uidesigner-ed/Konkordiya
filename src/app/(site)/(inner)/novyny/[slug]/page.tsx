import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { articleHref, categoryLabel } from "@/lib/news";
import { getPublishedArticles } from "@/lib/server/articles";
import { buildMetadata } from "@/lib/server/seo";
import { ArticleView } from "@/components/news/ArticleView";

type Props = { params: Promise<{ slug: string }> };

// Нові статті з адмінки рендеряться за першим запитом і далі кешуються
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getPublishedArticles()).map((a) => ({ slug: a.slug }));
}

async function find(slug: string) {
  const list = await getPublishedArticles();
  return { list, a: list.find((x) => x.slug === slug) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { a } = await find(slug);
  if (!a) return {};
  const seo = a.seo ?? {};
  const meta = await buildMetadata({
    title: `${a.title} — ${site.name}`,
    description: a.excerpt,
    path: articleHref(a.slug),
    type: "article",
    override: seo,
    extra: { authors: [{ name: a.author }] },
  });
  return {
    ...meta,
    ...(seo.canonical ? { alternates: { canonical: seo.canonical } } : {}),
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: a.date,
      modifiedTime: a.updated ?? a.date,
      section: categoryLabel(a.category),
      tags: a.tags,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const { list, a } = await find(slug);
  if (!a) notFound();
  return <ArticleView a={a} list={list} />;
}
