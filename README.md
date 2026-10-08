# Конкордія — сайт бухгалтерської компанії

Редизайн https://tyrkovevgen.com.ua/ — концепція **«Книга обліку»**: сторінка зверстана як бухгалтерська книга
(аркуші з номерами на полях, подвійна червона лінія поля, підсумки з подвійним підкресленням), у hero — WebGL-поле цифр
«з хаосу в порядок».

**Стек:** Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS 4 · GSAP 3 (ScrollTrigger, SplitText, DrawSVG,
ScrambleText) · Lenis · Motion · React Three Fiber · libSQL / Turso (база даних адмінки).

## Запуск

```bash
npm install
cp .env.example .env.local   # і заповніть ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev                  # http://localhost:3000, адмінка — /admin
npm run build && npm start
```

Локально база даних створюється сама у `data/konkordia.db` (тека не потрапляє в git): таблиці, 10 стартових статей
і перший адміністратор із `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Структура сайту

| Розділ | Адреса | Звідки береться |
| --- | --- | --- |
| Головна | `/` | `src/components/sections/*`, тексти — `src/content/uk.ts` |
| Послуги | `/poslugy`, `/poslugy/<послуга>` (10 сторінок) | `src/content/services.ts` |
| Новини | `/novyny`, `/novyny/<стаття>` | база даних (адмінка) |
| Адмінка | `/admin` | `src/app/admin/*` |

SEO-структура, розподіл ключових запитів, підключення Search Console, GA4 / GTM, Meta Pixel і події конверсій —
у [docs/SEO.md](docs/SEO.md).

## Де що редагувати

| Що | Де |
| --- | --- |
| Статті, їхні SEO-поля, «Популярне» | Адмінка → «Статті» |
| Title / Description головної, послуг, стрічки новин | Адмінка → «SEO сторінок» |
| GA4, GTM, Meta Pixel, Search Console, теги клієнта | Адмінка → «Аналітика й теги» (лише адміністратор) |
| Заявки з форм | Адмінка → «Заявки» |
| Користувачі адмінки | Адмінка → «Користувачі» (лише адміністратор) |
| Тексти головної | `src/content/uk.ts` |
| Тексти сторінок послуг і семантичне ядро | `src/content/services.ts` (назви для меню — `src/content/service-nav.ts`) |
| Категорії новин, підписи розділу | `src/content/news.ts` |
| Телефон, пошта, адреса, месенджери, посилання на відгуки | `src/config/site.ts` → `site` |
| Цифри лічильників (клієнти, компанії, ФОП/ТОВ/БФ) | `src/config/site.ts` → `stats` |
| Підписи до фото команди (імена, посади) | `src/config/site.ts` → `team` |
| Кольори, сітка, типографіка | `src/app/globals.css` (токени на початку), стилі новин і послуг — `src/styles/inner.css` |

У тексті `{ i: "..." }` позначає слова, набрані курсивною антиквою (фірмовий прийом: гротеск — «цифри», курсив — «люди»).

## Адмінка

- **Вхід** — `/admin`, за поштою й паролем. Сесії — httpOnly-cookie на 14 днів; після 5 невдалих спроб вхід блокується на 15 хв.
- **Ролі.** Редактор — статті, SEO сторінок, заявки. Адміністратор — ще користувачі та «Аналітика й теги».
- **Статті** — блоковий редактор (абзац, підзаголовок H2, списки, чек-лист, примітка, цитата; `**жирний**`),
  обкладинка з 10 векторних мотивів, чернетки, попередній перегляд. SEO-панель: ключовий запит з перевіркою
  (Title, H1, Description, початок тексту, H2, URL, щільність — попереджає про перенасичення), лічильники довжини,
  вигляд у Google, `noindex`, канонічна адреса, Open Graph.
- Після збереження сайт оновлюється одразу (сторінки статичні й перегенеровуються за потреби).

## Змінні середовища

Повний перелік із поясненнями — у `.env.example`.

| Змінна | Навіщо |
| --- | --- |
| `DATABASE_URL`, `DATABASE_AUTH_TOKEN` | База Turso на продакшні. Без них на Vercel зміни з адмінки не збережуться |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Перший адміністратор (створюється, лише якщо в базі ще немає користувачів) |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Сповіщення про заявки в Telegram (необов’язково) |
| `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `GOOGLE_SITE_VERIFICATION` | Запасний варіант, якщо не задано в адмінці |

## Ресурси

- **Фото.** Оригінали — `assets-src/original/` (портрети Євгенії — апскейл `*-hq.webp` від клієнта). Єдиний теплий грейд, обрізка «запечених» кутів,
  чистка тіні на вирізаному портреті: `node scripts/process-images.mjs` → `public/images/`.
- **Обкладинки статей** — векторні «аркуші книги обліку» (`src/components/news/NewsCover.tsx`), без фото.
- **Шрифти.** Самохостингові підмножини (Unbounded, Onest, Cormorant Garamond Italic, JetBrains Mono — усі OFL, ліцензії
  поруч у `src/fonts/`). Повна українська абетка (і, ї, є, ґ) + латиниця + типографіка + усі символи з контенту.
  Якщо в текстах з'являться нові незвичні символи — перезберіть: `node scripts/build-fonts.mjs`.
- **OG-картинка:** `node scripts/og.mjs` (джерело — `scripts/og.html`) → `public/og.jpg`.
- **Політика конфіденційності:** `public/docs/privacy-policy.pdf` (перенесено зі старого сайту).

## Візуальна перевірка

```bash
node scripts/shots.mjs ./shots desktop mobile tablet wide small     # секції головної (URL=http://localhost:3000/)
node scripts/montage.mjs ./shots/desktop ./shots/sheets             # листи для рев'ю
PAGES="/novyny,/poslugy" node scripts/news-shots.mjs ./shots-inner desktop mobile
```

## Продуктивність і доступність

- Шар анімацій (GSAP, плагіни, Lenis) вантажиться окремим чанком після гідратації; WebGL — після першої взаємодії
  або простою браузера. Аналітика, банер згоди й форма на головній — теж окремими чанками після першого екрана.
  Контент рендериться сервером і читається без JS.
- Тексти статей і сторінок послуг у браузерні скрипти не потрапляють (лише сервер); стилі внутрішніх сторінок —
  окремим файлом.
- `prefers-reduced-motion`: без прелоадера, плавного скролу, пінів і WebGL; горизонтальні етапи стають сіткою.
- Lighthouse (prod-збірка, локально, mobile): головна — Performance 87–92; послуги й статті — 89–94;
  Accessibility, Best Practices, SEO — 100 на всіх сторінках.

## Деплой на Vercel

1. **База даних.** Vercel → Storage / Marketplace → **Turso** (або turso.tech) → створіть базу → у змінних проєкту
   з’являться `DATABASE_URL` і `DATABASE_AUTH_TOKEN` (або додайте їх вручну).
2. **Змінні** у Vercel → Project → Settings → Environment Variables: `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   (і за бажанням `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).
3. Деплой — автоматично після `git push` (якщо репозиторій підключено до Vercel) або вручну:

```bash
npx vercel --prod
```

4. Увійдіть у `/admin`, змініть пароль у «Профілі», додайте ідентифікатори аналітики й пройдіть чек-лист із [docs/SEO.md](docs/SEO.md).
5. Підключіть домен `tyrkovevgen.com.ua` у Vercel → Project → Settings → Domains.
