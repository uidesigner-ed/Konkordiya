"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { markIntroDone } from "@/lib/motion";
import { getLenis } from "@/lib/lenis";
import { loadFx } from "@/lib/fx";

/**
 * Внутрішні сторінки: прелоадера немає — одразу «завершуємо інтро» (шапка з’являється).
 * При клієнтському переході між сторінками розділу — на початок сторінки й перерахунок тригерів.
 */
export function InnerPage() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    markIntroDone();
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!window.location.hash) getLenis()?.scrollTo(0, { immediate: true, force: true });
    const t = setTimeout(() => loadFx().then(({ ScrollTrigger }) => ScrollTrigger.refresh()), 80);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
