import Link from "next/link";
import { site } from "@/config/site";

export type Crumb = { label: string; href?: string };

/** Хлібні крихти + розмітка BreadcrumbList для пошуковиків */
export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${site.url}${c.href === "/" ? "" : c.href}` } : {}),
    })),
  };
  return (
    <nav aria-label="Хлібні крихти" className={`crumbs ${className}`}>
      <ol>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`}>
              {c.href && !last ? (
                // Головна — окремий макет, тож туди повне завантаження, а не клієнтський перехід
                c.href === "/" ? (
                  // eslint-disable-next-line @next/next/no-html-link-for-pages -- навмисно повне завантаження (інший макет)
                  <a href="/" className="link-line">
                    {c.label}
                  </a>
                ) : (
                  <Link href={c.href} className="link-line">
                    {c.label}
                  </Link>
                )
              ) : (
                <span aria-current={last ? "page" : undefined}>{c.label}</span>
              )}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </nav>
  );
}
