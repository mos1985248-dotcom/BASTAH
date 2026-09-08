// components/cart/CartOrderSummaryCard.tsx
// ⚠️ لا يُعاد حساب أي رقم هنا — subtotal يُجمَّع فقط من أسعار العناصر التي
// أرجعها /api/cart أصلاً (عرض، وليس منطقاً مالياً)، وباقي البنود (الشحن/
// الضريبة/رسوم COD) تأتي حصراً من /api/checkout/preview — نفس نقطة
// النهاية ونفس الدوال المستخدمة فعلياً بصفحة الدفع، فلا يمكن أن يختلف
// الرقم المعروض هنا عمّا سيُحتسَب عند إتمام الطلب.
import { useState } from "react";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { t } from "@/theme";
import { CheckoutPreview } from "@/components/checkout/OrderPricingSummary";

const PAYMENT_BADGES = ["مدى", "VISA", "Mastercard", "Apple Pay", "STC Pay"];

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
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, padding: t.spacing["5"], position: "sticky", top: t.spacing["4"] }}>
      <h3 style={{ margin: `0 0 ${t.spacing["4"]}`, fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
        ملخص الطلب
      </h3>

      <div style={{ marginBottom: t.spacing["4"] }}>
        <label style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, display: "block", marginBottom: 6 }}>كود الخصم</label>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="اكتب كود الخصم هنا"
            style={{ flex: 1, padding: "9px 12px", border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, fontSize: t.typography.fontSize.sm, direction: "rtl" }}
          />
          <button
            title="أكواد الخصم تُطبَّق قريباً"
            style={{ padding: "0 18px", background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.md, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, cursor: "not-allowed", opacity: 0.6 }}
            disabled
          >
            تطبيق
          </button>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${t.colors.cream.border}`, paddingTop: t.spacing["3"] }}>
        <Row label="المجموع الفرعي" value={subtotal} />

        {!hasAddress && (
          <p style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.light, margin: `${t.spacing["2"]} 0` }}>
            سيُحتسَب الشحن والضريبة عند اختيار عنوان الشحن بصفحة الدفع
          </p>
        )}

        {hasAddress && preview && (
          <div style={{ opacity: previewLoading ? 0.6 : 1 }}>
            <Row label="رسوم التوصيل" value={preview.shippingCost} freeLabel="مجاني" />
            {preview.codFee > 0 && <Row label="رسوم الدفع عند الاستلام" value={preview.codFee} />}
            {preview.discountAmount > 0 && <Row label="الخصم" value={-preview.discountAmount} />}
            {preview.taxAmount > 0 && <Row label="ضريبة القيمة المضافة (15٪)" value={preview.taxAmount} />}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: t.typography.fontSize.xl,
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.primary[800],
            marginTop: t.spacing["3"],
            paddingTop: t.spacing["3"],
            borderTop: `1px dashed ${t.colors.cream.border}`,
          }}
        >
          <span>الإجمالي الكلي</span>
          <span>{hasAddress && preview ? preview.total : subtotal} ر.س</span>
        </div>
        {hasAddress && preview && preview.taxAmount > 0 && (
          <p style={{ margin: `4px 0 0`, fontSize: t.typography.fontSize.xs, color: t.colors.text.light }}>شامل ضريبة القيمة المضافة</p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"], marginTop: t.spacing["4"] }}>
        <a
          href={disabled ? undefined : `/checkout?store=${storeId}`}
          aria-disabled={disabled}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            textAlign: "center",
            padding: 14,
            background: disabled ? t.colors.cream.border : t.colors.primary[800],
            color: disabled ? t.colors.text.light : t.colors.white,
            borderRadius: t.radius.lg,
            textDecoration: "none",
            fontSize: t.typography.fontSize.base,
            fontWeight: t.typography.fontWeight.bold,
            pointerEvents: disabled ? "none" : "auto",
          }}
        >
          <ShoppingBag size={16} strokeWidth={1.8} />
          إتمام الطلب
        </a>
        <a
          href="/marketplace"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center", padding: 13, background: t.colors.white, color: t.colors.primary[800], border: `1.5px solid ${t.colors.primary[800]}`, borderRadius: t.radius.lg, textDecoration: "none", fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold }}
        >
          <ArrowLeft size={14} strokeWidth={2} />
          متابعة التسوّق
        </a>
      </div>

      <div style={{ marginTop: t.spacing["4"], textAlign: "center" }}>
        <p style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.light, margin: `0 0 6px` }}>طرق دفع آمنة</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {PAYMENT_BADGES.map((b) => (
            <span key={b} style={{ fontSize: t.typography.fontSize.xs, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.sm, padding: "3px 9px", color: t.colors.text.mid }}>
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, freeLabel }: { label: string; value: number; freeLabel?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, padding: "4px 0" }}>
      <span>{label}</span>
      <span>{value === 0 && freeLabel ? freeLabel : `${value} ر.س`}</span>
    </div>
  );
}
