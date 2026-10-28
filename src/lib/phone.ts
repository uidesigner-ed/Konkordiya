/**
 * Перевірка й нормалізація номера телефону — спільна для форми сайту (браузер і сервер) і Telegram-бота.
 * Українські номери — строго за довжиною, іноземні — лише з «+» (10–15 цифр).
 */

export const PHONE_ERROR = "Перевірте правильність номера телефону";

/** Номер у форматі +380… (або +<код країни>…); null — номер некоректний */
export function normalizePhone(raw: string): string | null {
  const s = raw.trim();
  // Дозволені лише цифри, пробіли, дужки, дефіси, крапки й «+» на початку
  if (!s || /[^\d\s()+\-.]/.test(s) || s.lastIndexOf("+") > 0) return null;
  const d = s.replace(/\D/g, "");
  const ua = (national: string) => (/^[1-9]\d{8}$/.test(national) ? `+380${national}` : null);

  if (d.startsWith("380")) return d.length === 12 ? ua(d.slice(3)) : null; // +380 50 123 45 67
  if (s.startsWith("+")) return d.length >= 10 && d.length <= 15 ? `+${d}` : null; // інша країна
  if (d.startsWith("80")) return d.length === 11 ? ua(d.slice(2)) : null; // 8 050 123 45 67
  if (d.startsWith("0")) return d.length === 10 ? ua(d.slice(1)) : null; // 050 123 45 67
  if (d.length === 9) return ua(d); // 50 123 45 67
  return null;
}

export const UA_PREFIX = "+380 ";

/**
 * Маска поля телефону: «+380 50 123 45 67». Вставлене «050…», «+380…», «380…» приводиться до маски;
 * префікс +380 не стирається Backspace-ом; номер іншої країни (з «+», не 380) лишається як є.
 */
export function formatPhoneInput(value: string): string {
  const plus = value.trim().startsWith("+");
  let d = value.replace(/\D/g, "");
  if (!d) return plus ? "+" : "";
  // Почали вводити код іншої країни (+4…, +35…) — не заважаємо
  if (plus && !d.startsWith("380") && !"380".startsWith(d)) return value;
  if (plus && d.length < 3) return value; // «+3», «+38» — ще не зрозуміло, що за код
  if (!plus && d.startsWith("0")) d = `38${d}`;
  if (!d.startsWith("380")) d = `380${d}`;
  // Вставили повний номер у поле, де вже стояв префікс: «+380 0501234567» / «+380 +380501234567»
  let n = d.slice(3);
  if (n.startsWith("380") && n.length > 9) n = n.slice(3);
  if (n.startsWith("0")) n = n.slice(1);
  n = n.slice(0, 9);
  const groups = [n.slice(0, 2), n.slice(2, 5), n.slice(5, 7), n.slice(7, 9)].filter(Boolean);
  return groups.length ? `+380 ${groups.join(" ")}` : UA_PREFIX;
}
