// components/admin/layout/AdminSidebar.tsx
"use client";

import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { t } from "@/theme";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ADMIN_SECTIONS, AdminSection } from "./sections";

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
    <aside
      className="basita-admin-sidebar"
      style={{
        width: 240,
        flexShrink: 0,
        background: t.colors.primary[950],
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: `${t.spacing["5"]} ${t.spacing["3"]}`,
      }}
    >
      <div style={{ padding: `0 ${t.spacing["2"]} ${t.spacing["5"]}` }}>
        <p style={{ margin: 0, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.gold[400] }}>بسطة</p>
        <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.onDarkMuted }}>لوحة إدارة المنصة</p>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {ADMIN_SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 14px",
                background: isActive ? "rgba(255,255,255,0.1)" : "none",
                border: "none",
                borderInlineStart: `3px solid ${isActive ? t.colors.gold[600] : "transparent"}`,
                borderRadius: t.radius.sm,
                color: isActive ? t.colors.white : t.colors.text.onDarkMuted,
                fontWeight: isActive ? t.typography.fontWeight.bold : t.typography.fontWeight.regular,
                fontSize: t.typography.fontSize.sm,
                cursor: "pointer",
                textAlign: "start",
              }}
            >
              <s.Icon size={17} strokeWidth={1.8} />
              {s.label}
              {s.id === "support" && ticketBadge > 0 && (
                <span style={{ marginInlineStart: "auto", background: t.colors.semantic.danger, color: t.colors.white, fontSize: 10, fontWeight: t.typography.fontWeight.bold, borderRadius: t.radius.full, padding: "1px 7px" }}>
                  {ticketBadge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: t.spacing["3"], marginTop: t.spacing["3"] }}>
        <p style={{ margin: `0 0 ${t.spacing["2"]}`, padding: `0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.xs, color: t.colors.text.onDarkMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
          <User size={13} strokeWidth={1.8} />
          {userName}
        </p>
        <button
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", textAlign: "start", padding: "9px 14px", background: "none", border: "none", color: t.colors.text.onDarkMuted, fontSize: t.typography.fontSize.xs, cursor: "pointer", borderRadius: t.radius.sm }}
        >
          <LogOut size={14} strokeWidth={1.8} />
          تسجيل الخروج
        </button>
        <a
          href="/"
          style={{ display: "block", padding: "9px 14px", color: t.colors.text.onDarkMuted, fontSize: t.typography.fontSize.xs, textDecoration: "none", borderRadius: t.radius.sm }}
        >
          الرئيسية
        </a>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .basita-admin-sidebar { display: none !important; }
        }
      `}</style>
    </aside>
  );
}
