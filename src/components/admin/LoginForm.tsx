"use client";

import { loginAction } from "@/app/admin/actions";
import { SubmitButton, useFormAction } from "./ui";

export function LoginForm() {
  const { state, dispatch, pending, onSubmit } = useFormAction(loginAction);
  return (
    <form action={dispatch} onSubmit={onSubmit} className="adm-form">
      <label className="adm-field">
        <span className="adm-field__label">Пошта</span>
        <input name="email" type="email" autoComplete="username" required autoFocus />
      </label>
      <label className="adm-field">
        <span className="adm-field__label">Пароль</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error && (
        <p className="adm-note adm-note--error" role="alert">
          {state.error}
        </p>
      )}
      <SubmitButton pendingText="Вхід…" pending={pending}>
        Увійти
      </SubmitButton>
    </form>
  );
}
