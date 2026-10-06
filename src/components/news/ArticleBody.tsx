import { Fragment } from "react";
import type { Block } from "@/content/news";

/** **жирний** → <strong> */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

/** Тіло статті з блоків контенту */
export function ArticleBody({ blocks, slug }: { blocks: Block[]; slug: string }) {
  // Порядковий номер підзаголовка (01, 02…) для кожного блоку
  const hNum = blocks.map((_, i) => blocks.slice(0, i + 1).filter((b) => b.t === "h2").length);
  return (
    <div className="art-body">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "p":
            return (
              <p key={i}>
                <Inline text={b.text} />
              </p>
            );
          case "h2":
            return (
              <h2 key={i} id={b.id} className="art-h2">
                <span className="art-h2__rule" aria-hidden />
                <span className="art-h2__n t-mono" aria-hidden>
                  {String(hNum[i]).padStart(2, "0")}
                </span>
                <span>{b.text}</span>
              </h2>
            );
          case "ul":
            return (
              <ul key={i} className="art-ul">
                {b.items.map((it, k) => (
                  <li key={k}>
                    <Inline text={it} />
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="art-ol">
                {b.items.map((it, k) => (
                  <li key={k}>
                    <span className="art-ol__n t-mono" aria-hidden>
                      {String(k + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <Inline text={it} />
                    </span>
                  </li>
                ))}
              </ol>
            );
          case "check":
            // Чек-лист, який можна відмічати: нативні чекбокси, стан — лише в браузері читача
            return (
              <fieldset key={i} className="art-check" data-reveal>
                <legend className="art-check__title">{b.title}</legend>
                <ul>
                  {b.items.map((it, k) => {
                    const id = `${slug}-c${i}-${k}`;
                    return (
                      <li key={k}>
                        <input type="checkbox" id={id} className="art-check__input" />
                        <label htmlFor={id}>
                          <span className="art-check__box" aria-hidden>
                            <svg viewBox="0 0 24 24" fill="none">
                              <path d="M5 12.5l4.5 4.5L19.5 6" />
                            </svg>
                          </span>
                          <span>{it}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            );
          case "note":
            return (
              <aside key={i} className="art-note" data-reveal>
                <p className="art-note__label">{b.label}</p>
                <p>
                  <Inline text={b.text} />
                </p>
              </aside>
            );
          case "quote":
            return (
              <figure key={i} className="art-quote" data-reveal>
                <span className="art-quote__mark" aria-hidden>
                  «
                </span>
                <blockquote>
                  <p>{b.text}</p>
                </blockquote>
                {b.cite && <figcaption>— {b.cite}</figcaption>}
              </figure>
            );
        }
      })}
    </div>
  );
}
