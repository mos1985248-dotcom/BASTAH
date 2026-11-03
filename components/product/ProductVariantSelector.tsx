// components/product/ProductVariantSelector.tsx
import type { ProductVariantItem } from "./types";
import s from "./buy.module.css";

export default function ProductVariantSelector({
  variants,
  selectedId,
  onSelect,
  basePrice,
}: {
  variants: ProductVariantItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  basePrice: number;
}) {
  const groupLabel = variants[0]?.options?.[0]?.name || "الخيار";
  return (
    <div>
      <div className={s.variantHead}>
        <span className={s.label} style={{ margin: 0 }}>اختر {groupLabel}</span>
        {selectedId && <span className={s.chosen}>تم الاختيار</span>}
      </div>
      <div className={s.variantGrid}>
        {variants.map((v) => {
          const on = v.id === selectedId;
          const out = v.quantity <= 0;
          const label = v.options?.[0]?.value || v.nameAr;
          const price = v.price ?? basePrice;
          return (
            <button
              key={v.id}
              type="button"
              className={`${s.variant} ${on ? s.variantOn : ""}`}
              onClick={() => !out && onSelect(v.id)}
              disabled={out}
              aria-pressed={on}
            >
              <span className={s.variantName}>{label}</span>
              <span className={s.variantPrice}>{out ? "نفدت الكمية" : `${price} ر.س`}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
