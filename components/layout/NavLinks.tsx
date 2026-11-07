// components/layout/NavLinks.tsx
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import s from "./nav.module.css";

// ملاحظة: رابط «منيرة (AI)» أُزيل من التنقل العام لأنه خاص بالتاجر وموجود في لوحة التاجر.
export const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/marketplace?view=stores#stores", label: "ممشى البسطات" },
  { href: "/marketplace#categories", label: "الأقسام" },
  { href: "/offers", label: "العروض" },
  { href: "/blog", label: "المدونة" },
  { href: "/story", label: "قصتنا" },
];

export function isNavActive(pathname: string, href: string, hash = "") {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/marketplace")) {
    if (!pathname.startsWith("/marketplace")) return false;
    return href.includes("#categories") ? hash === "#categories" : hash !== "#categories";
  }
  return pathname.startsWith(href.split("?")[0].split("#")[0]);
}

export function useNavHash() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [pathname]);
  return hash;
}

export default function NavLinks() {
  const pathname = usePathname();
  const hash = useNavHash();
  return (
    <nav className={s.links} aria-label="التنقل الرئيسي">
      {NAV_LINKS.map((l) => {
        const active = isNavActive(pathname, l.href, hash);
        return (
          <a key={l.label} href={l.href} className={`${s.link} ${active ? s.active : ""}`} aria-current={active ? "page" : undefined}>
            {l.label}
          </a>
        );
      })}
    </nav>
  );
}
