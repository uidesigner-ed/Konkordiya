import type { Rich } from "@/content/uk";

/** Гротеск + курсивна антиква в одному рядку */
export function RichText({ parts }: { parts: Rich }) {
  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{p}</span>
        ) : (
          <span key={i} className="ital">
            {p.i}
          </span>
        ),
      )}
    </>
  );
}

export function richToText(parts: Rich) {
  return parts.map((p) => (typeof p === "string" ? p : p.i)).join("");
}
