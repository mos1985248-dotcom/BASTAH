// components/dashboard/DashboardSidebar.tsx
"use client";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import DashboardMobileNav from "./DashboardMobileNav";
import { BOTTOM_LINKS, GROUPS, TOP_LINK, activeHref, type NavItem } from "./DashboardNav";
import s from "./dash.module.css";

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <a href={item.href} className={`${s.link} ${active ? s.active : ""}`} aria-current={active ? "page" : undefined}>
      <item.Icon size={18} strokeWidth={1.7} aria-hidden="true" />
      {item.label}
    </a>
  );
}

export default function DashboardSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const current = activeHref(pathname);

  return (
    <>
      <aside className={s.sidebar} style={uiVars} aria-label="قائمة لوحة التاجر">
        <a href="/" className={s.brand}>
          <span className={s.logoMark}>
            <Image src="/images/logo-icon.png" alt="" width={34} height={34} style={{ width: 34, height: 34, objectFit: "contain" }} />
          </span>
          <span>
            <p className={s.brandName}>بسطة مارت</p>
            <p className={s.brandSub}>لوحة إدارة المتجر</p>
          </span>
        </a>

        <nav className={s.nav}>
          <NavLink item={TOP_LINK} active={current === TOP_LINK.href} />
          {GROUPS.map((group) => (
            <div key={group.label} className={s.group}>
              <p className={s.groupLabel}>{group.label}</p>
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} active={current === item.href} />
              ))}
            </div>
          ))}
        </nav>

        <div className={s.foot}>
          {isAdmin && (
            <a href="/admin" className={`${s.adminLink} basita-btn-interactive`}>
              <ShieldCheck size={17} strokeWidth={1.8} aria-hidden="true" />
              لوحة الإدارة
            </a>
          )}
          {BOTTOM_LINKS.map((item) => (
            <NavLink key={item.href} item={item} active={current === item.href} />
          ))}
        </div>
      </aside>

      <DashboardMobileNav isAdmin={isAdmin} current={current} />
    </>
  );
}
