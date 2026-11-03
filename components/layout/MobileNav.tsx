// components/layout/MobileNav.tsx — قائمة التنقل للتابلت والجوال (نفس الروابط، بلا منطق جديد)
"use client";
import { usePathname } from "next/navigation";
import { NAV_LINKS, isNavActive } from "./NavLinks";
import s from "./nav.module.css";

export default function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  return (
    <div className={s.drawer} id="mobile-nav">
      <nav className={s.drawerInner} aria-label="قائمة التنقل">
        {NAV_LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            onClick={onNavigate}
            className={`${s.drawerLink} ${isNavActive(pathname, l.href) ? s.drawerActive : ""}`}
            aria-current={isNavActive(pathname, l.href) ? "page" : undefined}
          >
            {l.label}
          </a>
        ))}
        <span className={s.drawerSep} aria-hidden="true" />
        <a href="/favorites" onClick={onNavigate} className={s.drawerLink}>المفضلة</a>
        <a href="/cart" onClick={onNavigate} className={s.drawerLink}>سلة التسوق</a>
      </nav>
    </div>
  );
}
