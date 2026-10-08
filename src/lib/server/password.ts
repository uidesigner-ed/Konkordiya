import "server-only";
import crypto from "node:crypto";

/** Паролі: scrypt (вбудований у Node) із випадковою сіллю; порівняння — за сталий час */

const N = 32768;
const R = 8;
const P = 1;
const KEYLEN = 64;

function scrypt(password: string, salt: Buffer, n: number, r: number, p: number) {
  return new Promise<Buffer>((resolve, reject) =>
    crypto.scrypt(password.normalize("NFKC"), salt, KEYLEN, { N: n, r, p, maxmem: 256 * n * r }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, N, R, P);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [alg, n, r, p, salt, hash] = stored.split("$");
  if (alg !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const key = await scrypt(password, Buffer.from(salt, "base64"), Number(n), Number(r), Number(p));
  return key.length === expected.length && crypto.timingSafeEqual(key, expected);
}

/** Мінімальні вимоги до пароля; повертає текст помилки або null */
export function passwordProblem(password: string) {
  if (password.length < 10) return "Пароль має містити щонайменше 10 символів";
  if (password.length > 200) return "Пароль задовгий";
  if (!/[a-zа-яіїєґ]/i.test(password) || !/\d/.test(password)) return "Додайте в пароль і літери, і цифри";
  return null;
}
