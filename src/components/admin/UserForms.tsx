"use client";

import { useState } from "react";
import {
  changePasswordAction,
  createUserAction,
  resetUserPasswordAction,
  updateProfileAction,
} from "@/app/admin/actions";
import { Field, SavedNote, SubmitButton, useFormAction } from "./ui";

/** Надійний пароль для видачі новому користувачу (його треба передати людині й попросити змінити) */
function generatePassword() {
  const abc = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const pick = (s: string, n: number) =>
    Array.from(crypto.getRandomValues(new Uint32Array(n)), (x) => s[x % s.length]).join("");
  return `${pick(abc, 5)}-${pick(digits, 3)}-${pick(abc, 5)}`;
}

function PasswordInput({ name, error, label = "Пароль" }: { name: string; error?: string; label?: string }) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  return (
    <Field label={label} error={error} hint="Щонайменше 10 символів, літери й цифри">
      <span className="adm-pass">
        <input name={name} type={show ? "text" : "password"} value={value} onChange={(e) => setValue(e.target.value)} autoComplete="new-password" />
        <button type="button" className="adm-link" onClick={() => setShow((s) => !s)}>
          {show ? "Сховати" : "Показати"}
        </button>
        <button
          type="button"
          className="adm-link"
          onClick={() => {
            setValue(generatePassword());
            setShow(true);
          }}
        >
          Згенерувати
        </button>
      </span>
    </Field>
  );
}

export function CreateUserForm() {
  const { state, dispatch, pending, onSubmit } = useFormAction(createUserAction);
  const e = state.errors ?? {};
  return (
    <form action={dispatch} onSubmit={onSubmit} className="adm-form" key={state.savedAt}>
      <div className="ed-row">
        <Field label="Ім’я" error={e.name}>
          <input name="name" autoComplete="off" />
        </Field>
        <Field label="Пошта (логін)" error={e.email}>
          <input name="email" type="email" autoComplete="off" />
        </Field>
      </div>
      <Field label="Роль" hint="Редактор — статті, SEO сторінок і заявки. Адміністратор — ще користувачі та аналітика.">
        <select name="role" defaultValue="editor">
          <option value="editor">Редактор</option>
          <option value="admin">Адміністратор</option>
        </select>
      </Field>
      <PasswordInput name="password" error={e.password} />
      <div className="adm-form__actions">
        <SubmitButton pending={pending}>Додати користувача</SubmitButton>
        <SavedNote state={state} />
      </div>
    </form>
  );
}

export function ResetPasswordForm({ id }: { id: number }) {
  const { state, dispatch, pending, onSubmit } = useFormAction(resetUserPasswordAction);
  return (
    <form action={dispatch} onSubmit={onSubmit} className="adm-form adm-form--inline">
      <input type="hidden" name="id" value={id} />
      <PasswordInput name="password" label="Новий пароль" />
      <div className="adm-form__actions">
        <SubmitButton variant="ghost" pending={pending}>Змінити пароль</SubmitButton>
        <SavedNote state={state} />
      </div>
    </form>
  );
}

export function ProfileForm({ name }: { name: string }) {
  const { state, dispatch, pending, onSubmit } = useFormAction(updateProfileAction);
  return (
    <form action={dispatch} onSubmit={onSubmit} className="adm-form">
      <Field label="Ім’я" error={state.errors?.name}>
        <input name="name" defaultValue={name} />
      </Field>
      <div className="adm-form__actions">
        <SubmitButton pending={pending}>Зберегти</SubmitButton>
        <SavedNote state={state} />
      </div>
    </form>
  );
}

export function ChangePasswordForm() {
  const { state, dispatch, pending, onSubmit } = useFormAction(changePasswordAction);
  return (
    <form action={dispatch} onSubmit={onSubmit} className="adm-form" key={state.savedAt}>
      <Field label="Поточний пароль" error={state.errors?.current}>
        <input name="current" type="password" autoComplete="current-password" />
      </Field>
      <PasswordInput name="password" label="Новий пароль" error={state.errors?.password} />
      <div className="adm-form__actions">
        <SubmitButton pending={pending}>Змінити пароль</SubmitButton>
        <SavedNote state={state} />
      </div>
    </form>
  );
}
