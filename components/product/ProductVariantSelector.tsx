// components/product/ProductVariantSelector.tsx
import { t } from "@/theme";
import { ProductVariantItem } from "./types";

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
  if (variants.length === 0) return null;

  // اسم مجموعة الخيار (مثال: "الحجم") — من أول خيار بأول variant إن وُجد
  const groupLabel = Array.isArray(variants[0]?.options) && variants[0].options[0]?.name ? variants[0].options[0].name : "الخيار";

  return (
    <div style={{ marginBottom: t.spacing["4"] }}>
      <p style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
        اختر {groupLabel}
      </p>
      <div style={{ display: "flex", gap: t.spacing["2"], flexWrap: "wrap" }}>
        {variants.map((v) => {
          const isSelected = v.id === selectedId;
          const outOfStock = v.quantity <= 0;
          const label = Array.isArray(v.options) && v.options[0]?.value ? v.options[0].value : v.nameAr;
          const price = v.price ?? basePrice;
          return (
            <button
              key={v.id}
              onClick={() => !outOfStock && onSelect(v.id)}
              disabled={outOfStock}
              className="basita-btn-interactive"
              style={{
                padding: "10px 16px",
                minWidth: 76,
                textAlign: "center",
                borderRadius: t.radius.md,
                border: `1.5px solid ${isSelected ? t.colors.primary[800] : t.colors.cream.border}`,
                background: isSelected ? t.colors.primary[800] : t.colors.white,
                color: outOfStock ? t.colors.text.light : isSelected ? t.colors.white : t.colors.text.dark,
                cursor: outOfStock ? "not-allowed" : "pointer",
                opacity: outOfStock ? 0.55 : 1,
                position: "relative",
              }}
            >
              <div style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold }}>{label}</div>
              <div style={{ fontSize: t.typography.fontSize.xs, marginTop: 2 }}>{outOfStock ? "نفدت الكمية" : `${price} ر.س`}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
