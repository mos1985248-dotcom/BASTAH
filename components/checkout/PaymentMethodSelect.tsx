// components/checkout/PaymentMethodSelect.tsx
// كل الخيارات حقيقية ومربوطة فعلياً بـ/api/checkout — البطاقة/مدى وApple Pay وSTC Pay
// تُنشئ فاتورة Moyasar حقيقية (صفحة الدفع المُستضافة تعرض الطرق المفعَّلة بحساب التاجر)،
// والدفع عند الاستلام تدفّق منفصل بدون Moyasar. التحويل البنكي والاستلام من الموقع
// يظهران فقط لو المتجر فعّلهما فعلياً (bankTransferEnabled/pickupEnabled — GET /api/cart).
import { Check, CreditCard, MapPin } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import c from "./checkout.module.css";
import s from "./pay.module.css";

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

export default function PaymentMethodSelect({
  value,
  onChange,
  bankTransferAvailable,
  pickupAvailable,
  fulfillmentMethod,
  onFulfillmentChange,
}: Props) {
  const methods = bankTransferAvailable
    ? [...METHODS, { value: "BANK_TRANSFER", label: "تحويل بنكي مباشر", badges: ["تحويل يدوي"] }]
    : METHODS;

  return (
    <section dir="rtl" className={c.card} style={uiVars} aria-labelledby="payment-method-title">
      <div className={c.cardHead}>
        <span className={c.cardIcon}><CreditCard size={19} strokeWidth={1.7} aria-hidden="true" /></span>
        <div>
          <h2 id="payment-method-title" className={c.cardTitle}>طريقة الدفع</h2>
          <p className={c.cardSub}>اختر الطريقة المناسبة لإتمام طلبك</p>
        </div>
      </div>

      <div className={c.cardBody}>
        <div className={s.methods} role="radiogroup" aria-labelledby="payment-method-title">
          {methods.map((m) => {
            const active = value === m.value;
            return (
              <label key={m.value} className={`${s.option} ${active ? s.optionOn : ""}`}>
                <span className={s.optMain}>
                  <span className={s.radio} aria-hidden="true">
                    {active && <Check size={13} strokeWidth={3} />}
                  </span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={m.value}
                    checked={active}
                    onChange={() => {
                      onChange(m.value);

                      // فقط BANK_TRANSFER يسمح بالاستلام — أي طريقة ثانية ترجع تلقائياً للشحن
                      if (m.value !== "BANK_TRANSFER" && fulfillmentMethod === "PICKUP") {
                        onFulfillmentChange("SHIPPING");
                      }
                    }}
                  />
                  <span className={s.optLabel}>{m.label}</span>
                </span>
                <span className={s.badges}>
                  {m.badges.map((b) => (
                    <span key={b} className={s.badge}>{b}</span>
                  ))}
                </span>
              </label>
            );
          })}
        </div>

        {value === "BANK_TRANSFER" && pickupAvailable && (
          <div className={s.fulfil}>
            <p className={s.fulfilTitle}>
              <MapPin size={16} strokeWidth={1.8} aria-hidden="true" />
              طريقة الاستلام
            </p>
            <div className={s.fulfilGrid} role="radiogroup" aria-label="طريقة الاستلام">
              <FulfillmentOption label="شحن للعنوان" active={fulfillmentMethod === "SHIPPING"} onClick={() => onFulfillmentChange("SHIPPING")} />
              <FulfillmentOption label="استلام من موقع التاجر" active={fulfillmentMethod === "PICKUP"} onClick={() => onFulfillmentChange("PICKUP")} />
            </div>
          </div>
        )}

        {value === "BANK_TRANSFER" && (
          <p className={s.bankNote}>
            ستظهر لك بيانات حساب التاجر بعد تأكيد الطلب، وترفع إثبات التحويل من صفحة طلبك.
          </p>
        )}
      </div>
    </section>
  );
}

function FulfillmentOption({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={active} className={`${s.fulfilBtn} ${active ? s.fulfilOn : ""}`} onClick={onClick}>
      {label}
    </button>
  );
}
