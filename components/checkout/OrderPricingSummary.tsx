// components/checkout/OrderPricingSummary.tsx
import { t } from "@/theme";

export interface CheckoutPreview {
  subtotal: number;
  shippingCost: number;
  codFee: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

export default function OrderPricingSummary({ preview, loading }: { preview: CheckoutPreview | null; loading: boolean }) {
  return (
    <div style={{ borderTop: `1px solid ${t.colors.cream.border}`, marginTop: t.spacing["3"], paddingTop: t.spacing["3"] }}>
      {loading && !preview && <p style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.light, margin: 0 }}>جاري حساب التكلفة النهائية...</p>}

      {preview && (
        <div style={{ opacity: loading ? 0.6 : 1, transition: "opacity 150ms" }}>
          <Row label="المجموع الفرعي" value={preview.subtotal} />
          <Row label="التوصيل" value={preview.shippingCost} freeLabel="مجاني" />
          {preview.codFee > 0 && <Row label="رسوم الدفع عند الاستلام" value={preview.codFee} />}
          {preview.discountAmount > 0 && <Row label="الخصم" value={-preview.discountAmount} />}
          {preview.taxAmount > 0 && <Row label="ضريبة القيمة المضافة (15٪)" value={preview.taxAmount} />}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: t.typography.fontSize.lg,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.primary[800],
              marginTop: t.spacing["2"],
              paddingTop: t.spacing["2"],
              borderTop: `1px dashed ${t.colors.cream.border}`,
            }}
          >
            <span>الإجمالي الكلي</span>
            <span>{preview.total} ر.س</span>
          </div>
          {preview.taxAmount > 0 && (
            <p style={{ margin: `4px 0 0`, fontSize: t.typography.fontSize.xs, color: t.colors.text.light, textAlign: "left" }}>
              شامل ضريبة القيمة المضافة
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, freeLabel }: { label: string; value: number; freeLabel?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, padding: "3px 0" }}>
      <span>{label}</span>
      <span>{value === 0 && freeLabel ? freeLabel : `${value} ر.س`}</span>
    </div>
  );
}
