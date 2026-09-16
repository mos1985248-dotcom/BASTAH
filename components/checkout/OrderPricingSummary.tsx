// components/checkout/OrderPricingSummary.tsx

import { CheckCircle2, Receipt, Truck } from "lucide-react";
import { t } from "@/theme";

export interface CheckoutPreview {
  subtotal: number;
  shippingCost: number;
  codFee: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

export default function OrderPricingSummary({
  preview,
  loading,
}: {
  preview: CheckoutPreview | null;
  loading: boolean;
}) {
  return (
    <div
      dir="rtl"
      className="basita-order-pricing"
      style={{
        marginTop: t.spacing["3"],
        paddingTop: t.spacing["4"],
        borderTop: `1px solid ${t.colors.cream.border}`,
      }}
    >
      {/* Loading state */}
      {loading && !preview && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: `${t.spacing["2"]} 0`,
            color: t.colors.text.light,
            fontSize: t.typography.fontSize.xs,
          }}
        >
          <span
            aria-hidden="true"
            className="basita-pricing-loader"
            style={{
              width: 14,
              height: 14,
              flexShrink: 0,
              borderRadius: t.radius.full,
              border: `2px solid ${t.colors.cream.border}`,
              borderTopColor: t.colors.primary[800],
            }}
          />

          <span>جاري حساب التكلفة النهائية...</span>
        </div>
      )}

      {/* Pricing */}
      {preview && (
        <div
          style={{
            opacity: loading ? 0.6 : 1,
            transition: "opacity 150ms ease",
          }}
          aria-busy={loading}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginBottom: t.spacing["2"],
              color: t.colors.text.dark,
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            <Receipt
              size={16}
              strokeWidth={1.7}
            />

            <span>ملخص التكلفة</span>
          </div>

          <div
            className="basita-pricing-rows"
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Row
              label="المجموع الفرعي"
              value={preview.subtotal}
            />

            <Row
              label="التوصيل"
              value={preview.shippingCost}
              freeLabel="مجاني"
              icon={<Truck size={14} strokeWidth={1.7} />}
            />

            {preview.codFee > 0 && (
              <Row
                label="رسوم الدفع عند الاستلام"
                value={preview.codFee}
              />
            )}

            {preview.discountAmount > 0 && (
              <Row
                label="الخصم"
                value={-preview.discountAmount}
              />
            )}

            {preview.taxAmount > 0 && (
              <Row
                label="ضريبة القيمة المضافة (15٪)"
                value={preview.taxAmount}
              />
            )}
          </div>

          {/* Total */}
          <div
            className="basita-pricing-total"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: t.spacing["3"],
              marginTop: t.spacing["3"],
              paddingTop: t.spacing["3"],
              borderTop: `1px dashed ${t.colors.cream.border}`,
              color: t.colors.primary[800],
            }}
          >
            <span
              style={{
                fontSize: t.typography.fontSize.base,
                fontWeight: t.typography.fontWeight.bold,
              }}
            >
              الإجمالي الكلي
            </span>

            <span
              style={{
                fontSize: t.typography.fontSize.xl,
                fontWeight: t.typography.fontWeight.bold,
                whiteSpace: "nowrap",
              }}
            >
              {preview.total} ر.س
            </span>
          </div>

          {preview.taxAmount > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 5,
                marginTop: 6,
                color: t.colors.text.light,
                fontSize: t.typography.fontSize.xs,
              }}
            >
              <CheckCircle2
                size={12}
                strokeWidth={1.7}
              />

              <span>شامل ضريبة القيمة المضافة</span>
            </div>
          )}
        </div>
      )}

      <style>{`
        .basita-pricing-loader {
          animation: basita-pricing-spin 800ms linear infinite;
        }

        @keyframes basita-pricing-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 420px) {
          .basita-pricing-total span:last-child {
            font-size: ${t.typography.fontSize.lg} !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-pricing-loader {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function Row({
  label,
  value,
  freeLabel,
  icon,
}: {
  label: string;
  value: number;
  freeLabel?: string;
  icon?: React.ReactNode;
}) {
  const isDiscount = value < 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: t.spacing["3"],
        minHeight: 30,
        padding: "4px 0",
        color: t.colors.text.mid,
        fontSize: t.typography.fontSize.sm,
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          minWidth: 0,
        }}
      >
        {icon && (
          <span
            aria-hidden="true"
            style={{
              display: "flex",
              color: t.colors.text.light,
            }}
          >
            {icon}
          </span>
        )}

        <span>{label}</span>
      </span>

      <span
        style={{
          flexShrink: 0,
          color: isDiscount
            ? t.colors.semantic.success
            : t.colors.text.dark,
          fontWeight: isDiscount
            ? t.typography.fontWeight.medium
            : t.typography.fontWeight.medium,
          whiteSpace: "nowrap",
        }}
      >
        {value === 0 && freeLabel
          ? freeLabel
          : `${value} ر.س`}
      </span>
    </div>
  );
}