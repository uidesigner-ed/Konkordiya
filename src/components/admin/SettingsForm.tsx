"use client";

import { saveSettingsAction } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/server/settings";
import { Field, SavedNote, SubmitButton, useFormAction } from "./ui";

export function SettingsForm({ value }: { value: SiteSettings }) {
  const { state, dispatch, pending, onSubmit } = useFormAction(saveSettingsAction);
  const e = state.errors ?? {};
  return (
    <form action={dispatch} onSubmit={onSubmit} className="adm-form">
      <section className="adm-card">
        <h2>Google</h2>
        <div className="ed-row">
          <Field
            label="Google Analytics 4 — ідентифікатор потоку"
            error={e.ga4Id}
            hint="Analytics → Адміністрування → Потоки даних → «G-…»"
          >
            <input name="ga4Id" defaultValue={value.ga4Id} placeholder="G-XXXXXXXXXX" className="adm-mono" />
          </Field>
          <Field
            label="Google Tag Manager — контейнер"
            error={e.gtmId}
            hint="Якщо теги ведуться через GTM. Тоді GA4 краще налаштувати всередині GTM, а поле вище лишити порожнім."
          >
            <input name="gtmId" defaultValue={value.gtmId} placeholder="GTM-XXXXXXX" className="adm-mono" />
          </Field>
        </div>
        <Field
          label="Google Search Console — підтвердження власника"
          error={e.gscVerification}
          hint="Search Console → Додати ресурс → «Тег HTML»: вставте весь мета-тег або лише значення content"
        >
          <input name="gscVerification" defaultValue={value.gscVerification} placeholder='<meta name="google-site-verification" content="…">' className="adm-mono" />
        </Field>
      </section>

      <section className="adm-card">
        <h2>Meta (Facebook, Instagram)</h2>
        <Field label="Meta Pixel — ідентифікатор" error={e.metaPixelId} hint="Events Manager → Джерела даних → ваш піксель → ID (лише цифри)">
          <input name="metaPixelId" defaultValue={value.metaPixelId} placeholder="123456789012345" className="adm-mono" inputMode="numeric" />
        </Field>
      </section>

      <section className="adm-card">
        <h2>Теги клієнта</h2>
        <p className="adm-muted">
          Довільний код від сервісів (наприклад, віджет зворотного дзвінка, Hotjar, Microsoft Clarity, рекламні мітки). Вставляйте
          лише код із перевірених джерел — він виконується на всіх сторінках сайту.
        </p>
        <Field label="Код у <head>">
          <textarea name="customHead" defaultValue={value.customHead} rows={6} className="adm-code" spellCheck={false} />
        </Field>
        <Field label="Код на початку <body>">
          <textarea name="customBody" defaultValue={value.customBody} rows={4} className="adm-code" spellCheck={false} />
        </Field>
        <label className="adm-check">
          <input type="checkbox" name="customConsent" defaultChecked={value.customConsent} />
          Завантажувати цей код лише після згоди відвідувача на cookies
        </label>
      </section>

      <section className="adm-card">
        <h2>Індексація</h2>
        <label className="adm-check adm-check--danger">
          <input type="checkbox" name="noindexSite" defaultChecked={value.noindexSite} />
          Закрити весь сайт від пошукових систем (лише для тестового домену!)
        </label>
      </section>

      <div className="adm-form__actions adm-form__actions--sticky">
        <SubmitButton pending={pending}>Зберегти налаштування</SubmitButton>
        <SavedNote state={state} />
      </div>
    </form>
  );
}
