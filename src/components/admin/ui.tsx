"use client";

import { startTransition, useActionState, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/admin/actions";

/** Дрібні клієнтські елементи адмінки */

/**
 * Серверна дія для форми без автоочищення полів: React 19 скидає форму після action,
 * тож відправляємо вручну (з даними кнопки-відправника), а action лишається запасним шляхом без JS.
 */
export function useFormAction(action: (prev: FormState, form: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState<FormState, FormData>(action, {});
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const data = new FormData(e.currentTarget, submitter);
    startTransition(() => dispatch(data));
  };
  return { state, dispatch, pending, onSubmit };
}

export function SubmitButton({
  children,
  pendingText = "Збереження…",
  variant = "primary",
  name,
  value,
  pending: pendingProp,
}: {
  children: ReactNode;
  pendingText?: string;
  variant?: "primary" | "ghost" | "danger";
  name?: string;
  value?: string;
  /** Для форм з useFormAction (useFormStatus тоді не знає про відправку) */
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <button type="submit" className={`adm-btn adm-btn--${variant}`} disabled={pending} name={name} value={value}>
      {pending ? pendingText : children}
    </button>
  );
}

/** Кнопка з підтвердженням (видалення тощо) */
export function ConfirmButton({ children, message, className = "adm-btn adm-btn--danger" }: { children: ReactNode; message: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

/** Повідомлення «Збережено» на кілька секунд після успішної дії */
export function SavedNote({ state }: { state: FormState }) {
  const [shown, setShown] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (!state.ok || !state.savedAt) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- показ підтвердження після відповіді сервера
    setShown(state.savedAt);
    const t = setTimeout(() => setShown(undefined), 3500);
    return () => clearTimeout(t);
  }, [state.ok, state.savedAt]);
  if (state.error) return <p className="adm-note adm-note--error" role="alert">{state.error}</p>;
  if (shown) return <p className="adm-note adm-note--ok" role="status">Збережено</p>;
  return null;
}

/** Поле з підписом, підказкою та помилкою */
export function Field({
  label,
  hint,
  error,
  counter,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  counter?: { value: number; min?: number; max: number };
  children: ReactNode;
}) {
  const tone = counter
    ? counter.value === 0
      ? ""
      : counter.value > counter.max || (counter.min && counter.value < counter.min)
        ? "warn"
        : "ok"
    : "";
  return (
    <label className={`adm-field ${error ? "adm-field--error" : ""}`}>
      <span className="adm-field__head">
        <span className="adm-field__label">{label}</span>
        {counter && (
          <span className={`adm-count adm-count--${tone}`}>
            {counter.value} / {counter.min ? `${counter.min}–` : ""}
            {counter.max}
          </span>
        )}
      </span>
      {children}
      {error ? <span className="adm-field__error">{error}</span> : hint ? <span className="adm-field__hint">{hint}</span> : null}
    </label>
  );
}
