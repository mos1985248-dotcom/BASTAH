// components/marketplace/SortBar.tsx
import { t } from "@/theme";

const SORT_OPTIONS = [
  { id: "popular", label: "الأكثر طلباً" },
  { id: "newest", label: "الأحدث" },
  { id: "price_asc", label: "السعر: الأقل" },
  { id: "price_desc", label: "السعر: الأعلى" },
];

export default function SortBar({
  total,
  sort,
  onSortChange,
}: {
  total: number;
  sort: string;
  onSortChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: t.spacing["4"],
      }}
    >
      <span style={{ fontSize: t.typography.fontSize.sm, color: t.colors.text.mid }}>{total} منتج</span>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        style={{
          padding: "8px 14px",
          borderRadius: t.radius.full,
          border: `1px solid ${t.colors.cream.border}`,
          fontSize: t.typography.fontSize.sm,
          background: t.colors.white,
          color: t.colors.text.dark,
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
