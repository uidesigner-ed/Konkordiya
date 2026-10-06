import Link from "next/link";
import type { Article } from "@/content/news";
import { newsUi } from "@/content/news";
import { articleHref, articleNumber, categoryLabel, formatDate, formatDateNum, readingTime } from "@/lib/news";
import { IconArrow } from "@/components/ui/Icons";
import { NewsCover } from "./NewsCover";

type Variant = "default" | "featured" | "compact";

/**
 * Картка статті. Посилання — лише на заголовку, але «розтягнуте» на всю картку
 * (::after), тож клік працює по всій площі, а скрінрідер чує одне посилання.
 */
export function NewsCard({
  a,
  variant = "default",
  level = 2,
  uid,
}: {
  a: Article;
  variant?: Variant;
  level?: 2 | 3;
  uid?: string;
}) {
  const H = level === 2 ? "h2" : "h3";
  const n = articleNumber(a.slug);
  return (
    <article className={`ncard ncard--${variant}`} data-cursor={newsUi.read}>
      <div className="ncard__media">
        <NewsCover cover={a.cover} n={n} uid={uid ?? a.slug} />
        {variant === "featured" && <span className="ncard__badge">{newsUi.featured}</span>}
      </div>
      <div className="ncard__body">
        <p className="ncard__meta">
          <span className="ncard__cat">{categoryLabel(a.category)}</span>
          <time dateTime={a.date} className="t-mono" title={formatDate(a.date)}>
            {formatDateNum(a.date)}
          </time>
        </p>
        <H className="ncard__title t-display">
          <Link href={articleHref(a.slug)} className="ncard__link">
            {a.title}
          </Link>
        </H>
        {variant !== "compact" && <p className="ncard__excerpt">{a.excerpt}</p>}
        <p className="ncard__foot">
          <span>
            <span className="t-mono">{readingTime(a)}</span> {newsUi.minutes}
          </span>
          <span className="ncard__arrow" aria-hidden>
            <IconArrow size={18} />
          </span>
        </p>
      </div>
    </article>
  );
}
