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
        marginTop: t.spacing["2"],
        paddingTop: t.spacing["3"],
        borderTop: `1px solid ${t.colors.cream.border}`,
      }}
    >
      {/* Loading state */}
      {loading && !preview && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: `${t.spacing["2"]} 0`,
            color: t.colors.text.light,
            fontSize: 11,
          }}
        >
          <span
            aria-hidden="true"
            className="basita-pricing-loader"
            style={{
              width: 13,
              height: 13,
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
              marginBottom: t.spacing["1"],
              color: t.colors.text.dark,
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 28,
                height: 28,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.md,
                background: t.colors.cream.warm,
                color: t.colors.primary[800],
              }}
            >
              <Receipt
                size={14}
                strokeWidth={1.7}
              />
            </span>

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
              icon={<Truck size={13} strokeWidth={1.7} />}
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
              gap: t.spacing["2"],
              marginTop: t.spacing["2"],
              paddingTop: t.spacing["2"],
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
                fontSize: t.typography.fontSize.lg,
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
                marginTop: 5,
                color: t.colors.text.light,
                fontSize: 10,
              }}
            >
              <CheckCircle2
                size={11}
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

        @media (max-width: 480px) {
          .basita-order-pricing {
            margin-top: ${t.spacing["2"]} !important;
            padding-top: ${t.spacing["2"]} !important;
          }

          .basita-pricing-total span:first-child {
            font-size: ${t.typography.fontSize.sm} !important;
          }

          .basita-pricing-total span:last-child {
            font-size: ${t.typography.fontSize.lg} !important;
          }
        }

        @media (max-width: 360px) {
          .basita-pricing-rows > div {
            min-height: 28px !important;
            padding-block: 3px !important;
            font-size: 12px !important;
          }

          .basita-pricing-total span:first-child {
            font-size: 13px !important;
          }

          .basita-pricing-total span:last-child {
            font-size: 17px !important;
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
        gap: t.spacing["2"],
        minHeight: 28,
        padding: "3px 0",
        color: t.colors.text.mid,
        fontSize: 12,
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
              flexShrink: 0,
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
          fontWeight: t.typography.fontWeight.medium,
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