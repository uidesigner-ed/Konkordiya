"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/server/db";
import {
  clearLoginFailures,
  clientIpHash,
  createSession,
  destroySession,
  loginLocked,
  registerLoginFailure,
  requireAdmin,
  requireUser,
} from "@/lib/server/auth";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/server/password";
import { deleteArticle, saveArticle, validateArticle, type ArticleErrors } from "@/lib/server/articles";
import { savePageSeo, saveSettings, validateSettings } from "@/lib/server/settings";
import { deleteLead, leadStatuses, setLeadStatus, type LeadStatus } from "@/lib/server/leads";
import { countAdmins, findUserByEmail, isEmail } from "@/lib/server/users";
import { seoPages } from "@/lib/server/seo";

/**
 * Серверні дії адмінки. Кожна сама перевіряє сесію та роль — як публічний API.
 * Після змін контенту оновлюємо кеш усього сайту (сторінки статичні й перегенеровуються).
 */

export type FormState = { ok?: boolean; error?: string; errors?: Record<string, string | undefined>; savedAt?: number };

const refreshSite = () => revalidatePath("/", "layout");
const text = (f: FormData, k: string, max = 300) => String(f.get(k) ?? "").trim().slice(0, max);

/* ── Вхід / вихід ── */

let dummyHash: Promise<string> | null = null;

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email", 120).toLowerCase();
  const password = String(form.get("password") ?? "").slice(0, 200);
  const keys = [`e:${email}`, `ip:${await clientIpHash()}`];

  const locked = await loginLocked(keys);
  if (locked) return { error: `Забагато невдалих спроб. Спробуйте через ${locked} хв.` };

  const user = email ? await findUserByEmail(email) : null;
  // Однаковий час відповіді для наявної й неіснуючої пошти
  if (!dummyHash) dummyHash = hashPassword("konkordia-dummy-password-1");
  const ok = user ? await verifyPassword(password, user.passwordHash) : (await verifyPassword(password, await dummyHash), false);
  if (!user || !ok) {
    await registerLoginFailure(keys);
    return { error: "Невірна пошта або пароль" };
  }
  await clearLoginFailures(keys);
  await createSession(user.id);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/* ── Статті ── */

export async function saveArticleAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("payload") ?? "{}"));
  } catch {
    return { error: "Не вдалося прочитати дані форми" };
  }
  const { data, errors } = validateArticle(raw);
  const intent = String(form.get("intent") ?? "save");
  if (intent === "publish") data.status = "published";
  if (intent === "unpublish") data.status = "draft";
  // Чернетку можна зберегти й неповною; публікація — лише без помилок
  const blocking: ArticleErrors = data.status === "published" ? errors : { title: errors.title, slug: errors.slug };
  if (Object.values(blocking).some(Boolean)) {
    return { error: "Перевірте поля, позначені червоним", errors: blocking };
  }
  const res = await saveArticle(data, user.id);
  if ("errors" in res) return { error: "Перевірте поля, позначені червоним", errors: res.errors };
  refreshSite();
  if (!data.id) redirect(`/admin/articles/${res.id}?created=1`);
  return { ok: true, savedAt: Date.now() };
}

export async function deleteArticleAction(form: FormData) {
  await requireUser();
  const id = Number(form.get("id"));
  if (id > 0) await deleteArticle(id);
  refreshSite();
  redirect("/admin/articles?deleted=1");
}

/* ── SEO сторінок ── */

export async function savePageSeoAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const path = text(form, "path", 200);
  if (!seoPages.some((p) => p.path === path)) return { error: "Невідома сторінка" };
  await savePageSeo(path, {
    title: text(form, "title", 120) || undefined,
    description: text(form, "description", 320) || undefined,
    ogTitle: text(form, "ogTitle", 120) || undefined,
    ogDescription: text(form, "ogDescription", 320) || undefined,
    noindex: form.get("noindex") === "on" || undefined,
  });
  refreshSite();
  return { ok: true, savedAt: Date.now() };
}

/* ── Налаштування (лише адміністратор) ── */

export async function saveSettingsAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const { data, errors } = validateSettings(Object.fromEntries(form.entries()) as Record<string, FormDataEntryValue>);
  if (Object.keys(errors).length) return { error: "Перевірте формат полів", errors };
  await saveSettings(data);
  refreshSite();
  return { ok: true, savedAt: Date.now() };
}

/* ── Заявки ── */

export async function setLeadStatusAction(form: FormData) {
  await requireUser();
  const id = Number(form.get("id"));
  const status = String(form.get("status")) as LeadStatus;
  if (id > 0 && leadStatuses.some((s) => s.id === status)) await setLeadStatus(id, status);
  revalidatePath("/admin/leads");
}

export async function deleteLeadAction(form: FormData) {
  await requireUser();
  const id = Number(form.get("id"));
  if (id > 0) await deleteLead(id);
  revalidatePath("/admin/leads");
}

/* ── Користувачі (лише адміністратор) ── */

export async function createUserAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const name = text(form, "name", 80);
  const email = text(form, "email", 120).toLowerCase();
  const role = form.get("role") === "admin" ? "admin" : "editor";
  const password = String(form.get("password") ?? "");
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Вкажіть ім’я";
  if (!isEmail(email)) errors.email = "Некоректна пошта";
  const pw = passwordProblem(password);
  if (pw) errors.password = pw;
  if (Object.keys(errors).length) return { error: "Перевірте поля", errors };
  if (await findUserByEmail(email)) return { error: "Користувач з такою поштою вже є", errors: { email: "Вже зайнята" } };
  const c = await db();
  await c.execute({
    sql: "INSERT INTO users (email, name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
    args: [email, name, role, await hashPassword(password), Date.now()],
  });
  revalidatePath("/admin/users");
  return { ok: true, savedAt: Date.now() };
}

export async function updateUserRoleAction(form: FormData) {
  const me = await requireAdmin();
  const id = Number(form.get("id"));
  const role = form.get("role") === "admin" ? "admin" : "editor";
  if (id === me.id) return; // власну роль не змінюємо — щоб не залишитися без адміністратора
  const c = await db();
  await c.execute({ sql: "UPDATE users SET role = ? WHERE id = ?", args: [role, id] });
  revalidatePath("/admin/users");
}

export async function resetUserPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(form.get("id"));
  const password = String(form.get("password") ?? "");
  const pw = passwordProblem(password);
  if (pw) return { error: pw };
  const c = await db();
  await c.execute({ sql: "UPDATE users SET password_hash = ? WHERE id = ?", args: [await hashPassword(password), id] });
  // Старі сесії цього користувача більше не діють
  await c.execute({ sql: "DELETE FROM sessions WHERE user_id = ?", args: [id] });
  return { ok: true, savedAt: Date.now() };
}

export async function deleteUserAction(form: FormData) {
  const me = await requireAdmin();
  const id = Number(form.get("id"));
  if (!(id > 0) || id === me.id) return;
  const c = await db();
  const { rows } = await c.execute({ sql: "SELECT role FROM users WHERE id = ?", args: [id] });
  if (rows[0]?.role === "admin" && (await countAdmins()) <= 1) return;
  await c.execute({ sql: "DELETE FROM sessions WHERE user_id = ?", args: [id] });
  await c.execute({ sql: "DELETE FROM users WHERE id = ?", args: [id] });
  revalidatePath("/admin/users");
}

/* ── Профіль ── */

export async function updateProfileAction(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireUser();
  const name = text(form, "name", 80);
  if (name.length < 2) return { error: "Вкажіть ім’я", errors: { name: "Вкажіть ім’я" } };
  const c = await db();
  await c.execute({ sql: "UPDATE users SET name = ? WHERE id = ?", args: [name, me.id] });
  revalidatePath("/admin", "layout");
  return { ok: true, savedAt: Date.now() };
}

export async function changePasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const me = await requireUser();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("password") ?? "");
  const c = await db();
  const { rows } = await c.execute({ sql: "SELECT password_hash FROM users WHERE id = ?", args: [me.id] });
  if (!rows[0] || !(await verifyPassword(current, String(rows[0].password_hash)))) {
    return { error: "Поточний пароль невірний", errors: { current: "Невірний пароль" } };
  }
  const pw = passwordProblem(next);
  if (pw) return { error: pw, errors: { password: pw } };
  await c.execute({ sql: "UPDATE users SET password_hash = ? WHERE id = ?", args: [await hashPassword(next), me.id] });
  // Виходимо з усіх інших пристроїв і відкриваємо нову сесію тут
  await c.execute({ sql: "DELETE FROM sessions WHERE user_id = ?", args: [me.id] });
  await createSession(me.id);
  return { ok: true, savedAt: Date.now() };
}
