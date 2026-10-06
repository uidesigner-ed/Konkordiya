"use client";

import { useEffect, useState } from "react";
import { newsUi } from "@/content/news";

type Item = { id: string; text: string };

/** Активний розділ — той, чий заголовок останнім перетнув верхню третину екрана */
function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.33;
      let current = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);
  return active;
}

function TocList({ items, active }: { items: Item[]; active: string }) {
  return (
    <ol className="toc__list">
      {items.map((it, i) => (
        <li key={it.id}>
          <a href={`#${it.id}`} className="toc__link" aria-current={active === it.id ? "location" : undefined}>
            <span className="toc__n t-mono">{String(i + 1).padStart(2, "0")}</span>
            <span className="toc__text">{it.text}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Зміст статті: на широкому екрані — липка колонка, на вужчих — розгортний блок */
export function ArticleToc({ items, variant }: { items: Item[]; variant: "rail" | "inline" }) {
  const [ids] = useState(() => items.map((i) => i.id));
  const active = useActiveHeading(ids);
  if (!items.length) return null;

  if (variant === "inline") {
    return (
      <details className="toc toc--inline">
        <summary>
          <span>{newsUi.toc}</span>
          <span className="toc__count t-mono">{String(items.length).padStart(2, "0")}</span>
        </summary>
        <nav aria-label={newsUi.toc}>
          <TocList items={items} active={active} />
        </nav>
      </details>
    );
  }
  return (
    <nav aria-label={newsUi.toc} className="toc toc--rail">
      <p className="toc__title">{newsUi.toc}</p>
      <TocList items={items} active={active} />
    </nav>
  );
}
