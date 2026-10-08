import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { leadStatuses, listLeads } from "@/lib/server/leads";
import { contactMethods } from "@/components/forms/lead-options";
import { deleteLeadAction, setLeadStatusAction } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ui";
import { StatusSelect } from "@/components/admin/StatusSelect";

export const metadata = { title: "Заявки" };

const fmt = (ms: number) =>
  new Date(ms).toLocaleString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Kyiv" });

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireUser();
  const { status = "new" } = await searchParams;
  const all = await listLeads();
  const list = status === "all" ? all : all.filter((l) => l.status === status);
  const tabs = [{ id: "all", label: "Усі" }, ...leadStatuses];

  return (
    <main className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Заявки</h1>
          <p className="adm-muted">Заявки з форм на головній і сторінках послуг. Нові також надходять у Telegram, якщо підключено бота.</p>
        </div>
      </header>

      <div className="adm-tabs">
        {tabs.map((t) => (
          <Link key={t.id} href={`/admin/leads?status=${t.id}`} className="adm-tab" aria-current={status === t.id ? "page" : undefined}>
            {t.label} <span>{t.id === "all" ? all.length : all.filter((l) => l.status === t.id).length}</span>
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="adm-card adm-muted">Тут поки порожньо.</p>
      ) : (
        <div className="adm-leads">
          {list.map((l) => (
            <article key={l.id} className={`adm-card adm-lead adm-lead--${l.status}`}>
              <div className="adm-lead__head">
                <div>
                  <h2>{l.name}</h2>
                  <a href={`tel:${l.phone.replace(/[^\d+]/g, "")}`} className="adm-lead__phone adm-mono">
                    {l.phone}
                  </a>
                </div>
                <span className="adm-muted adm-mono">{fmt(l.createdAt)}</span>
              </div>
              <dl className="adm-lead__meta">
                {l.contact && (
                  <>
                    <dt>Зв’язок</dt>
                    <dd>{contactMethods.find((m) => m.id === l.contact)?.label ?? l.contact}</dd>
                  </>
                )}
                {l.service && (
                  <>
                    <dt>Послуга</dt>
                    <dd>{l.service}</dd>
                  </>
                )}
                {l.page && (
                  <>
                    <dt>Сторінка</dt>
                    <dd className="adm-mono">{l.page}</dd>
                  </>
                )}
                {Object.keys(l.utm).length > 0 && (
                  <>
                    <dt>Джерело</dt>
                    <dd className="adm-mono">
                      {Object.entries(l.utm)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(" · ")}
                    </dd>
                  </>
                )}
              </dl>
              {l.message && <p className="adm-lead__msg">{l.message}</p>}
              <div className="adm-lead__actions">
                <form action={setLeadStatusAction}>
                  <input type="hidden" name="id" value={l.id} />
                  <StatusSelect name="status" value={l.status} options={leadStatuses} />
                </form>
                <form action={deleteLeadAction}>
                  <input type="hidden" name="id" value={l.id} />
                  <ConfirmButton message="Видалити заявку? Дію не можна скасувати." className="adm-link adm-link--danger">
                    Видалити
                  </ConfirmButton>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
