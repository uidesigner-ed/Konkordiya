import Link from "next/link";
import type { Article } from "@/content/news";
import { newsUi } from "@/content/news";
import { articleHref, categoryHref, categoryLabel, formatDateNum, readingTime } from "@/lib/news";
import type { CategoryId } from "@/content/news";

/** «Популярне»: нумерований список, як підсумковий стовпчик у книзі обліку */
export function PopularList({ items, title = newsUi.popular }: { items: Article[]; title?: string }) {
  return (
    <section className="nlist nlist--popular" aria-labelledby="nlist-popular">
      <h2 id="nlist-popular" className="nlist__title">
        {title}
      </h2>
      <ol>
        {items.map((a, i) => (
          <li key={a.slug} className="nlist__item">
            <span className="nlist__n t-mono" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <Link href={articleHref(a.slug)} className="nlist__link">
                {a.title}
              </Link>
              <p className="nlist__meta">
                {categoryLabel(a.category)} · <span className="t-mono">{readingTime(a)}</span> хв
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** «Нові»: дата + заголовок */
export function LatestList({ items }: { items: Article[] }) {
  return (
    <section className="nlist nlist--latest" aria-labelledby="nlist-latest">
      <h2 id="nlist-latest" className="nlist__title">
        {newsUi.latest}
      </h2>
      <ul>
        {items.map((a) => (
          <li key={a.slug} className="nlist__item">
            <div>
              <time dateTime={a.date} className="nlist__date t-mono">
                {formatDateNum(a.date)}
              </time>
              <Link href={articleHref(a.slug)} className="nlist__link">
                {a.title}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Категорії з лічильниками → стрічка з фільтром */
export function CategoryList({ counts, current }: { counts: { id: string; label: string; count: number }[]; current?: string }) {
  return (
    <section className="nlist nlist--cats" aria-labelledby="nlist-cats">
      <h2 id="nlist-cats" className="nlist__title">
        {newsUi.filter}
      </h2>
      <ul className="ncats">
        {counts.map((c) => (
          <li key={c.id}>
            <Link href={categoryHref(c.id as CategoryId)} className="nchip" aria-current={c.id === current ? "true" : undefined}>
              {c.label}
              <sup className="t-mono">{c.count}</sup>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
