import { requireAdmin } from "@/lib/server/auth";
import { listUsers } from "@/lib/server/users";
import { deleteUserAction, updateUserRoleAction } from "@/app/admin/actions";
import { CreateUserForm, ResetPasswordForm } from "@/components/admin/UserForms";
import { ConfirmButton } from "@/components/admin/ui";
import { StatusSelect } from "@/components/admin/StatusSelect";

export const metadata = { title: "Користувачі" };

const roles = [
  { id: "editor", label: "Редактор" },
  { id: "admin", label: "Адміністратор" },
];

export default async function UsersPage() {
  const me = await requireAdmin();
  const users = await listUsers();
  const admins = users.filter((u) => u.role === "admin").length;

  return (
    <main className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Користувачі</h1>
          <p className="adm-muted">Хто має доступ до адмінки. Передайте новому користувачу пошту й пароль — він зможе змінити пароль у «Профілі».</p>
        </div>
      </header>

      <div className="adm-cols adm-cols--2">
        <section className="adm-card adm-card--flush">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Користувач</th>
                <th>Роль</th>
                <th>Останній вхід</th>
                <th aria-label="Дії" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const self = u.id === me.id;
                const lastAdmin = u.role === "admin" && admins <= 1;
                return (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                      {self && <span className="adm-badge adm-badge--published">це ви</span>}
                      <span className="adm-muted adm-table__sub">{u.email}</span>
                      {!self && (
                        <details className="ed-more ed-more--sm">
                          <summary>Скинути пароль</summary>
                          <ResetPasswordForm id={u.id} />
                        </details>
                      )}
                    </td>
                    <td>
                      <form action={updateUserRoleAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <StatusSelect name="role" value={u.role} options={roles} label="Роль" disabled={self} />
                      </form>
                    </td>
                    <td className="adm-mono adm-muted">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("uk-UA", { timeZone: "Europe/Kyiv" }) : "—"}
                    </td>
                    <td>
                      {!self && !lastAdmin && (
                        <form action={deleteUserAction}>
                          <input type="hidden" name="id" value={u.id} />
                          <ConfirmButton message={`Видалити користувача ${u.email}?`} className="adm-link adm-link--danger">
                            Видалити
                          </ConfirmButton>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="adm-card">
          <h2>Додати користувача</h2>
          <CreateUserForm />
        </section>
      </div>
    </main>
  );
}
