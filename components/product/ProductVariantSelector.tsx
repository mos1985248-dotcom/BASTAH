// components/product/ProductVariantSelector.tsx

import { t } from "@/theme";
import { Check, PackageX } from "lucide-react";
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
  const groupLabel =
    Array.isArray(variants[0]?.options) &&
    variants[0].options[0]?.name
      ? variants[0].options[0].name
      : "الخيار";

  return (
    <div
      dir="rtl"
      className="basita-variant-selector"
      style={{
        marginBottom: t.spacing["4"],
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: t.spacing["2"],
          marginBottom: t.spacing["3"],
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.text.dark,
          }}
        >
          اختر {groupLabel}
        </p>

        {selectedId && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: t.typography.fontSize.xs,
              color: t.colors.primary[800],
              fontWeight: t.typography.fontWeight.semibold,
              whiteSpace: "nowrap",
            }}
          >
            <Check size={13} strokeWidth={2.2} />
            تم الاختيار
          </span>
        )}
      </div>

      <div
        className="basita-variant-options"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(105px, 1fr))",
          gap: t.spacing["2"],
        }}
      >
        {variants.map((v) => {
          const isSelected = v.id === selectedId;
          const outOfStock = v.quantity <= 0;

          const label =
            Array.isArray(v.options) && v.options[0]?.value
              ? v.options[0].value
              : v.nameAr;

          const price = v.price ?? basePrice;

          return (
            <button
              key={v.id}
              type="button"
              onClick={() => !outOfStock && onSelect(v.id)}
              disabled={outOfStock}
              aria-pressed={isSelected}
              className="basita-variant-option"
              style={{
                position: "relative",
                minWidth: 0,
                minHeight: 68,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                padding: "9px 10px",
                textAlign: "center",
                borderRadius: t.radius.md,
                border: `1.5px solid ${
                  isSelected
                    ? t.colors.primary[800]
                    : t.colors.cream.border
                }`,
                background: isSelected
                  ? t.colors.primary[800]
                  : t.colors.white,
                color: outOfStock
                  ? t.colors.text.light
                  : isSelected
                    ? t.colors.white
                    : t.colors.text.dark,
                cursor: outOfStock ? "not-allowed" : "pointer",
                opacity: outOfStock ? 0.58 : 1,
                boxShadow: isSelected
                  ? "0 5px 14px rgba(15, 61, 46, 0.13)"
                  : "0 2px 7px rgba(25, 45, 35, 0.035)",
                transition:
                  "transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
              }}
            >
              {isSelected && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 6,
                    insetInlineStart: 6,
                    width: 18,
                    height: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: t.colors.white,
                    color: t.colors.primary[800],
                  }}
                >
                  <Check size={11} strokeWidth={2.5} />
                </span>
              )}

              {outOfStock && (
                <span
                  aria-hidden="true"
                  style={{
                    width: 22,
                    height: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 1,
                    borderRadius: "50%",
                    background: t.colors.cream.bg,
                    color: t.colors.text.light,
                  }}
                >
                  <PackageX size={13} strokeWidth={1.7} />
                </span>
              )}

              <span
                style={{
                  display: "block",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.bold,
                  lineHeight: 1.4,
                }}
              >
                {label}
              </span>

              <span
                style={{
                  display: "block",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: t.typography.fontSize.xs,
                  marginTop: 1,
                  lineHeight: 1.4,
                  opacity: isSelected ? 0.88 : 0.78,
                }}
              >
                {outOfStock ? "نفدت الكمية" : `${price} ر.س`}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        .basita-variant-option:not(:disabled):hover {
          transform: translateY(-1px);
          border-color: ${t.colors.primary[800]} !important;
          box-shadow: 0 5px 14px rgba(25, 45, 35, 0.08) !important;
        }

        .basita-variant-option:not(:disabled):focus-visible {
          outline: 3px solid rgba(198, 164, 82, 0.25);
          outline-offset: 2px;
        }

        .basita-variant-option:disabled {
          box-shadow: none !important;
        }

        @media (max-width: 560px) {
          .basita-variant-options {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 360px) {
          .basita-variant-option {
            min-height: 64px !important;
            padding-inline: 7px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-variant-option {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}