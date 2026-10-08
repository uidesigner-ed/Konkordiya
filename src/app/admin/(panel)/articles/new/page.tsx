import { requireUser } from "@/lib/server/auth";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export const metadata = { title: "Нова стаття" };

export default async function NewArticlePage() {
  await requireUser();
  return (
    <main className="adm-page adm-page--wide">
      <ArticleEditor />
    </main>
  );
}
