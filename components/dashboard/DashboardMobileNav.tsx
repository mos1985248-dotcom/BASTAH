// components/dashboard/DashboardMobileNav.tsx
// الجوال: شريط سفلي بأهم أربع وجهات + «المزيد» يفتح كل الأقسام مجمّعة (بدل شريط أفقي من 17 رابطاً).
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutGrid, Home, Receipt, Package, Wallet, ShieldCheck } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import { BOTTOM_LINKS, GROUPS } from "./DashboardNav";
import s from "./dash.module.css";

const TABS = [
  { href: "/dashboard", label: "الرئيسية", Icon: Home },
  { href: "/dashboard/orders", label: "الطلبات", Icon: Receipt },
  { href: "/dashboard/products", label: "المنتجات", Icon: Package },
  { href: "/dashboard/daftari", label: "دفاتري", Icon: Wallet },
];

export default function DashboardMobileNav({ isAdmin, current }: { isAdmin: boolean; current: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const tabCurrent = TABS.some((t) => t.href === current);

  return (
    <div style={uiVars}>
      {open && (
        <>
          <div className={s.scrim} onClick={() => setOpen(false)} aria-hidden="true" />
          <div className={s.sheet} role="dialog" aria-modal="true" aria-label="كل أقسام اللوحة">
            <p className={s.sheetTitle}>كل الأقسام</p>
            {[...GROUPS, { label: "حسابك", items: BOTTOM_LINKS }].map((group) => (
              <div key={group.label} className={s.sheetGroup}>
                <p className={s.sheetLabel}>{group.label}</p>
                <div className={s.sheetGrid}>
                  {group.items.map(({ href, label, Icon }) => (
                    <a key={href} href={href} className={`${s.sheetLink} ${current === href ? s.sheetOn : ""}`}>
                      <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            {isAdmin && (
              <div className={s.sheetGroup}>
                <a href="/admin" className={s.sheetLink}>
                  <ShieldCheck size={18} strokeWidth={1.7} aria-hidden="true" />
                  لوحة الإدارة
                </a>
              </div>
            )}
          </div>
        </>
      )}

      <nav className={s.tabs} aria-label="تنقل سريع">
        {TABS.map(({ href, label, Icon }) => (
          <a key={href} href={href} className={`${s.tab} ${current === href ? s.tabOn : ""}`} aria-current={current === href ? "page" : undefined}>
            <Icon size={21} strokeWidth={1.7} aria-hidden="true" />
            {label}
          </a>
        ))}
        <button type="button" className={`${s.tab} ${open || (!tabCurrent && current) ? s.tabOn : ""}`} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <LayoutGrid size={21} strokeWidth={1.7} aria-hidden="true" />
          المزيد
        </button>
      </nav>
    </div>
  );
}
