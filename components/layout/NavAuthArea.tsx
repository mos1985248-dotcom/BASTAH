// components/layout/NavAuthArea.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/theme";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

interface CurrentUser {
  name: string;
  role: "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN";
  store: { slug: string } | null;
}

export default function NavAuthArea({ user, loading }: { user: CurrentUser | null; loading: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) return <div style={{ width: 100, height: 40 }} />;

  if (!user) {
    return (
      <div style={{ display: "flex", gap: t.spacing["3"] }}>
        <a
          href="/login"
          style={{
            padding: `10px ${t.spacing["5"]}`,
            fontSize: t.typography.fontSize.base,
            fontWeight: t.typography.fontWeight.semibold,
            color: t.colors.primary[800],
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          تسجيل الدخول
        </a>
        <a
          href="/register"
          className="basita-btn-interactive"
          style={{
            padding: `10px ${t.spacing["6"]}`,
            borderRadius: t.radius.full,
            background: t.colors.primary[800],
            color: t.colors.text.onDark,
            fontSize: t.typography.fontSize.base,
            fontWeight: t.typography.fontWeight.semibold,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          ابدأ مجاناً
        </a>
      </div>
    );
  }

  const dashboardHref = user.role === "SELLER" && user.store ? "/dashboard" : "/account";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: t.spacing["2"],
          padding: `8px ${t.spacing["4"]}`,
          borderRadius: t.radius.full,
          border: `1.5px solid ${t.colors.cream.border}`,
          background: t.colors.white,
          fontSize: t.typography.fontSize.base,
          fontWeight: t.typography.fontWeight.semibold,
          color: t.colors.text.dark,
          cursor: "pointer",
        }}
      >
        {user.name.split(" ")[0]} ▾
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            insetInlineEnd: 0,
            background: t.colors.white,
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.md,
            boxShadow: t.shadows.md,
            minWidth: 190,
            overflow: "hidden",
            zIndex: 30,
          }}
        >
          <a href={dashboardHref} style={menuItemStyle}>
            {user.role === "SELLER" ? "لوحة متجري" : "حسابي"}
          </a>
          <button
            onClick={async () => {
              await getSupabaseBrowserClient().auth.signOut();
              router.push("/");
              router.refresh();
            }}
            style={{ ...menuItemStyle, width: "100%", textAlign: "start", background: "none", border: "none", cursor: "pointer" }}
          >
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "block",
  padding: `12px ${t.spacing["4"]}`,
  fontSize: t.typography.fontSize.base,
  color: t.colors.text.dark,
  textDecoration: "none",
};