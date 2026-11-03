// components/marketplace/SortBar.tsx
import s from "./market.module.css";

const OPTIONS = [
  { id: "popular", label: "الأكثر طلباً" },
  { id: "newest", label: "الأحدث" },
  { id: "price_asc", label: "السعر: الأقل" },
  { id: "price_desc", label: "السعر: الأعلى" },
];

export default function SortBar({
  total,
  unit,
  sort,
  onSortChange,
}: {
  total: number;
  unit: string;
  sort?: string;
  onSortChange?: (v: string) => void;
}) {
  return (
    <div className={s.toolbar}>
      <span className={s.count}>
        {total} {unit}
      </span>
      {onSortChange && (
        <select
          className={s.select}
          aria-label="ترتيب المنتجات"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
        >
          {OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
