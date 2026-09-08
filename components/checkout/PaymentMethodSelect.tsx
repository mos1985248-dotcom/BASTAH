// components/checkout/PaymentMethodSelect.tsx
// كل الخيارات هنا حقيقية ومربوطة فعلياً بـ/api/checkout — البطاقة/مدى
// وApple Pay وSTC Pay تُنشئ فاتورة Moyasar حقيقية (صفحة الدفع المُستضافة
// تعرض الطرق المفعَّلة فعلياً بحساب التاجر)، والدفع عند الاستلام تدفّق
// حقيقي منفصل بالكامل بدون Moyasar (lib/platform-settings.ts). التحويل
// البنكي والاستلام من الموقع يظهران فقط لو المتجر فعّلهما فعلياً
// (bankTransferEnabled/pickupEnabled — راجع GET /api/cart).
import { CreditCard, Landmark, MapPin } from "lucide-react";
import { t } from "@/theme";

const METHODS: { value: string; label: string; badges: string[] }[] = [
  { value: "CREDIT_CARD", label: "بطاقة ائتمان / مدى", badges: ["VISA", "Mastercard", "مدى"] },
  { value: "STCPAY", label: "STC Pay", badges: ["STC Pay"] },
  { value: "APPLE_PAY", label: "Apple Pay", badges: ["Apple Pay"] },
  { value: "CASH_ON_DELIVERY", label: "الدفع عند الاستلام", badges: ["نقداً عند الاستلام"] },
];

interface Props {
  value: string;
  onChange: (v: string) => void;
  bankTransferAvailable: boolean;
  pickupAvailable: boolean;
  fulfillmentMethod: "SHIPPING" | "PICKUP";
  onFulfillmentChange: (v: "SHIPPING" | "PICKUP") => void;
}

export default function PaymentMethodSelect({ value, onChange, bankTransferAvailable, pickupAvailable, fulfillmentMethod, onFulfillmentChange }: Props) {
  const methods = bankTransferAvailable
    ? [...METHODS, { value: "BANK_TRANSFER", label: "تحويل بنكي مباشر", badges: ["تحويل يدوي"] }]
    : METHODS;

  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, padding: t.spacing["4"] }}>
      <h3 style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], display: "flex", alignItems: "center", gap: 6 }}>
        <CreditCard size={16} strokeWidth={1.8} />
        طريقة الدفع
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
        {methods.map((m) => {
          const active = value === m.value;
          return (
            <label
              key={m.value}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: t.spacing["3"],
                padding: "12px 14px",
                borderRadius: t.radius.md,
                border: `1.5px solid ${active ? t.colors.primary[800] : t.colors.cream.border}`,
                background: active ? t.colors.primary[100] : t.colors.white,
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: t.spacing["2"] }}>
                <input
                  type="radio"
                  checked={active}
                  onChange={() => {
                    onChange(m.value);
                    // فقط BANK_TRANSFER يسمح بالاستلام — أي طريقة ثانية ترجع تلقائياً للشحن
                    if (m.value !== "BANK_TRANSFER" && fulfillmentMethod === "PICKUP") onFulfillmentChange("SHIPPING");
                  }}
                />
                <span style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.text.dark }}>{m.label}</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {m.badges.map((b) => (
                  <span
                    key={b}
                    style={{
                      fontSize: t.typography.fontSize.xs,
                      color: t.colors.text.mid,
                      border: `1px solid ${t.colors.cream.border}`,
                      borderRadius: t.radius.sm,
                      padding: "2px 8px",
                      background: t.colors.cream.warm,
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

      {value === "BANK_TRANSFER" && pickupAvailable && (
        <div style={{ marginTop: t.spacing["3"], paddingTop: t.spacing["3"], borderTop: `1px solid ${t.colors.cream.border}` }}>
          <p style={{ display: "flex", alignItems: "center", gap: 5, margin: `0 0 ${t.spacing["2"]}`, fontSize: 12, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
            <MapPin size={13} strokeWidth={1.8} />
            طريقة الاستلام
          </p>
          <div style={{ display: "flex", gap: t.spacing["2"] }}>
            <FulfillmentOption label="شحن للعنوان" active={fulfillmentMethod === "SHIPPING"} onClick={() => onFulfillmentChange("SHIPPING")} />
            <FulfillmentOption label="استلام من موقع التاجر" active={fulfillmentMethod === "PICKUP"} onClick={() => onFulfillmentChange("PICKUP")} />
          </div>
        </div>
      )}

      {value === "BANK_TRANSFER" && (
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: `${t.spacing["3"]} 0 0`, fontSize: 11, color: t.colors.text.mid }}>
          <Landmark size={12} strokeWidth={1.8} />
          راح تشوفين بيانات حساب التاجر بعد تأكيد الطلب، وترفعين إثبات التحويل من صفحة طلبك.
        </p>
      )}
    </div>
  );
}

function FulfillmentOption({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, padding: "9px 10px", borderRadius: t.radius.md, fontSize: 12, fontWeight: t.typography.fontWeight.bold,
        border: `1.5px solid ${active ? t.colors.primary[800] : t.colors.cream.border}`,
        background: active ? t.colors.primary[100] : t.colors.white,
        color: active ? t.colors.primary[800] : t.colors.text.mid,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
