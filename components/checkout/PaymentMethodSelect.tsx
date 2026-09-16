// components/checkout/PaymentMethodSelect.tsx

// كل الخيارات هنا حقيقية ومربوطة فعلياً بـ/api/checkout — البطاقة/مدى
// وApple Pay وSTC Pay تُنشئ فاتورة Moyasar حقيقية (صفحة الدفع المُستضافة
// تعرض الطرق المفعَّلة فعلياً بحساب التاجر)، والدفع عند الاستلام تدفّق
// حقيقي منفصل بالكامل بدون Moyasar (lib/platform-settings.ts). التحويل
// البنكي والاستلام من الموقع يظهران فقط لو المتجر فعّلهما فعلياً
// (bankTransferEnabled/pickupEnabled — راجع GET /api/cart).

import {
  CreditCard,
  Landmark,
  MapPin,
  Check,
  type LucideIcon,
} from "lucide-react";
import { t } from "@/theme";

const METHODS: {
  value: string;
  label: string;
  badges: string[];
}[] = [
  {
    value: "CREDIT_CARD",
    label: "بطاقة ائتمان / مدى",
    badges: ["VISA", "Mastercard", "مدى"],
  },
  {
    value: "STCPAY",
    label: "STC Pay",
    badges: ["STC Pay"],
  },
  {
    value: "APPLE_PAY",
    label: "Apple Pay",
    badges: ["Apple Pay"],
  },
  {
    value: "CASH_ON_DELIVERY",
    label: "الدفع عند الاستلام",
    badges: ["نقداً عند الاستلام"],
  },
];

interface Props {
  value: string;
  onChange: (v: string) => void;
  bankTransferAvailable: boolean;
  pickupAvailable: boolean;
  fulfillmentMethod: "SHIPPING" | "PICKUP";
  onFulfillmentChange: (v: "SHIPPING" | "PICKUP") => void;
}

export default function PaymentMethodSelect({
  value,
  onChange,
  bankTransferAvailable,
  pickupAvailable,
  fulfillmentMethod,
  onFulfillmentChange,
}: Props) {
  const methods = bankTransferAvailable
    ? [
        ...METHODS,
        {
          value: "BANK_TRANSFER",
          label: "تحويل بنكي مباشر",
          badges: ["تحويل يدوي"],
        },
      ]
    : METHODS;

  return (
    <section
      dir="rtl"
      className="basita-payment-methods"
      aria-labelledby="payment-method-title"
      style={{
        background: t.colors.white,
        border: `1px solid ${t.colors.cream.border}`,
        borderRadius: t.radius.lg,
        overflow: "hidden",
        boxShadow: "0 5px 20px rgba(75, 56, 34, 0.05)",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: `${t.spacing["4"]} ${t.spacing["5"]}`,
          background: t.colors.cream.bg,
          borderBottom: `1px solid ${t.colors.cream.border}`,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            insetInlineStart: 0,
            top: 0,
            width: 4,
            height: "100%",
            background: t.colors.gold[600],
          }}
        />

        <span
          aria-hidden="true"
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: t.radius.md,
            background: t.colors.white,
            border: `1px solid ${t.colors.cream.border}`,
            color: t.colors.primary[800],
            boxShadow: "0 2px 8px rgba(75, 56, 34, 0.05)",
          }}
        >
          <CreditCard
            size={19}
            strokeWidth={1.7}
          />
        </span>

        <div>
          <h3
            id="payment-method-title"
            style={{
              margin: 0,
              fontSize: t.typography.fontSize.base,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.primary[800],
              lineHeight: 1.45,
            }}
          >
            طريقة الدفع
          </h3>

          <p
            style={{
              margin: "2px 0 0",
              fontSize: t.typography.fontSize.xs,
              color: t.colors.text.light,
            }}
          >
            اختر الطريقة المناسبة لإتمام طلبك
          </p>
        </div>
      </div>

      {/* Payment methods */}
      <div
        className="basita-payment-method-list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: t.spacing["2"],
          padding: t.spacing["4"],
        }}
      >
        {methods.map((m) => {
          const active = value === m.value;

          return (
            <label
              key={m.value}
              className={`basita-payment-option ${
                active ? "is-active" : ""
              }`}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: t.spacing["3"],
                minWidth: 0,
                padding: `${t.spacing["3"]} ${t.spacing["3"]}`,
                borderRadius: t.radius.md,
                border: `1.5px solid ${
                  active
                    ? t.colors.primary[800]
                    : t.colors.cream.border
                }`,
                background: active
                  ? t.colors.primary[100]
                  : t.colors.white,
                cursor: "pointer",
                transition:
                  "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease, transform 160ms ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: t.spacing["3"],
                  minWidth: 0,
                }}
              >
                <span
                  aria-hidden="true"
                  className="basita-payment-radio"
                  style={{
                    position: "relative",
                    width: 20,
                    height: 20,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: t.radius.full,
                    border: `2px solid ${
                      active
                        ? t.colors.primary[800]
                        : t.colors.cream.border
                    }`,
                    background: active
                      ? t.colors.primary[800]
                      : t.colors.white,
                  }}
                >
                  {active && (
                    <Check
                      size={12}
                      strokeWidth={2.8}
                      color={t.colors.white}
                    />
                  )}
                </span>

                <input
                  type="radio"
                  name="paymentMethod"
                  value={m.value}
                  checked={active}
                  onChange={() => {
                    onChange(m.value);

                    // فقط BANK_TRANSFER يسمح بالاستلام — أي طريقة ثانية ترجع تلقائياً للشحن
                    if (
                      m.value !== "BANK_TRANSFER" &&
                      fulfillmentMethod === "PICKUP"
                    ) {
                      onFulfillmentChange("SHIPPING");
                    }
                  }}
                  style={{
                    position: "absolute",
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                />

                <span
                  style={{
                    minWidth: 0,
                    color: t.colors.text.dark,
                    fontSize: t.typography.fontSize.sm,
                    fontWeight:
                      t.typography.fontWeight.semibold,
                    lineHeight: 1.5,
                  }}
                >
                  {m.label}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 5,
                  flexWrap: "wrap",
                  flexShrink: 0,
                }}
              >
                {m.badges.map((b) => (
                  <span
                    key={b}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      minHeight: 24,
                      padding: "2px 8px",
                      borderRadius: t.radius.sm,
                      border: `1px solid ${t.colors.cream.border}`,
                      background: t.colors.cream.warm,
                      color: t.colors.text.mid,
                      fontSize: t.typography.fontSize.xs,
                      fontWeight:
                        t.typography.fontWeight.medium,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {b}
                  </span>
                ))}
              </div>
            </label>
          );
        })}
      </div>

      {/* Fulfillment */}
      {value === "BANK_TRANSFER" && pickupAvailable && (
        <div
          style={{
            margin: `0 ${t.spacing["4"]} ${t.spacing["4"]}`,
            paddingTop: t.spacing["4"],
            borderTop: `1px solid ${t.colors.cream.border}`,
          }}
        >
          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              margin: `0 0 ${t.spacing["2"]}`,
              color: t.colors.text.dark,
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            <MapPin
              size={15}
              strokeWidth={1.8}
              color={t.colors.primary[800]}
            />
            طريقة الاستلام
          </p>

          <div
            className="basita-fulfillment-options"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: t.spacing["2"],
            }}
          >
            <FulfillmentOption
              label="شحن للعنوان"
              active={fulfillmentMethod === "SHIPPING"}
              onClick={() =>
                onFulfillmentChange("SHIPPING")
              }
            />

            <FulfillmentOption
              label="استلام من موقع التاجر"
              active={fulfillmentMethod === "PICKUP"}
              onClick={() =>
                onFulfillmentChange("PICKUP")
              }
            />
          </div>
        </div>
      )}

      {/* Bank transfer note */}
      {value === "BANK_TRANSFER" && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            margin: `0 ${t.spacing["4"]} ${t.spacing["4"]}`,
            padding: `${t.spacing["3"]} ${t.spacing["3"]}`,
            borderRadius: t.radius.md,
            background: t.colors.cream.warm,
            border: `1px solid ${t.colors.cream.border}`,
            color: t.colors.text.mid,
            fontSize: t.typography.fontSize.xs,
            lineHeight: 1.7,
          }}
        >
          <Landmark
            size={15}
            strokeWidth={1.8}
            color={t.colors.primary[800]}
            style={{
              flexShrink: 0,
              marginTop: 2,
            }}
          />

          <span>
            راح تشوفين بيانات حساب التاجر بعد تأكيد الطلب،
            وترفعين إثبات التحويل من صفحة طلبك.
          </span>
        </div>
      )}

      <style>{`
        .basita-payment-option:hover {
          border-color: ${t.colors.primary[800]} !important;
          box-shadow: 0 4px 12px rgba(75, 56, 34, 0.05);
          transform: translateY(-1px);
        }

        .basita-payment-option.is-active {
          box-shadow: 0 4px 14px rgba(75, 56, 34, 0.06);
        }

        .basita-payment-option:has(input:focus-visible) {
          outline: 3px solid ${t.colors.gold[600]};
          outline-offset: 2px;
        }

        @media (max-width: 600px) {
          .basita-payment-method-list {
            padding: ${t.spacing["3"]} !important;
          }

          .basita-payment-option {
            align-items: flex-start !important;
          }

          .basita-payment-option > div:last-child {
            max-width: 42%;
          }
        }

        @media (max-width: 480px) {
          .basita-payment-option {
            padding: ${t.spacing["3"]} !important;
          }

          .basita-payment-option > div:last-child {
            display: none !important;
          }

          .basita-fulfillment-options {
            grid-template-columns: 1fr !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-payment-option,
          .basita-payment-radio {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}

function FulfillmentOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`basita-fulfillment-option ${
        active ? "is-active" : ""
      }`}
      style={{
        minHeight: 44,
        padding: "9px 10px",
        borderRadius: t.radius.md,
        fontSize: t.typography.fontSize.xs,
        fontWeight: t.typography.fontWeight.bold,
        border: `1.5px solid ${
          active
            ? t.colors.primary[800]
            : t.colors.cream.border
        }`,
        background: active
          ? t.colors.primary[100]
          : t.colors.white,
        color: active
          ? t.colors.primary[800]
          : t.colors.text.mid,
        cursor: "pointer",
        transition:
          "border-color 160ms ease, background 160ms ease, box-shadow 160ms ease",
      }}
    >
      {label}
    </button>
  );
}