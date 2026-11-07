// components/admin/layout/AdminSidebar.tsx
// الشريط الجانبي (سطح المكتب والتابلت). على الجوال يحلّ محلّه AdminMobileNav.
"use client";

import { useRouter } from "next/navigation";
import { User, LogOut, Home, ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ADMIN_SECTIONS, AdminSection } from "./sections";
import s from "../admin.module.css";

export default function AdminSidebar({
  active,
  onChange,
  ticketBadge,
  userName,
}: {
  active: AdminSection;
  onChange: (s: AdminSection) => void;
  ticketBadge: number;
  userName: string;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await getSupabaseBrowserClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className={s.side} dir="rtl">
      <div className={s.brand}>
        <div className={s.brandIcon}>
          <ShieldCheck size={22} strokeWidth={1.8} />
        </div>
        <div>
          <p className={s.brandName}>بسطة مارت</p>
          <p className={s.brandSub}>لوحة إدارة المنصة</p>
        </div>
      </div>

      <nav className={s.nav} aria-label="أقسام لوحة الإدارة">
        {ADMIN_SECTIONS.map((sec) => {
          const isActive = active === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onChange(sec.id)}
              aria-current={isActive ? "page" : undefined}
              className={`${s.navBtn} ${isActive ? s.navOn : ""}`}
            >
              <span className={s.navIcon} aria-hidden="true">
                <sec.Icon size={18} strokeWidth={isActive ? 2 : 1.8} />
              </span>
              <span className={s.navLabel}>{sec.label}</span>
              {sec.id === "support" && ticketBadge > 0 && (
                <span className={s.count} aria-label={`${ticketBadge} تذاكر دعم`}>
                  {ticketBadge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className={s.bottom}>
        <div className={s.user}>
          <span className={s.userIcon}>
            <User size={16} strokeWidth={1.8} />
          </span>
          <div>
            <p className={s.userLabel}>المستخدم الحالي</p>
            <p className={s.userName} title={userName}>{userName}</p>
          </div>
        </div>

        <button type="button" onClick={handleLogout} className={s.sideBtn}>
          <LogOut size={16} strokeWidth={1.8} />
          تسجيل الخروج
        </button>

        <a href="/" className={s.sideBtn}>
          <Home size={16} strokeWidth={1.8} />
          الرئيسية
        </a>
      </div>
    </aside>
  );
}
