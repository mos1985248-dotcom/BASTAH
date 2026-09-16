// components/admin/AdminTabs.tsx
import { t } from "@/theme";
import {
  BarChart3,
  Store,
  Headset,
  Users,
  Newspaper,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import type { AdminTab } from "./tabs";

const TABS: {
  id: AdminTab;
  label: string;
  Icon: LucideIcon;
}[] = [
  { id: "overview", label: "الإحصاءات", Icon: BarChart3 },
  { id: "stores", label: "المتاجر", Icon: Store },
  { id: "tickets", label: "الدعم", Icon: Headset },
  { id: "users", label: "المستخدمون", Icon: Users },
  { id: "blog", label: "المدونة", Icon: Newspaper },
  { id: "audit", label: "سجل العمليات", Icon: ClipboardList },
];

interface AdminTabsProps {
  tab: AdminTab;
  onChange: (tab: AdminTab) => void;
}

export default function AdminTabs({
  tab,
  onChange,
}: AdminTabsProps) {
  return (
    <nav
      dir="rtl"
      aria-label="أقسام لوحة الإدارة"
      style={{
        background: t.colors.white,
        borderBottom: `1px solid ${t.colors.cream.border}`,
        padding: "0 20px",
        display: "flex",
        alignItems: "stretch",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const active = tab === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={active ? "page" : undefined}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              minHeight: 48,
              padding: "0 16px",
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${
                active
                  ? t.colors.primary[800]
                  : "transparent"
              }`,
              color: active
                ? t.colors.primary[800]
                : t.colors.text.mid,
              fontWeight: active
                ? t.typography.fontWeight.bold
                : t.typography.fontWeight.regular,
              cursor: "pointer",
              fontSize: t.typography.fontSize.xs,
              whiteSpace: "nowrap",
              transition:
                "color 150ms ease, background 150ms ease",
              flexShrink: 0,
            }}
          >
            <Icon
              size={16}
              strokeWidth={active ? 2 : 1.8}
            />

            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
