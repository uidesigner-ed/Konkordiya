import { notFound } from "next/navigation";
import { requireUser } from "@/lib/server/auth";
import { getArticleById } from "@/lib/server/articles";
import { deleteArticleAction } from "@/app/admin/actions";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { ConfirmButton } from "@/components/admin/ui";

export const metadata = { title: "Редагування статті" };

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const { created } = await searchParams;
  const article = await getArticleById(Number(id));
  if (!article) notFound();

  return (
    <main className="adm-page adm-page--wide">
      {created && <p className="adm-note adm-note--ok">Статтю створено</p>}
      {/* key — щоб після збереження з іншої вкладки редактор отримав свіжі дані */}
      <ArticleEditor key={article.id} article={article} />
      <form action={deleteArticleAction} className="ed-danger">
        <input type="hidden" name="id" value={article.id} />
        <span className="adm-muted">Видалення не можна скасувати.</span>
        <ConfirmButton message={`Видалити статтю «${article.title}»?`}>Видалити статтю</ConfirmButton>
      </form>
    </main>
  );
}
