import { requireUser } from "@/lib/server/auth";
import { ChangePasswordForm, ProfileForm } from "@/components/admin/UserForms";

export const metadata = { title: "Профіль" };

export default async function ProfilePage() {
  const me = await requireUser();
  return (
    <main className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Профіль</h1>
          <p className="adm-muted">
            {me.email} · {me.role === "admin" ? "Адміністратор" : "Редактор"}
          </p>
        </div>
      </header>
      <div className="adm-cols adm-cols--2">
        <section className="adm-card">
          <h2>Ім’я</h2>
          <ProfileForm name={me.name} />
        </section>
        <section className="adm-card">
          <h2>Пароль</h2>
          <p className="adm-muted">Після зміни пароля вас буде виведено з усіх інших пристроїв.</p>
          <ChangePasswordForm />
        </section>
      </div>
    </main>
  );
}
