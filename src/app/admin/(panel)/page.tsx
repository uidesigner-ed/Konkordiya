import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { listArticles } from "@/lib/server/articles";
import { listLeads } from "@/lib/server/leads";
import { getSettings } from "@/lib/server/settings";
import { formatDateNum } from "@/lib/news";

export const metadata = { title: "Огляд" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const [articles, leads, s] = await Promise.all([listArticles(), listLeads(), getSettings()]);
  const published = articles.filter((a) => a.status === "published").length;
  const drafts = articles.length - published;
  const fresh = leads.filter((l) => l.status === "new");

  const checks = [
    { ok: !!(s.ga4Id || s.gtmId), label: "Google Analytics 4 / Google Tag Manager", hint: s.ga4Id || s.gtmId },
    { ok: !!s.metaPixelId, label: "Meta Pixel", hint: s.metaPixelId },
    { ok: !!s.gscVerification, label: "Google Search Console (мета-тег підтвердження)", hint: s.gscVerification ? "додано" : "" },
    { ok: !s.noindexSite, label: "Сайт відкритий для індексації", hint: s.noindexSite ? "закрито в налаштуваннях" : "" },
  ];

  return (
    <main className="adm-page">
      <header className="adm-head">
        <h1>Вітаємо, {user.name.split(" ")[0]}</h1>
        <Link href="/admin/articles/new" className="adm-btn adm-btn--primary">
          + Нова стаття
        </Link>
      </header>
      {denied && <p className="adm-note adm-note--error">Цей розділ доступний лише адміністраторам.</p>}

      <section className="adm-stats">
        <Link href="/admin/articles" className="adm-stat">
          <span className="adm-stat__n">{published}</span>
          <span>опубліковано статей</span>
        </Link>
        <Link href="/admin/articles?status=draft" className="adm-stat">
          <span className="adm-stat__n">{drafts}</span>
          <span>чернеток</span>
        </Link>
        <Link href="/admin/leads" className={`adm-stat ${fresh.length ? "adm-stat--hot" : ""}`}>
          <span className="adm-stat__n">{fresh.length}</span>
          <span>нових заявок</span>
        </Link>
        <Link href="/admin/leads?status=all" className="adm-stat">
          <span className="adm-stat__n">{leads.length}</span>
          <span>заявок усього</span>
        </Link>
      </section>

      <div className="adm-cols">
        <section className="adm-card">
          <h2>Останні заявки</h2>
          {leads.length === 0 ? (
            <p className="adm-muted">Заявок поки немає. Вони з’являться тут після відправлення форми на сайті.</p>
          ) : (
            <ul className="adm-list">
              {leads.slice(0, 5).map((l) => (
                <li key={l.id}>
                  <span className={`adm-badge adm-badge--${l.status}`}>{l.status === "new" ? "Нова" : "•"}</span>
                  <span className="adm-list__main">
                    {l.name} · <a href={`tel:${l.phone.replace(/[^\d+]/g, "")}`}>{l.phone}</a>
                  </span>
                  <span className="adm-muted">{new Date(l.createdAt).toLocaleDateString("uk-UA")}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/leads" className="adm-link">
            Усі заявки →
          </Link>
        </section>

        <section className="adm-card">
          <h2>Аналітика та індексація</h2>
          <ul className="adm-checks">
            {checks.map((c) => (
              <li key={c.label} className={c.ok ? "is-ok" : "is-off"}>
                <span aria-hidden>{c.ok ? "✓" : "—"}</span>
                <span>
                  {c.label}
                  {c.hint && <small> · {c.hint}</small>}
                </span>
              </li>
            ))}
          </ul>
          {user.role === "admin" && (
            <Link href="/admin/settings" className="adm-link">
              Налаштувати →
            </Link>
          )}
        </section>

        <section className="adm-card">
          <h2>Останні статті</h2>
          <ul className="adm-list">
            {articles.slice(0, 5).map((a) => (
              <li key={a.id}>
                <span className={`adm-badge adm-badge--${a.status}`}>{a.status === "published" ? "Опубл." : "Чернетка"}</span>
                <Link href={`/admin/articles/${a.id}`} className="adm-list__main">
                  {a.title}
                </Link>
                <span className="adm-muted">{formatDateNum(a.date)}</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/articles" className="adm-link">
            Усі статті →
          </Link>
        </section>
      </div>
    </main>
  );
}
