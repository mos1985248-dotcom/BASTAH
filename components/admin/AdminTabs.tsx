// components/admin/AdminTabs.tsx
import { t } from "@/theme";
import { BarChart3, Store, Headset, Users, Newspaper, ClipboardList, type LucideIcon } from "lucide-react";
import type { AdminTab } from "./tabs";

const TABS: { id: AdminTab; label: string; Icon: LucideIcon }[] = [
  { id: "overview", label: "الإحصاءات", Icon: BarChart3 },
  { id: "stores", label: "المتاجر", Icon: Store },
  { id: "tickets", label: "الدعم", Icon: Headset },
  { id: "users", label: "المستخدمون", Icon: Users },
  { id: "blog", label: "المدونة", Icon: Newspaper },
  { id: "audit", label: "سجل العمليات", Icon: ClipboardList },
];

export default function AdminTabs({ tab, onChange }: { tab: AdminTab; onChange: (t: AdminTab) => void }) {
  return (
    <div style={{ background: t.colors.white, borderBottom: `1px solid ${t.colors.cream.border}`, padding: "0 20px", display: "flex", overflowX: "auto" }}>
      {TABS.map((tb) => (
        <button
          key={tb.id}
          onClick={() => onChange(tb.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "11px 14px",
            background: "none",
            border: "none",
            borderBottom: `2.5px solid ${tab === tb.id ? t.colors.primary[800] : "transparent"}`,
            color: tab === tb.id ? t.colors.primary[800] : t.colors.text.mid,
            fontWeight: tab === tb.id ? t.typography.fontWeight.bold : t.typography.fontWeight.regular,
            cursor: "pointer",
            fontSize: t.typography.fontSize.xs,
            whiteSpace: "nowrap",
          }}
        >
          <tb.Icon size={14} strokeWidth={1.8} />
          {tb.label}
        </button>
      ))}
    </div>
  );
}
