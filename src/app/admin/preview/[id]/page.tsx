import { notFound } from "next/navigation";
import { requireUser } from "@/lib/server/auth";
import { getArticleById, getPublishedArticles } from "@/lib/server/articles";
import { ArticleView } from "@/components/news/ArticleView";

export const metadata = { title: "Перегляд статті" };

/** Перегляд статті (зокрема чернетки) так, як вона виглядатиме на сайті */
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const a = await getArticleById(Number(id));
  if (!a) notFound();
  const published = await getPublishedArticles();
  const list = published.some((x) => x.id === a.id) ? published : [a, ...published];
  return (
    <div className="adm-preview">
      <p className="adm-preview__bar">
        Перегляд{a.status !== "published" ? " чернетки" : ""} · <a href={`/admin/articles/${a.id}`}>← до редагування</a>
      </p>
      <main className="inner-main">
        <ArticleView a={a} list={list} preview />
      </main>
    </div>
  );
}
