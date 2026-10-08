import { requireUser } from "@/lib/server/auth";
import { seoPages } from "@/lib/server/seo";
import { getAllPageSeo } from "@/lib/server/settings";
import { PageSeoForm } from "@/components/admin/PageSeoForm";

export const metadata = { title: "SEO сторінок" };

export default async function PagesSeo() {
  await requireUser();
  const overrides = await getAllPageSeo();

  return (
    <main className="adm-page">
      <header className="adm-head">
        <div>
          <h1>SEO сторінок</h1>
          <p className="adm-muted">
            Title і Description для головної, послуг і стрічки новин. Порожні поля — стандартні тексти з сайту. Для кожної сторінки
            показано її ключові запити: використовуйте їх природно, без перенасичення. SEO статей — у редакторі статті.
          </p>
        </div>
      </header>

      <div className="adm-seo-list">
        {seoPages.map((p) => (
          <section key={p.path} className="adm-card adm-seo">
            <div className="adm-seo__head">
              <div>
                <span className="adm-muted">{p.group}</span>
                <h2>{p.name}</h2>
              </div>
              <a href={p.path} target="_blank" rel="noopener" className="adm-link adm-mono">
                {p.path} ↗
              </a>
            </div>
            {p.keywords.length > 0 && (
              <p className="adm-kw">
                {p.keywords.map((k, i) => (
                  <span key={k} className={i === 0 ? "adm-kw__main" : ""}>
                    {k}
                  </span>
                ))}
              </p>
            )}
            <PageSeoForm
              path={p.path}
              defaults={{ title: p.title, description: p.description }}
              value={overrides[p.path] ?? {}}
              keywords={p.keywords}
            />
          </section>
        ))}
      </div>
    </main>
  );
}
