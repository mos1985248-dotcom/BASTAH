// components/cart/CartOrderSummaryCard.tsx
// ⚠️ لا يُعاد حساب أي رقم هنا — subtotal يُجمَّع فقط من أسعار العناصر التي
// أرجعها /api/cart أصلاً (عرض، وليس منطقاً مالياً)، وباقي البنود (الشحن/
// الضريبة/رسوم COD) تأتي حصراً من /api/checkout/preview — نفس نقطة
// النهاية ونفس الدوال المستخدمة فعلياً بصفحة الدفع، فلا يمكن أن يختلف
// الرقم المعروض هنا عمّا سيُحتسَب عند إتمام الطلب.

import { useState } from "react";
import {
  ShoppingBag,
  ArrowLeft,
  Lock,
  Tag,
  Truck,
} from "lucide-react";
import { t } from "@/theme";
import { CheckoutPreview } from "@/components/checkout/OrderPricingSummary";

const PAYMENT_BADGES = [
  "مدى",
  "VISA",
  "Mastercard",
  "Apple Pay",
  "STC Pay",
];

export default function CartOrderSummaryCard({
  storeId,
  subtotal,
  preview,
  previewLoading,
  hasAddress,
  disabled,
}: {
  storeId: string;
  subtotal: number;
  preview: CheckoutPreview | null;
  previewLoading: boolean;
  hasAddress: boolean;
  disabled: boolean;
}) {
  const [coupon, setCoupon] = useState("");

  return (
    <div
      dir="rtl"
      className="basita-cart-summary"
      style={{
        position: "sticky",
        top: t.spacing["4"],
        overflow: "hidden",
        background: t.colors.white,
        border: `1px solid ${t.colors.cream.border}`,
        borderRadius: t.radius.xl,
        padding: t.spacing["4"],
        boxShadow: "0 7px 24px rgba(25, 45, 35, 0.045)",
      }}
    >
      {/* الشريط العلوي */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          insetInlineStart: 0,
          width: 72,
          height: 3,
          background: t.colors.gold[600],
          borderRadius: "0 0 5px 0",
        }}
      />

      {/* العنوان */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginBottom: t.spacing["3"],
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 34,
            height: 34,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: t.radius.md,
            background: t.colors.cream.warm,
            color: t.colors.primary[800],
          }}
        >
          <ShoppingBag size={17} strokeWidth={1.7} />
        </span>

        <div>
          <h3
            style={{
              margin: 0,
              fontSize: t.typography.fontSize.base,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.primary[800],
              lineHeight: 1.4,
            }}
          >
            ملخص الطلب
          </h3>

          <p
            style={{
              margin: "2px 0 0",
              fontSize: 11,
              color: t.colors.text.light,
              lineHeight: 1.5,
            }}
          >
            راجع تفاصيل طلبك قبل إتمام الشراء
          </p>
        </div>
      </div>

      {/* كوبون الخصم */}
      <div
        style={{
          marginBottom: t.spacing["3"],
          padding: t.spacing["2"],
          background: t.colors.cream.bg,
          border: `1px solid ${t.colors.cream.border}`,
          borderRadius: t.radius.lg,
        }}
      >
        <label
          htmlFor="cart-coupon"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            color: t.colors.text.mid,
            marginBottom: 6,
            fontWeight: t.typography.fontWeight.semibold,
          }}
        >
          <Tag size={12} strokeWidth={1.8} />
          كود الخصم
        </label>

        <div
          style={{
            display: "flex",
            gap: 6,
          }}
        >
          <input
            id="cart-coupon"
            value={coupon}
            onChange={(e) =>
              setCoupon(e.target.value)
            }
            placeholder="اكتب كود الخصم هنا"
            style={{
              flex: 1,
              minWidth: 0,
              height: 38,
              padding: "8px 10px",
              background: t.colors.white,
              border: `1px solid ${t.colors.cream.border}`,
              borderRadius: t.radius.md,
              fontSize: 12,
              color: t.colors.text.dark,
              direction: "rtl",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <button
            type="button"
            title="أكواد الخصم تُطبَّق قريباً"
            disabled
            style={{
              flexShrink: 0,
              minWidth: 64,
              height: 38,
              padding: "0 10px",
              background: t.colors.primary[800],
              color: t.colors.white,
              border: "none",
              borderRadius: t.radius.md,
              fontSize: 11,
              fontWeight: t.typography.fontWeight.bold,
              cursor: "not-allowed",
              opacity: 0.5,
            }}
          >
            تطبيق
          </button>
        </div>
      </div>

      {/* الأسعار */}
      <div
        style={{
          paddingTop: t.spacing["2"],
          borderTop: `1px solid ${t.colors.cream.border}`,
        }}
      >
        <Row
          label="المجموع الفرعي"
          value={subtotal}
        />

        {!hasAddress && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 6,
              margin: `${t.spacing["2"]} 0`,
              padding: "8px 9px",
              background: t.colors.cream.bg,
              borderRadius: t.radius.md,
            }}
          >
            <Truck
              size={13}
              strokeWidth={1.7}
              color={t.colors.text.light}
              style={{
                flexShrink: 0,
                marginTop: 1,
              }}
            />

            <p
              style={{
                fontSize: 11,
                color: t.colors.text.light,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              سيُحتسَب الشحن والضريبة عند اختيار عنوان
              الشحن بصفحة الدفع
            </p>
          </div>
        )}

        {hasAddress && preview && (
          <div
            style={{
              opacity: previewLoading ? 0.6 : 1,
              transition: "opacity 160ms ease",
            }}
          >
            <Row
              label="رسوم التوصيل"
              value={preview.shippingCost}
              freeLabel="مجاني"
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
        )}

        {/* الإجمالي */}
        <div
          className="basita-cart-total"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: t.spacing["3"],
            marginTop: t.spacing["3"],
            padding: `${t.spacing["3"]} 0 0`,
            borderTop: `1px dashed ${t.colors.cream.border}`,
          }}
        >
          <span
            style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.text.dark,
            }}
          >
            الإجمالي الكلي
          </span>

          <span
            style={{
              fontSize: "clamp(21px, 2.2vw, 25px)",
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.primary[800],
              whiteSpace: "nowrap",
              lineHeight: 1.2,
            }}
          >
            {hasAddress && preview
              ? preview.total
              : subtotal}{" "}
            <small
              style={{
                fontSize: 11,
                fontWeight: t.typography.fontWeight.medium,
                color: t.colors.text.mid,
              }}
            >
              ر.س
            </small>
          </span>
        </div>

        {hasAddress &&
          preview &&
          preview.taxAmount > 0 && (
            <p
              style={{
                margin: "4px 0 0",
                textAlign: "end",
                fontSize: 11,
                color: t.colors.text.light,
              }}
            >
              شامل ضريبة القيمة المضافة
            </p>
          )}
      </div>

      {/* الأزرار */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginTop: t.spacing["4"],
        }}
      >
        <a
          href={
            disabled
              ? undefined
              : `/checkout?store=${storeId}`
          }
          aria-disabled={disabled}
          className="basita-cart-checkout-button"
          style={{
            minHeight: 46,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            textAlign: "center",
            padding: "10px 13px",
            background: disabled
              ? t.colors.cream.border
              : t.colors.primary[800],
            color: disabled
              ? t.colors.text.light
              : t.colors.white,
            border: `1px solid ${
              disabled
                ? t.colors.cream.border
                : t.colors.primary[800]
            }`,
            borderRadius: t.radius.md,
            textDecoration: "none",
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            pointerEvents: disabled
              ? "none"
              : "auto",
            boxShadow: disabled
              ? "none"
              : "0 5px 14px rgba(15, 61, 46, 0.13)",
            transition:
              "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
          }}
        >
          <ShoppingBag
            size={15}
            strokeWidth={1.8}
          />
          إتمام الطلب
        </a>

        <a
          href="/marketplace"
          className="basita-cart-continue-button"
          style={{
            minHeight: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            textAlign: "center",
            padding: "9px 12px",
            background: t.colors.white,
            color: t.colors.primary[800],
            border: `1.5px solid ${t.colors.primary[800]}`,
            borderRadius: t.radius.md,
            textDecoration: "none",
            fontSize: 12,
            fontWeight: t.typography.fontWeight.bold,
            transition:
              "transform 160ms ease, background-color 160ms ease",
          }}
        >
          <ArrowLeft
            size={13}
            strokeWidth={2}
          />
          متابعة التسوّق
        </a>
      </div>

      {/* وسائل الدفع */}
      <div
        style={{
          marginTop: t.spacing["3"],
          paddingTop: t.spacing["3"],
          borderTop: `1px solid ${t.colors.cream.border}`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            marginBottom: 6,
            color: t.colors.text.light,
          }}
        >
          <Lock
            size={11}
            strokeWidth={1.7}
          />

          <p
            style={{
              fontSize: 11,
              color: t.colors.text.light,
              margin: 0,
            }}
          >
            طرق دفع آمنة
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {PAYMENT_BADGES.map((b) => (
            <span
              key={b}
              style={{
                fontSize: 9,
                fontWeight:
                  t.typography.fontWeight.semibold,
                border: `1px solid ${t.colors.cream.border}`,
                background: t.colors.cream.bg,
                borderRadius: t.radius.sm,
                padding: "3px 7px",
                color: t.colors.text.mid,
                whiteSpace: "nowrap",
              }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .basita-cart-checkout-button:hover:not([aria-disabled="true"]) {
          transform: translateY(-1px);
          background: ${t.colors.primary[700]} !important;
          box-shadow: 0 7px 18px rgba(15, 61, 46, 0.18) !important;
        }

        .basita-cart-continue-button:hover {
          transform: translateY(-1px);
          background: ${t.colors.cream.warm} !important;
        }

        .basita-cart-checkout-button:focus-visible,
        .basita-cart-continue-button:focus-visible,
        #cart-coupon:focus-visible {
          outline: 3px solid rgba(198, 164, 82, 0.25);
          outline-offset: 2px;
        }

        @media (max-width: 900px) {
          .basita-cart-summary {
            position: static !important;
          }
        }

        @media (max-width: 480px) {
          .basita-cart-summary {
            padding: ${t.spacing["3"]} !important;
            border-radius: ${t.radius.lg} !important;
          }

          .basita-cart-summary h3 {
            font-size: ${t.typography.fontSize.base} !important;
          }

          .basita-cart-total {
            margin-top: ${t.spacing["2"]} !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-cart-checkout-button,
          .basita-cart-continue-button {
            transition: none !important;
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
}: {
  label: string;
  value: number;
  freeLabel?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: t.spacing["3"],
        fontSize: 12,
        color: t.colors.text.mid,
        padding: "4px 0",
        lineHeight: 1.5,
      }}
    >
      <span>{label}</span>

      <span
        style={{
          color:
            value < 0
              ? t.colors.semantic.success
              : t.colors.text.body,
          fontWeight:
            value < 0
              ? t.typography.fontWeight.semibold
              : t.typography.fontWeight.regular,
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