// قائمة الجوال والتابلت: الروابط الحالية مع تمييز قسم السوق النشط.
"use client";
import { usePathname } from "next/navigation";
import { BookOpen, ChevronLeft, Grid2X2, Heart, Home, Newspaper, ShoppingCart, Store, Tags } from "lucide-react";
import { NAV_LINKS, isNavActive, useNavHash } from "./NavLinks";
import s from "./nav.module.css";

const ICONS = {
  "/": Home,
  "/marketplace?view=stores#stores": Store,
  "/marketplace#categories": Grid2X2,
  "/offers": Tags,
  "/blog": Newspaper,
  "/story": BookOpen,
};

export function isMobileNavActive(pathname: string, href: string, hash: string) {
  return isNavActive(pathname, href, hash);
}

export default function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const hash = useNavHash();
  return (
    <div className={s.drawer} id="mobile-nav">
      <nav className={s.drawerInner} aria-label="قائمة التنقل">
        {NAV_LINKS.map((l) => {
          const active = isMobileNavActive(pathname, l.href, hash);
          const Icon = ICONS[l.href as keyof typeof ICONS] ?? Store;
          return (
            <a
              key={l.label}
              href={l.href}
              onClick={onNavigate}
              className={`${s.drawerLink} ${active ? s.drawerActive : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
              <span className={s.drawerLabel}>{l.label}</span>
              <ChevronLeft size={16} strokeWidth={1.7} className={s.drawerArrow} aria-hidden="true" />
            </a>
          );
        })}
        <span className={s.drawerSep} aria-hidden="true" />
        <div className={s.drawerShortcuts}>
          <a href="/favorites" onClick={onNavigate} className={`${s.drawerLink} ${isNavActive(pathname, "/favorites") ? s.drawerActive : ""}`} aria-current={isNavActive(pathname, "/favorites") ? "page" : undefined}>
            <Heart size={18} strokeWidth={1.7} aria-hidden="true" />المفضلة
          </a>
          <a href="/cart" onClick={onNavigate} className={`${s.drawerLink} ${isNavActive(pathname, "/cart") ? s.drawerActive : ""}`} aria-current={isNavActive(pathname, "/cart") ? "page" : undefined}>
            <ShoppingCart size={18} strokeWidth={1.7} aria-hidden="true" />سلة التسوق
          </a>
        </div>
      </nav>
    </div>
  );
}
