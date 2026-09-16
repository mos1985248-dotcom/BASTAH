// components/dashboard/QuickActionsBar.tsx
import { t } from "@/theme";
import {
  Plus,
  Receipt,
  Wallet,
  Sparkles,
  Headset,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";

const ACTIONS: {
  href: string;
  Icon: LucideIcon;
  label: string;
  primary?: boolean;
}[] = [
  {
    href: "/dashboard/products/new",
    Icon: Plus,
    label: "إضافة منتج",
    primary: true,
  },
  {
    href: "/dashboard/orders",
    Icon: Receipt,
    label: "الطلبات",
  },
  {
    href: "/dashboard/daftari",
    Icon: Wallet,
    label: "دفاتري",
  },
  {
    href: "/dashboard/munira",
    Icon: Sparkles,
    label: "منيرة",
  },
  {
    href: "/dashboard/support",
    Icon: Headset,
    label: "الدعم",
  },
];

export default function QuickActionsBar() {
  return (
    <div
      className="basita-quick-actions"
      style={{
        background: t.colors.cream.card,
        borderRadius: 18,
        border: `1px solid ${t.colors.cream.border}`,
        padding: 8,
        display: "flex",
        alignItems: "center",
        gap: 7,
        overflowX: "auto",
        direction: "rtl",
        boxShadow: "0 5px 16px rgba(67,48,29,0.045)",
        scrollbarWidth: "none",
      }}
    >
      {ACTIONS.map((action) => {
        const Icon = action.Icon;

        return (
          <a
            key={action.href}
            href={action.href}
            className={`basita-quick-action ${
              action.primary ? "is-primary" : ""
            } basita-btn-interactive`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minHeight: 46,
              padding: "0 14px",
              borderRadius: 13,
              textDecoration: "none",
              fontFamily: t.typography.fontFamily.base,
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.semibold,
              color: action.primary
                ? t.colors.white
                : t.colors.text.dark,
              background: action.primary
                ? t.colors.primary[800]
                : t.colors.cream.bg,
              border: action.primary
                ? "1px solid transparent"
                : `1px solid ${t.colors.cream.border}`,
              whiteSpace: "nowrap",
              flexShrink: 0,
              boxShadow: action.primary
                ? "0 5px 12px rgba(18,63,50,0.12)"
                : "none",
            }}
          >
            <span
              style={{
                width: 29,
                height: 29,
                borderRadius: 9,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: action.primary
                  ? "rgba(255,255,255,0.10)"
                  : t.colors.primary[50],
                flexShrink: 0,
              }}
            >
              <Icon
                size={16}
                strokeWidth={1.9}
                color={
                  action.primary
                    ? t.colors.gold[400]
                    : t.colors.primary[800]
                }
              />
            </span>

            <span>{action.label}</span>

            {action.primary && (
              <ArrowLeft
                size={14}
                strokeWidth={2}
                style={{
                  transform: "rotate(180deg)",
                  opacity: 0.85,
                }}
              />
            )}
          </a>
        );
      })}
    </div>
  );
}