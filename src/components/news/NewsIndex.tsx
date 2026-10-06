"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { newsUi } from "@/content/news";
import { prefersReducedMotion } from "@/lib/motion";
import { IconSearch } from "@/components/ui/Icons";

export type IndexItem = { slug: string; category: string; search: string };
type Cat = { id: string; label: string; count: number };

const PAGE = 6;
const PARAM = "katehoriia";

const plural = (n: number) => {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return "матеріал";
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return "матеріали";
  return "матеріалів";
};

/** Читає ?katehoriia= окремо, у власному Suspense — щоб сітка рендерилася сервером */
function CategoryFromUrl({ onChange }: { onChange: (id: string) => void }) {
  const params = useSearchParams();
  const value = params.get(PARAM) ?? "";
  useEffect(() => onChange(value), [value, onChange]);
  return null;
}

/**
 * Стрічка новин: фільтр за категоріями, пошук, «Показати ще».
 * Картки рендерить сервер (props `cards`), тут — лише видимість і анімації.
 */
export function NewsIndex({
  items,
  categories,
  featured,
  cards,
  aside,
}: {
  items: IndexItem[];
  categories: Cat[];
  featured: ReactNode;
  cards: Record<string, ReactNode>;
  aside: ReactNode;
}) {
  const [cat, setCat] = useState("");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const grid = useRef<HTMLDivElement>(null);
  const revealed = useRef(new Set<string>());
  const prevVisible = useRef<Set<string> | null>(null);

  const valid = useMemo(() => new Set(categories.map((c) => c.id)), [categories]);
  const fromUrl = useMemo(
    () => (id: string) => {
      setCat(valid.has(id) ? id : "");
      setLimit(PAGE);
    },
    [valid],
  );

  const q = query.trim().toLowerCase();
  const filtering = cat !== "" || q !== "";
  const matches = items.filter((it) => (!cat || it.category === cat) && (!q || it.search.includes(q)));
  // Без фільтрів перша (найновіша) стаття — у блоці «Головне», решта — у сітці
  const pool = filtering ? matches : matches.slice(1);
  const visible = pool.slice(0, limit);
  const rest = pool.length - visible.length;
  const visibleKey = visible.map((v) => v.slug).join(",");

  const choose = (id: string) => {
    setCat(id);
    setLimit(PAGE);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set(PARAM, id);
    else url.searchParams.delete(PARAM);
    window.history.replaceState(window.history.state, "", url);
  };
  const reset = () => {
    setQuery("");
    choose("");
  };

  // Поява карток: нові у видимому наборі — «підводяться» з легким каскадом;
  // ті, що нижче першого екрана, з’являються при прокрутці
  useEffect(() => {
    const root = grid.current;
    if (!root) return;
    const reduced = prefersReducedMotion();
    const els = [...root.querySelectorAll<HTMLElement>("[data-slug]:not([hidden])")];
    const prev = prevVisible.current;
    prevVisible.current = new Set(els.map((el) => el.dataset.slug!));
    if (reduced) return;

    const play = (el: HTMLElement, delay: number) => {
      revealed.current.add(el.dataset.slug!);
      el.style.opacity = "";
      el.animate(
        [
          { opacity: 0, transform: "translateY(40px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 900, delay, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" },
      );
    };

    // Перший прохід: видиме на екрані не чіпаємо (воно вже намальоване сервером)
    if (!prev) {
      const io = new IntersectionObserver(
        (entries) => {
          let k = 0;
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            io.unobserve(e.target);
            play(e.target as HTMLElement, k++ * 90);
          });
        },
        { rootMargin: "0px 0px -8% 0px" },
      );
      els.forEach((el) => {
        if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
          el.style.opacity = "0";
          io.observe(el);
        } else revealed.current.add(el.dataset.slug!);
      });
      return () => io.disconnect();
    }

    // Зміна фільтра / «Показати ще»: анімуємо ті, що з’явилися
    let k = 0;
    els.forEach((el) => {
      if (!prev.has(el.dataset.slug!) || el.style.opacity === "0") play(el, k++ * 70);
    });
  }, [visibleKey]);

  const countLabel = `${newsUi.found} ${pool.length + (filtering ? 0 : 1)} ${plural(pool.length + (filtering ? 0 : 1))}`;

  return (
    <div className="nx-index page-x">
      <Suspense fallback={null}>
        <CategoryFromUrl onChange={fromUrl} />
      </Suspense>

      <div className="nx-tools">
        <div role="group" aria-label={newsUi.filter} className="nx-chips">
          <button type="button" className="nchip" aria-pressed={cat === ""} onClick={() => choose("")}>
            {newsUi.all}
            <sup className="t-mono">{items.length}</sup>
          </button>
          {categories.map((c) => (
            <button key={c.id} type="button" className="nchip" aria-pressed={cat === c.id} onClick={() => choose(c.id)}>
              {c.label}
              <sup className="t-mono">{c.count}</sup>
            </button>
          ))}
        </div>
        <label className="nx-search">
          <span className="sr-only">{newsUi.search}</span>
          <IconSearch size={20} />
          <input
            type="search"
            value={query}
            placeholder={newsUi.searchPlaceholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            autoComplete="off"
            enterKeyHint="search"
          />
        </label>
      </div>
      <p className="sr-only" aria-live="polite">
        {countLabel}
      </p>

      <div className="nx-featured" hidden={filtering}>
        {featured}
      </div>

      <div className="nx-layout">
        <div className="nx-main">
          <div ref={grid} className="nx-grid">
            {items.map((it) => {
              const show = visible.some((v) => v.slug === it.slug);
              return (
                <div key={it.slug} data-slug={it.slug} className="nx-grid__cell" hidden={!show}>
                  {cards[it.slug]}
                </div>
              );
            })}
          </div>

          {matches.length === 0 && (
            <div className="nx-empty">
              <p className="nx-empty__text t-display">{newsUi.empty}</p>
              <button type="button" className="nx-more" onClick={reset}>
                {newsUi.reset}
              </button>
            </div>
          )}

          {rest > 0 && (
            <button type="button" className="nx-more" onClick={() => setLimit((l) => l + PAGE)}>
              {newsUi.more}
              <span className="t-mono">+{rest}</span>
            </button>
          )}
        </div>

        <aside className="nx-aside">{aside}</aside>
      </div>
    </div>
  );
}
