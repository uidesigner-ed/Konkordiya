import type { Metadata } from "next";
import "@/styles/inner.css";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Адмінка — Конкордія", template: "%s — адмінка «Конкордії»" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
