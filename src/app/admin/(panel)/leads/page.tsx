import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { describeSource, leadSourceLabel, leadStatuses, listLeads } from "@/lib/server/leads";
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
          <p className="adm-muted">
            Заявки з форм сайту й Telegram-бота. Нові також надходять у групу менеджерів у Telegram — статус, змінений там або тут,
            синхронізується.
          </p>
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
                <dt>Канал</dt>
                <dd>{leadSourceLabel[l.source]}</dd>
                {(l.tgUsername || l.tgChatId) && (
                  <>
                    <dt>Telegram</dt>
                    <dd>
                      {l.tgUsername ? (
                        <a href={`https://t.me/${l.tgUsername}`} target="_blank" rel="noopener noreferrer">
                          @{l.tgUsername}
                        </a>
                      ) : (
                        <a href={`tg://user?id=${l.tgChatId}`}>відкрити профіль</a>
                      )}
                    </dd>
                  </>
                )}
                {l.assignee && l.status !== "new" && (
                  <>
                    <dt>Менеджер</dt>
                    <dd>{l.assignee}</dd>
                  </>
                )}
                {l.contact && l.source === "form" && (
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
                <dt>Джерело</dt>
                <dd>
                  {describeSource(l.utm)}
                  {Object.keys(l.utm).length > 0 && (
                    <span className="adm-mono adm-muted">
                      {" "}
                      (
                      {Object.entries(l.utm)
                        .map(([k, v]) => `${k}=${v.length > 24 ? `${v.slice(0, 24)}…` : v}`)
                        .join(" · ")}
                      )
                    </span>
                  )}
                </dd>
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
