// components/admin/layout/AdminSidebar.tsx
"use client";

import { useRouter } from "next/navigation";
import { User, LogOut, Home, ShieldCheck } from "lucide-react";
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
      dir="rtl"
      style={{
        width: 248,
        flexShrink: 0,
        background: t.colors.primary[950],
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: `${t.spacing["4"]} ${t.spacing["3"]}`,
        position: "relative",
        borderInlineStart: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: `4px ${t.spacing["2"]} ${t.spacing["4"]}`,
          marginBottom: t.spacing["2"],
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radius.md,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: t.colors.gold[400],
            }}
          >
            <ShieldCheck size={20} strokeWidth={1.8} />
          </div>

          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: t.typography.fontSize.base,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.gold[400],
                lineHeight: 1.3,
              }}
            >
              بسطة
            </p>

            <p
              style={{
                margin: "3px 0 0",
                fontSize: t.typography.fontSize.xs,
                color: t.colors.text.onDarkMuted,
                lineHeight: 1.4,
              }}
            >
              لوحة إدارة المنصة
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        aria-label="أقسام لوحة الإدارة"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          flex: 1,
        }}
      >
        {ADMIN_SECTIONS.map((s) => {
          const isActive = active === s.id;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange(s.id)}
              aria-current={isActive ? "page" : undefined}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 11,
                width: "100%",
                minHeight: 44,
                padding: "9px 12px",
                background: isActive
                  ? "rgba(255,255,255,0.09)"
                  : "transparent",
                border: "1px solid transparent",
                borderInlineStart: `3px solid ${
                  isActive ? t.colors.gold[600] : "transparent"
                }`,
                borderRadius: t.radius.md,
                color: isActive
                  ? t.colors.white
                  : t.colors.text.onDarkMuted,
                fontWeight: isActive
                  ? t.typography.fontWeight.bold
                  : t.typography.fontWeight.regular,
                fontSize: t.typography.fontSize.sm,
                cursor: "pointer",
                textAlign: "start",
                transition:
                  "background 160ms ease, color 160ms ease, transform 160ms ease",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: t.radius.sm,
                  background: isActive
                    ? "rgba(255,255,255,0.07)"
                    : "transparent",
                  color: isActive
                    ? t.colors.gold[400]
                    : t.colors.text.onDarkMuted,
                }}
              >
                <s.Icon size={17} strokeWidth={isActive ? 2 : 1.8} />
              </span>

              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {s.label}
              </span>

              {s.id === "support" && ticketBadge > 0 && (
                <span
                  aria-label={`${ticketBadge} تذاكر دعم`}
                  style={{
                    minWidth: 21,
                    height: 21,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: t.colors.semantic.danger,
                    color: t.colors.white,
                    fontSize: 10,
                    lineHeight: 1,
                    fontWeight: t.typography.fontWeight.bold,
                    borderRadius: t.radius.full,
                    padding: "0 6px",
                    boxShadow: "0 2px 7px rgba(0,0,0,0.16)",
                  }}
                >
                  {ticketBadge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.09)",
          paddingTop: t.spacing["3"],
          marginTop: t.spacing["4"],
        }}
      >
        {/* Current user */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            minWidth: 0,
            padding: `8px ${t.spacing["2"]}`,
            marginBottom: 4,
            borderRadius: t.radius.md,
            background: "rgba(255,255,255,0.035)",
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: t.radius.full,
              background: "rgba(255,255,255,0.08)",
              color: t.colors.text.onDarkMuted,
            }}
          >
            <User size={14} strokeWidth={1.8} />
          </span>

          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 9,
                color: t.colors.text.onDarkMuted,
                lineHeight: 1.3,
              }}
            >
              المستخدم الحالي
            </p>

            <p
              style={{
                margin: "2px 0 0",
                fontSize: t.typography.fontSize.xs,
                color: t.colors.white,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: 1.4,
              }}
              title={userName}
            >
              {userName}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            minHeight: 38,
            textAlign: "start",
            padding: "8px 12px",
            marginBottom: 2,
            background: "transparent",
            border: "1px solid transparent",
            color: t.colors.text.onDarkMuted,
            fontSize: t.typography.fontSize.xs,
            cursor: "pointer",
            borderRadius: t.radius.md,
            transition: "background 160ms ease, color 160ms ease",
          }}
        >
          <LogOut size={14} strokeWidth={1.8} />
          تسجيل الخروج
        </button>

        {/* Home */}
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minHeight: 38,
            padding: "8px 12px",
            color: t.colors.text.onDarkMuted,
            fontSize: t.typography.fontSize.xs,
            textDecoration: "none",
            borderRadius: t.radius.md,
            transition: "background 160ms ease, color 160ms ease",
          }}
        >
          <Home size={14} strokeWidth={1.8} />
          الرئيسية
        </a>
      </div>

      <style>{`
        .basita-admin-sidebar button:hover {
          background: rgba(255,255,255,0.055) !important;
          color: ${t.colors.white} !important;
        }

        .basita-admin-sidebar button:active {
          transform: scale(0.985);
        }

        .basita-admin-sidebar button:focus-visible,
        .basita-admin-sidebar a:focus-visible {
          outline: 2px solid ${t.colors.gold[400]};
          outline-offset: -2px;
        }

        .basita-admin-sidebar a:hover {
          background: rgba(255,255,255,0.055);
          color: ${t.colors.white} !important;
        }

        @media (max-width: 900px) {
          .basita-admin-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
}