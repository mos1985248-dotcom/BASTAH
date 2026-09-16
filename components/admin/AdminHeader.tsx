// components/admin/AdminHeader.tsx
import Link from "next/link";
import { Home, ShieldCheck } from "lucide-react";
import { t } from "@/theme";

interface AdminHeaderProps {
  userName: string;
}

export default function AdminHeader({ userName }: AdminHeaderProps) {
  return (
    <header
      dir="rtl"
      style={{
        background: t.colors.primary[800],
        minHeight: 72,
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        borderBottom: `1px solid ${t.colors.primary[700]}`,
      }}
    >
      {/* الهوية والعنوان */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ShieldCheck
            size={21}
            strokeWidth={1.8}
            color={t.colors.white}
          />
        </div>

        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: t.typography.fontSize.lg,
              fontWeight: 700,
              color: t.colors.white,
              lineHeight: 1.4,
            }}
          >
            لوحة إدارة بسطة
          </h1>

          <p
            style={{
              margin: "2px 0 0",
              fontSize: t.typography.fontSize.xs,
              color: t.colors.text.onDarkMuted,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 260,
            }}
          >
            مرحبًا، {userName}
          </p>
        </div>
      </div>

      {/* الانتقال إلى الموقع */}
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "8px 12px",
          borderRadius: 8,
          color: t.colors.text.onDarkMuted,
          fontSize: t.typography.fontSize.xs,
          textDecoration: "none",
          background: "rgba(255,255,255,0.07)",
          transition: "background 150ms ease, color 150ms ease",
          flexShrink: 0,
        }}
      >
        <Home size={15} strokeWidth={1.8} />
        <span>المتجر الرئيسي</span>
      </Link>
    </header>
  );
}

