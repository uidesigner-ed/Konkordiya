"use client";

import { useRef } from "react";
import { useFx } from "@/lib/fx";
import { MQ } from "@/lib/motion";
import type { Rich } from "@/content/uk";
import { RichText } from "./RichText";

/**
 * Заголовок секції: слова виїжджають з-під маски рядка.
 * На мобільному над заголовком — номер аркуша (на десктопі його показує поле).
 */
export function SectionHead({
  n,
  title,
  id,
  className = "",
  tone = "ink",
}: {
  n: number;
  title: Rich;
  id: string;
  className?: string;
  tone?: "ink" | "paper";
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useFx(ref, ({ gsap, SplitText }) => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const split = SplitText.create(el, {
        type: "lines,words",
        aria: "none",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.words, {
            yPercent: 120,
            duration: 1.3,
            stagger: 0.06,
            ease: "paper",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        },
      });
      return () => split.revert();
    });
  });

  return (
    <div className={className}>
      <p
        aria-hidden
        className={`t-mono mb-5 text-[12px] lg:hidden ${tone === "paper" ? "text-paper/60" : "text-ink-2"}`}
      >
        {String(n).padStart(2, "0")} / 12
      </p>
      <h2 ref={ref} id={id} className="t-display t-h2">
        <RichText parts={title} />
      </h2>
    </div>
  );
}
