/**
 * Підключення Telegram-бота заявок до сайту: вебхук, команди, опис перед кнопкою «Start».
 * Запускати на сервері після зміни домену, токена або секрету:
 *
 *   node --env-file=.env scripts/telegram-setup.mjs
 *
 * Потрібно в .env: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET; SITE_URL — якщо домен інший.
 */

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const site = (process.env.SITE_URL || "https://tyrkovevgen.com.ua").replace(/\/$/, "");

if (!token) fail("У .env немає TELEGRAM_BOT_TOKEN (токен від @BotFather)");
if (!secret || !/^[\w-]{16,256}$/.test(secret)) {
  fail("TELEGRAM_WEBHOOK_SECRET: від 16 символів, лише латиниця, цифри, _ і -.\n  Згенерувати: openssl rand -hex 24");
}

async function call(method, body = {}) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) fail(`${method}: ${json.description}`);
  return json.result;
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

const me = await call("getMe");
console.log(`✓ Бот: @${me.username}`);

await call("setWebhook", {
  url: `${site}/api/telegram`,
  secret_token: secret,
  allowed_updates: ["message", "callback_query"],
  drop_pending_updates: true,
});
console.log(`✓ Вебхук: ${site}/api/telegram`);

await call("setMyCommands", {
  commands: [
    { command: "start", description: "Залишити заявку" },
    { command: "cancel", description: "Скасувати заявку" },
  ],
  scope: { type: "all_private_chats" },
});
await call("setMyCommands", {
  commands: [{ command: "chatid", description: "ID чату для заявок" }],
  scope: { type: "all_group_chats" },
});
await call("setMyDescription", {
  description:
    "Вітаємо! Це бот бухгалтерської компанії «Конкордія».\n\n" +
    "Оберіть послугу, залиште ім’я та телефон — і наш менеджер зв’яжеться з вами.\n\nНатисніть «Почати» 👇",
});
console.log("✓ Команди й опис бота оновлено");

// Перевірка: Telegram сам звертається до сайту — помилки видно тут
await new Promise((r) => setTimeout(r, 1500));
const info = await call("getWebhookInfo");
if (info.last_error_message) {
  console.log(`⚠ Telegram повідомляє про помилку вебхука: ${info.last_error_message}`);
} else {
  console.log("✓ Помилок вебхука немає");
}
console.log(process.env.TELEGRAM_CHAT_ID ? `✓ Чат менеджерів: ${process.env.TELEGRAM_CHAT_ID}` : "⚠ TELEGRAM_CHAT_ID ще не задано: надішліть /chatid у групі «Заявки Конкордія»");
