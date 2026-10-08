import { requireAdmin } from "@/lib/server/auth";
import { getSettings } from "@/lib/server/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Аналітика й теги" };

const events = [
  { ga: "generate_lead", meta: "Lead", what: "Відправлено заявку з форми (головна, сторінки послуг)" },
  { ga: "click_call", meta: "Contact", what: "Натиснуто номер телефону" },
  { ga: "click_messenger", meta: "Contact", what: "Натиснуто Telegram / WhatsApp / Viber / Instagram (параметр messenger)" },
  { ga: "click_email", meta: "Contact", what: "Натиснуто адресу пошти" },
  { ga: "share", meta: "—", what: "Статтю поширено (Telegram, Facebook, LinkedIn)" },
];

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();
  return (
    <main className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Аналітика й теги</h1>
          <p className="adm-muted">
            Ідентифікатори Google і Meta, підтвердження Search Console та код сторонніх сервісів. Аналітика працює в режимі згоди
            (Consent Mode v2): до натискання «Прийняти» Google не ставить cookies, а Meta Pixel не завантажується.
          </p>
        </div>
      </header>

      <SettingsForm value={settings} />

      <section className="adm-card">
        <h2>Події конверсій</h2>
        <p className="adm-muted">
          Сайт надсилає ці події автоматично. У GA4 позначте їх як ключові: Адміністрування → Події → «Позначити як ключову подію».
          У GTM вони приходять у dataLayer під тими самими назвами — тригер «Користувацька подія».
        </p>
        <table className="adm-table">
          <thead>
            <tr>
              <th>GA4 / GTM</th>
              <th>Meta Pixel</th>
              <th>Коли</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.ga}>
                <td className="adm-mono">{e.ga}</td>
                <td className="adm-mono">{e.meta}</td>
                <td>{e.what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
