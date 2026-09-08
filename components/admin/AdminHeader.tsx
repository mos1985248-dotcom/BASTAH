// components/admin/AdminHeader.tsx
import { Home } from "lucide-react";
import { t } from "@/theme";

export default function AdminHeader({ userName }: { userName: string }) {
  return (
    <div style={{ background: t.colors.primary[800], padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: t.typography.fontSize.lg, color: t.colors.white }}>لوحة إدارة بسطة</h1>
        <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.onDarkMuted }}>{userName}</p>
      </div>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 6, color: t.colors.text.onDarkMuted, fontSize: t.typography.fontSize.xs, textDecoration: "none" }}>
        <Home size={13} strokeWidth={1.8} />
        الرئيسية
      </a>
    </div>
  );
}
