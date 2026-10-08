"use client";

import { startTransition, useActionState, useEffect, useId, useRef } from "react";
import { submitLead, type LeadState } from "@/app/(site)/actions";
import { serviceNav } from "@/content/service-nav";
import { site } from "@/config/site";
import { trackLead } from "@/lib/track";
import { IconArrow, IconTelegram } from "@/components/ui/Icons";
import { contactMethods } from "./lead-options";

/** Форма заявки. Успішна відправка → події generate_lead (GA4 / GTM) і Lead (Meta Pixel). */
export function LeadForm({
  location,
  service,
  tone = "paper",
}: {
  /** Де стоїть форма — потрапляє в аналітику (form_location) */
  location: string;
  /** Попередньо обрана послуга (назва з services[].nav) */
  service?: string;
  tone?: "paper" | "dark";
}) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, { ok: false });
  const uid = useId();
  const form = useRef<HTMLFormElement>(null);
  const tracked = useRef<LeadState | null>(null);

  // Службові поля заповнюємо лише в браузері (інакше розбіжність при гідратації)
  useEffect(() => {
    const f = form.current;
    if (!f) return;
    (f.elements.namedItem("t") as HTMLInputElement).value = String(Date.now());
    (f.elements.namedItem("page") as HTMLInputElement).value = window.location.pathname;
    try {
      (f.elements.namedItem("utm") as HTMLInputElement).value = sessionStorage.getItem("konk-utm") ?? "";
    } catch {}
  }, []);

  useEffect(() => {
    if (state.ok && tracked.current !== state) {
      tracked.current = state;
      trackLead({ form_location: location });
    }
  }, [state, location]);

  if (state.ok) {
    return (
      <div className={`lead lead--${tone} lead--done`} role="status">
        <p className="lead__done-title t-display">Дякуємо!</p>
        <p className="lead__done-text">Заявку отримано — фахівець зв’яжеться з вами найближчим часом у робочий час.</p>
        <a href={site.consultUrl} target="_blank" rel="noopener noreferrer" className="lead__done-link link-line">
          <IconTelegram size={18} /> Або напишіть нам у Telegram
        </a>
      </div>
    );
  }

  const err = state.fields ?? {};
  const id = (k: string) => `${uid}-${k}`;

  return (
    <form
      ref={form}
      action={action}
      // Відправка вручну: так React не очищає поля, якщо сервер повернув помилку
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className={`lead lead--${tone}`}
      noValidate
      data-track-zone={location}
    >
      <input type="hidden" name="t" defaultValue="" />
      <input type="hidden" name="page" defaultValue="" />
      <input type="hidden" name="utm" defaultValue="" />
      {/* Пастка для ботів — люди її не бачать */}
      <div className="lead__trap" aria-hidden>
        <label>
          Сайт
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="lead__grid">
        <div className="lead__field">
          <label htmlFor={id("name")}>Ім’я</label>
          <input
            id={id("name")}
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={80}
            aria-invalid={!!err.name}
            aria-describedby={err.name ? id("name-e") : undefined}
          />
          {err.name && (
            <p id={id("name-e")} className="lead__error">
              {err.name}
            </p>
          )}
        </div>
        <div className="lead__field">
          <label htmlFor={id("phone")}>Телефон</label>
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+38 (0__) ___ __ __"
            required
            maxLength={30}
            aria-invalid={!!err.phone}
            aria-describedby={err.phone ? id("phone-e") : undefined}
          />
          {err.phone && (
            <p id={id("phone-e")} className="lead__error">
              {err.phone}
            </p>
          )}
        </div>
      </div>

      <fieldset className="lead__field">
        <legend>Як з вами зв’язатися</legend>
        <div className="lead__chips">
          {contactMethods.map((m, i) => (
            <label key={m.id} className="lead__chip">
              <input type="radio" name="contact" value={m.id} defaultChecked={i === 0} />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="lead__field">
        <label htmlFor={id("service")}>Послуга</label>
        <select id={id("service")} name="service" defaultValue={service ?? ""}>
          <option value="">Оберіть, якщо знаєте</option>
          {serviceNav.map((s) => (
            <option key={s.slug} value={s.nav}>
              {s.nav}
            </option>
          ))}
          <option value="Інше">Інше</option>
        </select>
      </div>

      <div className="lead__field">
        <label htmlFor={id("message")}>
          Коротко про питання <span className="lead__opt">— необов’язково</span>
        </label>
        <textarea id={id("message")} name="message" rows={3} maxLength={2000} />
      </div>

      <div className="lead__consent">
        <input
          id={id("consent")}
          name="consent"
          type="checkbox"
          required
          aria-invalid={!!err.consent}
          aria-describedby={err.consent ? id("consent-e") : undefined}
        />
        <label htmlFor={id("consent")}>
          Погоджуюся з обробкою персональних даних згідно з{" "}
          <a href={site.privacyUrl} target="_blank" rel="noopener" className="link-line">
            Політикою конфіденційності
          </a>
        </label>
        {err.consent && (
          <p id={id("consent-e")} className="lead__error">
            {err.consent}
          </p>
        )}
      </div>

      {state.error && (
        <p className="lead__error lead__error--form" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn btn--primary btn--lg lead__submit" disabled={pending}>
        <span className="btn__label">
          <span className="btn__text" data-text={pending ? "Надсилаємо…" : "Надіслати заявку"}>
            {pending ? "Надсилаємо…" : "Надіслати заявку"}
          </span>
        </span>
        <span className="btn__icon" aria-hidden>
          <span className="btn__icon-a">
            <IconArrow size={18} />
          </span>
          <span className="btn__icon-b">
            <IconArrow size={18} />
          </span>
        </span>
      </button>
    </form>
  );
}
