"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ isAdmin, newLeads }: { isAdmin: boolean; newLeads: number }) {
  const path = usePathname();
  const items = [
    { href: "/admin", label: "Огляд", exact: true },
    { href: "/admin/articles", label: "Статті" },
    { href: "/admin/pages", label: "SEO сторінок" },
    { href: "/admin/leads", label: "Заявки", badge: newLeads },
    ...(isAdmin
      ? [
          { href: "/admin/users", label: "Користувачі" },
          { href: "/admin/settings", label: "Аналітика й теги" },
        ]
      : []),
    { href: "/admin/profile", label: "Профіль" },
  ];
  return (
    <nav className="adm-nav" aria-label="Розділи адмінки">
      {items.map((it) => {
        const active = it.exact ? path === it.href : path.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href} className="adm-nav__link" aria-current={active ? "page" : undefined}>
            {it.label}
            {!!it.badge && <span className="adm-nav__badge">{it.badge}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
