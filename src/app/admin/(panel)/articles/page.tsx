import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { listArticles } from "@/lib/server/articles";
import { categoryLabel, formatDateNum } from "@/lib/news";

export const metadata = { title: "Статті" };

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; deleted?: string }> }) {
  await requireUser();
  const { status = "all", q = "", deleted } = await searchParams;
  const all = await listArticles();
  const query = q.trim().toLowerCase();
  const list = all.filter(
    (a) => (status === "all" || a.status === status) && (!query || `${a.title} ${a.slug} ${a.tags.join(" ")}`.toLowerCase().includes(query)),
  );
  const count = (s: string) => all.filter((a) => s === "all" || a.status === s).length;

  return (
    <main className="adm-page">
      <header className="adm-head">
        <h1>Статті</h1>
        <Link href="/admin/articles/new" className="adm-btn adm-btn--primary">
          + Нова стаття
        </Link>
      </header>
      {deleted && <p className="adm-note adm-note--ok">Статтю видалено</p>}

      <form className="adm-filters" role="search">
        <div className="adm-tabs">
          {[
            ["all", "Усі"],
            ["published", "Опубліковані"],
            ["draft", "Чернетки"],
          ].map(([id, label]) => (
            <Link key={id} href={`/admin/articles?status=${id}${q ? `&q=${encodeURIComponent(q)}` : ""}`} aria-current={status === id ? "page" : undefined} className="adm-tab">
              {label} <span>{count(id)}</span>
            </Link>
          ))}
        </div>
        <input type="hidden" name="status" value={status} />
        <input type="search" name="q" defaultValue={q} placeholder="Пошук за назвою або темою" className="adm-search" />
      </form>

      <div className="adm-card adm-card--flush">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Заголовок</th>
              <th>Категорія</th>
              <th>Дата</th>
              <th>Статус</th>
              <th>SEO</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => {
              const seoOk = !!a.seo?.keyword && (a.seo?.title || a.title).length <= 70;
              return (
                <tr key={a.id}>
                  <td>
                    <Link href={`/admin/articles/${a.id}`} className="adm-table__title">
                      {a.title}
                    </Link>
                    <span className="adm-muted adm-table__sub">/novyny/{a.slug}</span>
                  </td>
                  <td>{categoryLabel(a.category)}</td>
                  <td className="adm-mono">{formatDateNum(a.date)}</td>
                  <td>
                    <span className={`adm-badge adm-badge--${a.status}`}>{a.status === "published" ? "Опубліковано" : "Чернетка"}</span>
                    {a.seo?.noindex && <span className="adm-badge adm-badge--spam">noindex</span>}
                  </td>
                  <td>
                    <span className={seoOk ? "adm-ok" : "adm-muted"}>{a.seo?.keyword ? `«${a.seo.keyword}»` : "запит не задано"}</span>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="adm-muted">
                  Нічого не знайдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
