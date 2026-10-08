import Link from "next/link";
import { requireUser } from "@/lib/server/auth";
import { countNewLeads } from "@/lib/server/leads";
import { dbIsEphemeral } from "@/lib/server/db";
import { logoutAction } from "../actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoMark } from "@/components/ui/LogoMark";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const newLeads = await countNewLeads();

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <Link href="/admin" className="adm-brand">
          <LogoMark className="bg-paper" />
          <span>
            Конкордія
            <small>адмінка</small>
          </span>
        </Link>
        <AdminNav isAdmin={user.role === "admin"} newLeads={newLeads} />
        <div className="adm-side__foot">
          <Link href="/admin/profile" className="adm-me">
            <span className="adm-me__name">{user.name}</span>
            <span className="adm-me__role">{user.role === "admin" ? "Адміністратор" : "Редактор"}</span>
          </Link>
          <div className="adm-side__actions">
            <a href="/" target="_blank" rel="noopener" className="adm-link">
              Відкрити сайт ↗
            </a>
            <form action={logoutAction}>
              <button type="submit" className="adm-link">
                Вийти
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="adm-main">
        {dbIsEphemeral() && (
          <p className="adm-banner">
            База даних не підключена: зміни зберігаються тимчасово й зникнуть після перезапуску сервера. Додайте DATABASE_URL і
            DATABASE_AUTH_TOKEN (Turso) у налаштуваннях Vercel.
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
