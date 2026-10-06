# Конкордія — сайт бухгалтерської компанії

Редизайн https://tyrkovevgen.com.ua/ — концепція **«Книга обліку»**: сторінка зверстана як бухгалтерська книга
(аркуші з номерами на полях, подвійна червона лінія поля, підсумки з подвійним підкресленням), у hero — WebGL-поле цифр
«з хаосу в порядок».

**Стек:** Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS 4 · GSAP 3 (ScrollTrigger, SplitText, DrawSVG,
ScrambleText) · Lenis · Motion · React Three Fiber.

## Запуск

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Де що редагувати

| Що | Файл |
| --- | --- |
| Усі тексти сайту (українською) | `src/content/uk.ts` |
| Телефон, пошта, адреса, месенджери, посилання на відгуки | `src/config/site.ts` → `site` |
| Цифри лічильників (клієнти, компанії, ФОП/ТОВ/БФ) | `src/config/site.ts` → `stats` |
| Підписи до фото команди (імена, посади) | `src/config/site.ts` → `team` |
| Кольори, сітка, типографіка | `src/app/globals.css` (токени на початку файлу) |

У тексті `{ i: "..." }` позначає слова, набрані курсивною антиквою (фірмовий прийом: гротеск — «цифри», курсив — «люди»).

## Ресурси

- **Фото.** Оригінали — `assets-src/original/` (портрети Євгенії — апскейл `*-hq.webp` від клієнта). Єдиний теплий грейд, обрізка «запечених» кутів,
  чистка тіні на вирізаному портреті: `node scripts/process-images.mjs` → `public/images/`.
- **Шрифти.** Самохостингові підмножини (Unbounded, Onest, Cormorant Garamond Italic, JetBrains Mono — усі OFL, ліцензії
  поруч у `src/fonts/`). Повна українська абетка (і, ї, є, ґ) + латиниця + типографіка + усі символи з контенту.
  Якщо в текстах з'являться нові незвичні символи — перезберіть: `node scripts/build-fonts.mjs`.
- **OG-картинка:** `node scripts/og.mjs` (джерело — `scripts/og.html`) → `public/og.jpg`.
- **Політика конфіденційності:** `public/docs/privacy-policy.pdf` (перенесено зі старого сайту).

## Візуальна перевірка

```bash
node scripts/shots.mjs ./shots desktop mobile tablet wide small   # скриншоти кожної секції (dev-сервер на :3100)
node scripts/montage.mjs ./shots/desktop ./shots/sheets           # листи для рев'ю
```

## Продуктивність і доступність

- Шар анімацій (GSAP, плагіни, Lenis) вантажиться окремим чанком після гідратації; WebGL — після першої взаємодії
  або простою браузера. Контент рендериться сервером і читається без JS.
- `prefers-reduced-motion`: без прелоадера, плавного скролу, пінів і WebGL; горизонтальні етапи стають сіткою.
- Lighthouse (prod-збірка, локально): mobile — Performance 90–94, Accessibility 100, Best Practices 100, SEO 100;
  desktop — 99 / 100 / 100 / 100.

## Деплой на Vercel

```bash
npx vercel          # перший раз: прив'язати проєкт (preview)
npx vercel --prod   # продакшн
```

Після деплою підключіть домен `tyrkovevgen.com.ua` у Vercel → Project → Settings → Domains.
