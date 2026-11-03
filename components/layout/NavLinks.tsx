// components/layout/NavLinks.tsx
"use client";
import { usePathname } from "next/navigation";
import s from "./nav.module.css";

// ملاحظة: رابط «منيرة (AI)» أُزيل من التنقل العام لأنه خاص بالتاجر وموجود في لوحة التاجر.
export const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/marketplace?view=stores", label: "ممشى البسطات" },
  { href: "/marketplace#categories", label: "الأقسام" },
  { href: "/offers", label: "العروض" },
  { href: "/blog", label: "المدونة" },
  { href: "/story", label: "قصتنا" },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href.split("?")[0].split("#")[0]);
}

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className={s.links} aria-label="التنقل الرئيسي">
      {NAV_LINKS.map((l) => {
        const active = isNavActive(pathname, l.href);
        return (
          <a key={l.label} href={l.href} className={`${s.link} ${active ? s.active : ""}`} aria-current={active ? "page" : undefined}>
            {l.label}
          </a>
        );
      })}
    </nav>
  );
}
