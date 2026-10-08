"use server";

import { clientIpHash } from "@/lib/server/auth";
import { createLead, recentLeadsFrom } from "@/lib/server/leads";
import { contactMethods } from "@/components/forms/lead-options";
import { serviceNav } from "@/content/service-nav";

export type LeadState = {
  ok: boolean;
  error?: string;
  fields?: Partial<Record<"name" | "phone" | "consent", string>>;
};

const clean = (v: FormDataEntryValue | null, max: number) =>
  String(v ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim()
    .slice(0, max);

/** Заявка з форми сайту */
export async function submitLead(_prev: LeadState, form: FormData): Promise<LeadState> {
  // Пастка для ботів: приховане поле має лишитися порожнім, а форму не заповнюють за секунду
  if (clean(form.get("website"), 200)) return { ok: true };
  const started = Number(form.get("t"));
  if (!Number.isFinite(started) || Date.now() - started < 2500) {
    return { ok: false, error: "Будь ласка, спробуйте ще раз за кілька секунд." };
  }

  const name = clean(form.get("name"), 80);
  const phone = clean(form.get("phone"), 30);
  const digits = phone.replace(/\D/g, "");
  const fields: LeadState["fields"] = {};
  if (name.length < 2) fields.name = "Вкажіть, як до вас звертатися";
  if (digits.length < 9 || digits.length > 15) fields.phone = "Перевірте номер телефону";
  if (form.get("consent") !== "on") fields.consent = "Потрібна згода на обробку даних";
  if (Object.keys(fields).length) return { ok: false, fields };

  const contact = clean(form.get("contact"), 20);
  const service = clean(form.get("service"), 120);
  const ipHash = await clientIpHash();
  if ((await recentLeadsFrom(ipHash)) >= 5) {
    return { ok: false, error: "Ви вже надіслали кілька заявок. Ми зв’яжемося з вами найближчим часом." };
  }

  let utm: Record<string, string> = {};
  try {
    const raw = JSON.parse(clean(form.get("utm"), 1000) || "{}") as Record<string, unknown>;
    utm = Object.fromEntries(
      Object.entries(raw)
        .filter(([k, v]) => /^(utm_(source|medium|campaign|term|content)|gclid|fbclid)$/.test(k) && typeof v === "string")
        .map(([k, v]) => [k, String(v).slice(0, 120)]),
    );
  } catch {}

  try {
    await createLead(
      {
        name,
        phone,
        contact: contactMethods.some((m) => m.id === contact) ? contact : "",
        service: serviceNav.some((s) => s.nav === service) || service === "Інше" ? service : "",
        message: clean(form.get("message"), 2000),
        page: clean(form.get("page"), 200),
        utm,
      },
      ipHash,
    );
  } catch {
    return { ok: false, error: "Не вдалося надіслати заявку. Напишіть нам у месенджер або зателефонуйте." };
  }
  return { ok: true };
}
