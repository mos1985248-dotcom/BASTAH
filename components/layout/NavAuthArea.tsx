// components/layout/NavAuthArea.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogIn, Store, UserRound, LogOut } from "lucide-react";
import { t } from "@/theme";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

interface CurrentUser {
  name: string;
  role: "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN";
  store: { slug: string } | null;
}

export default function NavAuthArea({
  user,
  loading,
}: {
  user: CurrentUser | null;
  loading: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  if (loading) {
    return (
      <div
        className="basita-auth-loading"
        style={{
          width: 150,
          height: 44,
          borderRadius: 999,
          background: "#F7F1E5",
        }}
      />
    );
  }

  if (!user) {
    return (
      <div
        className="basita-nav-auth"
        style={{
          display: "flex",
          alignItems: "center",
          gap: t.spacing["2"],
        }}
      >
        {/* تسجيل الدخول */}
        <a
          href="/login"
          className="basita-nav-login"
          style={{
            minHeight: 42,
            padding: `0 ${t.spacing["4"]}`,
            borderRadius: 999,
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.semibold,
            color: t.colors.primary[800],
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            whiteSpace: "nowrap",
            boxSizing: "border-box",
          }}
        >
          <LogIn size={16} strokeWidth={1.9} />
          تسجيل الدخول
        </a>

        {/* ابدأ مجانًا — يظهر على الكمبيوتر فقط */}
        <a
          href="/register"
          className="basita-nav-register basita-btn-interactive"
          style={{
            minHeight: 42,
            padding: `0 ${t.spacing["5"]}`,
            borderRadius: 999,
            background: t.colors.primary[800],
            color: t.colors.text.onDark,
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            whiteSpace: "nowrap",
            boxSizing: "border-box",
          }}
        >
          ابدأ مجانًا
        </a>
      </div>
    );
  }

  const dashboardHref =
    user.role === "SELLER" && user.store ? "/dashboard" : "/account";

  const firstName = user.name?.split(" ")[0] || "حسابي";

  return (
    <div
      ref={ref}
      className="basita-nav-auth"
      style={{
        position: "relative",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          minHeight: 42,
          padding: `0 ${t.spacing["4"]}`,
          borderRadius: 999,
          border: "1px solid rgba(91,70,45,0.13)",
          background: "#FFFDF8",
          color: t.colors.text.dark,
          fontSize: t.typography.fontSize.sm,
          fontWeight: t.typography.fontWeight.semibold,
          cursor: "pointer",
          boxShadow: "0 3px 10px rgba(67,48,29,0.04)",
        }}
      >
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: t.colors.gold[100],
            color: t.colors.gold[700],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <UserRound size={16} strokeWidth={1.8} />
        </span>

        <span
          style={{
            maxWidth: 120,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {firstName}
        </span>

        <ChevronDown
          size={15}
          strokeWidth={1.9}
          style={{
            transition: "transform 160ms ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            insetInlineEnd: 0,
            minWidth: 220,
            padding: 6,
            background: "#FFFDF8",
            border: "1px solid rgba(91,70,45,0.12)",
            borderRadius: 16,
            boxShadow: "0 14px 30px rgba(67,48,29,0.12)",
            overflow: "hidden",
            zIndex: 100,
          }}
        >
          <a
            href={dashboardHref}
            onClick={() => setOpen(false)}
            className="basita-account-menu-item"
            style={menuItemStyle}
          >
            {user.role === "SELLER" ? (
              <Store size={16} strokeWidth={1.8} />
            ) : (
              <UserRound size={16} strokeWidth={1.8} />
            )}

            <span>
              {user.role === "SELLER" ? "لوحة متجري" : "حسابي"}
            </span>
          </a>

          <button
            type="button"
            onClick={async () => {
              await getSupabaseBrowserClient().auth.signOut();
              setOpen(false);
              router.push("/");
              router.refresh();
            }}
            className="basita-account-menu-item basita-account-logout"
            style={{
              ...menuItemStyle,
              width: "100%",
              border: "none",
              cursor: "pointer",
              background: "transparent",
              textAlign: "start",
            }}
          >
            <LogOut size={16} strokeWidth={1.8} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      )}

      <style jsx>{`
        .basita-nav-login,
        .basita-nav-register,
        .basita-account-menu-item {
          transition:
            background 160ms ease,
            color 160ms ease,
            border-color 160ms ease,
            transform 160ms ease,
            box-shadow 160ms ease;
        }

        .basita-nav-login:hover {
          background: #f7f1e5;
        }

        .basita-nav-register:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(33, 53, 42, 0.15);
        }

        .basita-account-menu-item:hover {
          background: #f7f1e5 !important;
          color: ${t.colors.primary[800]} !important;
        }

        .basita-account-logout:hover {
          color: ${t.colors.semantic.danger} !important;
        }

        /* =========================================
           Mobile
           ========================================= */
        @media (max-width: 767px) {
          .basita-nav-auth {
            display: flex !important;
            align-items: center !important;
            gap: 3px !important;
          }

          /* تسجيل الدخول */
          .basita-nav-login {
            min-height: 36px !important;
            height: 36px !important;
            padding: 0 7px !important;
            border-radius: 10px !important;
            font-size: 11px !important;
            gap: 4px !important;
          }

          .basita-nav-login svg {
            width: 14px !important;
            height: 14px !important;
          }

          /*
           * ابدأ مجانًا ينتقل إلى الهيرو
           * ولا يظهر في النافبار على الجوال.
           */
          .basita-nav-register {
            display: none !important;
          }

          /*
           * حساب المستخدم بعد تسجيل الدخول
           */
          .basita-nav-auth > button {
            min-height: 36px !important;
            height: 36px !important;
            padding: 0 7px !important;
            border-radius: 10px !important;
            gap: 4px !important;
          }

          .basita-nav-auth > button > span:first-child {
            width: 26px !important;
            height: 26px !important;
          }

          .basita-nav-auth > button > span:first-child svg {
            width: 14px !important;
            height: 14px !important;
          }

          .basita-nav-auth > button > span:nth-child(2) {
            max-width: 65px !important;
            font-size: 11px !important;
          }

          .basita-nav-auth > button > svg {
            width: 13px !important;
            height: 13px !important;
          }

          .basita-auth-loading {
            width: 80px !important;
            height: 36px !important;
          }
        }

        /* =========================================
           Small phones
           ========================================= */
        @media (max-width: 420px) {
          .basita-nav-auth {
            gap: 2px !important;
          }

          .basita-nav-login {
            min-height: 34px !important;
            height: 34px !important;
            padding: 0 5px !important;
            font-size: 10px !important;
          }

          .basita-nav-login svg {
            width: 13px !important;
            height: 13px !important;
          }
        }
      `}</style>
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  minHeight: 42,
  padding: "0 12px",
  borderRadius: 11,
  fontSize: t.typography.fontSize.sm,
  color: t.colors.text.dark,
  textDecoration: "none",
  boxSizing: "border-box",
};