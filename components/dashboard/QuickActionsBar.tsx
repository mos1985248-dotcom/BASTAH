// components/dashboard/QuickActionsBar.tsx
import { t } from "@/theme";
import { Plus, Receipt, Wallet, Sparkles, Headset, type LucideIcon } from "lucide-react";

const ACTIONS: { href: string; Icon: LucideIcon; label: string }[] = [
  { href: "/dashboard/products/new", Icon: Plus, label: "إضافة منتج" },
  { href: "/dashboard/orders", Icon: Receipt, label: "الطلبات" },
  { href: "/dashboard/daftari", Icon: Wallet, label: "دفاتري" },
  { href: "/dashboard/munira", Icon: Sparkles, label: "منيرة" },
  { href: "/dashboard/support", Icon: Headset, label: "الدعم" },
];

export default function QuickActionsBar() {
  return (
    <div
      style={{
        background: t.colors.white,
        borderRadius: t.radius.lg,
        border: `1px solid ${t.colors.cream.border}`,
        padding: t.spacing["3"],
        display: "flex",
        gap: t.spacing["2"],
        overflowX: "auto",
        direction: "rtl",
        boxShadow: t.shadows.sm,
      }}
    >
      {ACTIONS.map((a) => (
        <a
          key={a.href}
          href={a.href}
          className="basita-btn-interactive"
          style={{
            display: "flex",
            alignItems: "center",
            gap: t.spacing["2"],
            padding: "10px 16px",
            background: t.colors.cream.bg,
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.md,
            textDecoration: "none",
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.semibold,
            color: t.colors.text.dark,
            whiteSpace: "nowrap",
            boxShadow: "none",
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: t.radius.sm, background: t.colors.primary[100], display: "flex", alignItems: "center", justifyContent: "center" }}>
            <a.Icon size={16} strokeWidth={1.8} color={t.colors.primary[800]} />
          </div>
          {a.label}
        </a>
      ))}
    </div>
  );
}