// components/dashboard/payment-gateway/PaymentGatewayStatus.tsx
// عرض فقط — يعكس حرفياً ما يرجعه GET /api/stores/payment-gateway
// (connected, publishableKey, connectedAt). السرّ لا يظهر هنا أبداً لأن
// الـAPI نفسه لا يعيده إطلاقاً.
import { CreditCard } from "lucide-react";
import { t } from "@/theme";
import StatusBadge from "@/components/admin/ui/StatusBadge";

export default function PaymentGatewayStatus({ publishableKey, connectedAt }: { publishableKey: string | null; connectedAt: string | null }) {
  return (
    <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, padding: t.spacing["4"] }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: t.spacing["3"] }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: t.radius.md, background: t.colors.primary[100], display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CreditCard size={16} strokeWidth={1.7} color={t.colors.primary[800]} />
          </span>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>Moyasar</p>
        </div>
        <StatusBadge label="بوابة الدفع متصلة" color={t.colors.semantic.success} bg={t.colors.semantic.successBg} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["2"] }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>المفتاح العلني</p>
          <code dir="ltr" style={{ fontSize: 13, color: t.colors.text.body }}>{publishableKey ?? "—"}</code>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 11, color: t.colors.text.light }}>تاريخ الربط</p>
          <p style={{ margin: 0, fontSize: 13, color: t.colors.text.body }}>
            {connectedAt ? new Date(connectedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }) : "—"}
          </p>
        </div>
      </div>

      <p style={{ margin: `${t.spacing["3"]} 0 0`, fontSize: 11, color: t.colors.text.light }}>
        المفتاح السري وسر الـ Webhook محفوظان ومشفَّران — لا يُعرَضان هنا لأي طرف بعد الحفظ.
      </p>
    </div>
  );
}
