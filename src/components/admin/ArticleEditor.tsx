"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { saveArticleAction } from "@/app/admin/actions";
import { blockTypes, categories, covers, type Article, type Block } from "@/content/news";
import { slugify } from "@/lib/translit";
import { analyzeArticle } from "@/lib/seo-check";
import { articleText, readingTime } from "@/lib/news";
import { NewsCover } from "@/components/news/NewsCover";
import { Field, SavedNote, useFormAction } from "./ui";

type BlockType = Block["t"];
/** Блок у редакторі: усі поля текстом (списки — рядок на пункт) */
type EB = { key: string; t: BlockType; text: string; items: string; title: string; label: string; cite: string };

const SITE = "tyrkovevgen.com.ua";
const BRAND = " — Конкордія";
let seq = 0;
const newKey = () => `b${Date.now().toString(36)}${(seq++).toString(36)}`;

function toEB(b: Block): EB {
  const base: EB = { key: newKey(), t: b.t, text: "", items: "", title: "", label: "", cite: "" };
  switch (b.t) {
    case "ul":
    case "ol":
      return { ...base, items: b.items.join("\n") };
    case "check":
      return { ...base, title: b.title, items: b.items.join("\n") };
    case "note":
      return { ...base, label: b.label, text: b.text };
    case "quote":
      return { ...base, text: b.text, cite: b.cite ?? "" };
    default:
      return { ...base, text: b.text };
  }
}

function fromEB(e: EB): Record<string, unknown> {
  const items = e.items
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  switch (e.t) {
    case "ul":
    case "ol":
      return { t: e.t, items };
    case "check":
      return { t: "check", title: e.title, items };
    case "note":
      return { t: "note", label: e.label, text: e.text };
    case "quote":
      return { t: "quote", text: e.text, cite: e.cite };
    case "h2":
      return { t: "h2", text: e.text };
    default:
      return { t: "p", text: e.text };
  }
}

const today = () => new Date().toISOString().slice(0, 10);

export function ArticleEditor({ article }: { article?: Article }) {
  const isNew = !article?.id;
  const { state, dispatch, pending, onSubmit } = useFormAction(saveArticleAction);
  const [intent, setIntent] = useState("save");
  const [handledSave, setHandledSave] = useState<number | undefined>(undefined);

  const [status, setStatus] = useState(article?.status ?? "draft");
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [category, setCategory] = useState<string>(article?.category ?? categories[0].id);
  const [tags, setTags] = useState((article?.tags ?? []).join(", "));
  const [date, setDate] = useState(article?.date ?? today());
  const [updated, setUpdated] = useState(article?.updated ?? "");
  const [author, setAuthor] = useState(article?.author ?? "Команда «Конкордії»");
  const [cover, setCover] = useState<string>(article?.cover ?? "stack");
  const [summary, setSummary] = useState((article?.summary ?? []).join("\n"));
  const [popularRank, setPopularRank] = useState(article?.popularRank ? String(article.popularRank) : "");
  const [blocks, setBlocks] = useState<EB[]>(() => (article?.body.length ? article.body.map(toEB) : [toEB({ t: "p", text: "" })]));
  const [seo, setSeo] = useState({
    title: article?.seo?.title ?? "",
    description: article?.seo?.description ?? "",
    keyword: article?.seo?.keyword ?? "",
    canonical: article?.seo?.canonical ?? "",
    noindex: !!article?.seo?.noindex,
    ogTitle: article?.seo?.ogTitle ?? "",
    ogDescription: article?.seo?.ogDescription ?? "",
  });
  const [dirty, setDirty] = useState(false);

  const errors = state.errors ?? {};
  const effectiveSlug = slugTouched ? slug : slugify(title);

  const payload = useMemo(
    () => ({
      id: article?.id,
      status,
      title,
      slug: effectiveSlug,
      excerpt,
      category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      date,
      updated,
      author,
      cover,
      summary: summary.split("\n").map((s) => s.trim()).filter(Boolean),
      body: blocks.map(fromEB),
      popularRank: popularRank ? Number(popularRank) : null,
      seo,
    }),
    [article?.id, status, title, effectiveSlug, excerpt, category, tags, date, updated, author, cover, summary, blocks, popularRank, seo],
  );

  // Після успішного збереження: оновлюємо статус і знімаємо позначку «є незбережені зміни»
  if (state.ok && state.savedAt !== handledSave) {
    setHandledSave(state.savedAt);
    if (intent === "publish") setStatus("published");
    if (intent === "unpublish") setStatus("draft");
    setDirty(false);
  }

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const touch = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setDirty(true);
  };

  /* ── Блоки ── */
  const updateBlock = (key: string, patch: Partial<EB>) => {
    setBlocks((bs) => bs.map((b) => (b.key === key ? { ...b, ...patch } : b)));
    setDirty(true);
  };
  const moveBlock = (i: number, d: -1 | 1) => {
    setBlocks((bs) => {
      const j = i + d;
      if (j < 0 || j >= bs.length) return bs;
      const next = [...bs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setDirty(true);
  };
  const removeBlock = (key: string) => {
    setBlocks((bs) => (bs.length > 1 ? bs.filter((b) => b.key !== key) : bs));
    setDirty(true);
  };
  const insertBlock = (at: number, t: BlockType) => {
    const b: EB = { key: newKey(), t, text: "", items: "", title: t === "check" ? "Чек-лист" : "", label: t === "note" ? "Важливо" : "", cite: "" };
    setBlocks((bs) => [...bs.slice(0, at), b, ...bs.slice(at)]);
    setDirty(true);
  };

  /* ── SEO ── */
  const defaultTitle = `${title || "Заголовок статті"}${BRAND}`;
  const finalTitle = seo.title || defaultTitle;
  const finalDesc = seo.description || excerpt;
  const bodyBlocks = payload.body as Block[];
  const firstP = excerpt + " " + (bodyBlocks.find((b) => b.t === "p") as { text?: string } | undefined)?.text;
  const checks = analyzeArticle({
    keyword: seo.keyword,
    title,
    seoTitle: finalTitle,
    seoDescription: finalDesc,
    slug: effectiveSlug,
    firstParagraph: firstP,
    headings: bodyBlocks.filter((b) => b.t === "h2").map((b) => (b as { text: string }).text),
    fullText: articleText({ title, excerpt, summary: payload.summary, body: bodyBlocks }),
  });
  const minutes = readingTime({ title, excerpt, summary: payload.summary, body: bodyBlocks });
  const setSeoField = (k: keyof typeof seo, v: string | boolean) => {
    setSeo((s) => ({ ...s, [k]: v }));
    setDirty(true);
  };

  return (
    <form
      action={dispatch}
      className="ed"
      onSubmit={(e) => {
        setIntent(((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value || "save");
        onSubmit(e);
      }}
    >
      <input type="hidden" name="payload" value={JSON.stringify(payload)} />

      <div className="ed-bar">
        <div className="ed-bar__info">
          <Link href="/admin/articles" className="adm-link">
            ← Статті
          </Link>
          <span className={`adm-badge adm-badge--${status}`}>{status === "published" ? "Опубліковано" : "Чернетка"}</span>
          {dirty && <span className="adm-muted">є незбережені зміни</span>}
          <SavedNote state={state} />
        </div>
        <div className="ed-bar__actions">
          {!isNew && (
            <a href={`/admin/preview/${article!.id}`} target="_blank" rel="noopener" className="adm-btn adm-btn--ghost">
              Перегляд
            </a>
          )}
          {!isNew && status === "published" && (
            <a href={`/novyny/${article!.slug}`} target="_blank" rel="noopener" className="adm-btn adm-btn--ghost">
              На сайті ↗
            </a>
          )}
          {status === "published" ? (
            <>
              <button type="submit" name="intent" value="unpublish" className="adm-btn adm-btn--ghost" disabled={pending}>
                У чернетки
              </button>
              <button type="submit" name="intent" value="save" className="adm-btn adm-btn--primary" disabled={pending}>
                {pending ? "Збереження…" : "Зберегти"}
              </button>
            </>
          ) : (
            <>
              <button type="submit" name="intent" value="save" className="adm-btn adm-btn--ghost" disabled={pending}>
                {pending ? "Збереження…" : "Зберегти чернетку"}
              </button>
              <button type="submit" name="intent" value="publish" className="adm-btn adm-btn--primary" disabled={pending}>
                Опублікувати
              </button>
            </>
          )}
        </div>
      </div>

      <div className="ed-grid">
        <div className="ed-main">
          <Field label="Заголовок (H1)" error={errors.title} counter={{ value: title.length, min: 20, max: 90 }}>
            <input
              className="ed-title"
              value={title}
              onChange={(e) => touch(setTitle)(e.target.value)}
              placeholder="Наприклад: Як обрати систему оподаткування для ФОП"
            />
          </Field>
          <Field
            label="Адреса сторінки (URL)"
            error={errors.slug}
            hint={
              !isNew && status === "published"
                ? "Зміна адреси опублікованої статті зламає старі посилання на неї"
                : "Латиницею, через дефіс; формується із заголовка автоматично"
            }
          >
            <span className="ed-slug">
              <span className="adm-muted">{SITE}/novyny/</span>
              <input
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  touch(setSlug)(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                }}
              />
            </span>
          </Field>
          <Field
            label="Лід — 1–2 речення під заголовком"
            error={errors.excerpt}
            hint="Показується в картці статті та стає Meta Description, якщо його не задано окремо"
            counter={{ value: excerpt.length, min: 70, max: 220 }}
          >
            <textarea rows={3} value={excerpt} onChange={(e) => touch(setExcerpt)(e.target.value)} />
          </Field>
          <Field label="«Коротко» — головні тези" hint="Кожна теза з нового рядка, 2–4 пункти">
            <textarea rows={3} value={summary} onChange={(e) => touch(setSummary)(e.target.value)} />
          </Field>

          <div className="ed-body">
            <div className="ed-body__head">
              <h2>Текст статті</h2>
              <span className="adm-muted">
                ≈ {minutes} хв читання · **жирний** — виділення
              </span>
            </div>
            {errors.body && <p className="adm-note adm-note--error">{errors.body}</p>}
            {blocks.map((b, i) => (
              <div key={b.key} className={`ed-block ed-block--${b.t}`}>
                <div className="ed-block__bar">
                  <select
                    value={b.t}
                    onChange={(e) => updateBlock(b.key, { t: e.target.value as BlockType })}
                    aria-label="Тип блоку"
                  >
                    {blockTypes.map((t) => (
                      <option key={t.t} value={t.t}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <div className="ed-block__tools">
                    <button type="button" onClick={() => moveBlock(i, -1)} disabled={i === 0} aria-label="Вище">
                      ↑
                    </button>
                    <button type="button" onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1} aria-label="Нижче">
                      ↓
                    </button>
                    <button type="button" onClick={() => insertBlock(i + 1, "p")} aria-label="Додати абзац нижче">
                      +
                    </button>
                    <button type="button" onClick={() => removeBlock(b.key)} aria-label="Видалити блок" className="is-danger">
                      ✕
                    </button>
                  </div>
                </div>
                <BlockFields b={b} onChange={(patch) => updateBlock(b.key, patch)} />
              </div>
            ))}
            <div className="ed-add">
              <span className="adm-muted">Додати:</span>
              {blockTypes.map((t) => (
                <button key={t.t} type="button" className="adm-chip" onClick={() => insertBlock(blocks.length, t.t)}>
                  + {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="ed-side">
          <section className="adm-card">
            <h2>Публікація</h2>
            <div className="ed-row">
              <Field label="Дата публікації" error={errors.date}>
                <input type="date" value={date} onChange={(e) => touch(setDate)(e.target.value)} />
              </Field>
              <Field label="Оновлено" hint="Якщо статтю суттєво змінили">
                <input type="date" value={updated} onChange={(e) => touch(setUpdated)(e.target.value)} />
              </Field>
            </div>
            <Field label="Категорія" error={errors.category}>
              <select value={category} onChange={(e) => touch(setCategory)(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Теми (теги)" hint="Через кому, до 8">
              <input value={tags} onChange={(e) => touch(setTags)(e.target.value)} placeholder="ФОП, Звітність" />
            </Field>
            <Field label="Автор">
              <input value={author} onChange={(e) => touch(setAuthor)(e.target.value)} />
            </Field>
            <Field label="Місце в «Популярному»" hint="1 — перше; порожньо — не закріплювати">
              <input type="number" min={1} max={20} value={popularRank} onChange={(e) => touch(setPopularRank)(e.target.value)} />
            </Field>
          </section>

          <section className="adm-card">
            <h2>Обкладинка</h2>
            <div className="ed-covers" role="radiogroup" aria-label="Мотив обкладинки">
              {covers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={cover === c.id}
                  className="ed-cover"
                  onClick={() => touch(setCover)(c.id)}
                  title={c.label}
                >
                  <NewsCover cover={c.id} n="00" uid={`pick-${c.id}`} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="adm-card">
            <h2>SEO</h2>
            <Field label="Ключовий запит" hint="Головний запит статті — для перевірки нижче">
              <input value={seo.keyword} onChange={(e) => setSeoField("keyword", e.target.value)} placeholder="бухгалтер для ФОП" />
            </Field>
            {checks.length > 0 && (
              <ul className="adm-checks adm-checks--sm">
                {checks.map((c) => (
                  <li key={c.text} className={c.ok ? "is-ok" : c.warn ? "is-warn" : "is-off"}>
                    <span aria-hidden>{c.ok ? "✓" : c.warn ? "!" : "—"}</span>
                    <span>{c.text}</span>
                  </li>
                ))}
              </ul>
            )}
            <Field label="SEO Title" hint="Порожньо — заголовок статті + «— Конкордія»" counter={{ value: finalTitle.length, min: 30, max: 60 }}>
              <input value={seo.title} onChange={(e) => setSeoField("title", e.target.value)} placeholder={defaultTitle} />
            </Field>
            <Field label="Meta Description" hint="Порожньо — береться лід" counter={{ value: finalDesc.length, min: 70, max: 160 }}>
              <textarea rows={4} value={seo.description} onChange={(e) => setSeoField("description", e.target.value)} placeholder={excerpt} />
            </Field>
            <div className="snippet" aria-label="Як виглядатиме в Google">
              <span className="snippet__url">
                {SITE} › novyny › {effectiveSlug || "…"}
              </span>
              <span className="snippet__title">{finalTitle.length > 62 ? `${finalTitle.slice(0, 60)}…` : finalTitle}</span>
              <span className="snippet__desc">{finalDesc.length > 162 ? `${finalDesc.slice(0, 158)}…` : finalDesc || "Опис сторінки…"}</span>
            </div>
            <label className="adm-check">
              <input type="checkbox" checked={seo.noindex} onChange={(e) => setSeoField("noindex", e.target.checked)} />
              Не індексувати (noindex) — сторінку не буде в Google
            </label>
            <details className="ed-more">
              <summary>Соцмережі та канонічна адреса</summary>
              <Field label="Заголовок для соцмереж (OG)">
                <input value={seo.ogTitle} onChange={(e) => setSeoField("ogTitle", e.target.value)} placeholder={finalTitle} />
              </Field>
              <Field label="Опис для соцмереж (OG)">
                <textarea rows={3} value={seo.ogDescription} onChange={(e) => setSeoField("ogDescription", e.target.value)} placeholder={finalDesc} />
              </Field>
              <Field label="Канонічна адреса" error={errors.canonical} hint="Лише якщо оригінал статті розміщено на іншій сторінці">
                <input value={seo.canonical} onChange={(e) => setSeoField("canonical", e.target.value)} placeholder="https://…" />
              </Field>
            </details>
          </section>
        </aside>
      </div>
    </form>
  );
}

function BlockFields({ b, onChange }: { b: EB; onChange: (patch: Partial<EB>) => void }) {
  switch (b.t) {
    case "h2":
      return (
        <input
          className="ed-h2"
          value={b.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Підзаголовок розділу (H2) — з’явиться в змісті статті"
        />
      );
    case "ul":
    case "ol":
      return (
        <textarea
          rows={4}
          value={b.items}
          onChange={(e) => onChange({ items: e.target.value })}
          placeholder="Кожен пункт — з нового рядка"
        />
      );
    case "check":
      return (
        <>
          <input value={b.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Назва чек-листа" />
          <textarea rows={4} value={b.items} onChange={(e) => onChange({ items: e.target.value })} placeholder="Кожен пункт — з нового рядка" />
        </>
      );
    case "note":
      return (
        <>
          <input value={b.label} onChange={(e) => onChange({ label: e.target.value })} placeholder="Важливо / Порада / Зверніть увагу" list="note-labels" />
          <datalist id="note-labels">
            <option value="Важливо" />
            <option value="Порада" />
            <option value="Зверніть увагу" />
          </datalist>
          <textarea rows={3} value={b.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Текст примітки" />
        </>
      );
    case "quote":
      return (
        <>
          <textarea rows={3} value={b.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Текст цитати" />
          <input value={b.cite} onChange={(e) => onChange({ cite: e.target.value })} placeholder="Автор цитати (необов’язково)" />
        </>
      );
    default:
      return <textarea rows={4} value={b.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Текст абзацу" />;
  }
}
