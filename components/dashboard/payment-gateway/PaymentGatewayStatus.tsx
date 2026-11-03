// components/dashboard/payment-gateway/PaymentGatewayStatus.tsx
// عرض فقط — يعكس حرفياً ما يرجعه GET /api/stores/payment-gateway
// (connected, publishableKey, connectedAt). السرّ لا يظهر هنا أبداً لأن
// الـAPI نفسه لا يعيده إطلاقاً.
import { CreditCard, ShieldCheck } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import StatusBadge from "@/components/dashboard/ui/StatusBadge";
import s from "../forms.module.css";

export default function PaymentGatewayStatus({ publishableKey, connectedAt }: { publishableKey: string | null; connectedAt: string | null }) {
  return (
    <section className={s.panel} style={uiVars} aria-labelledby="gw-status-title">
      <div className={s.panelHead}>
        <div className={s.itemLead}>
          <span className={s.itemIcon} style={{ color: "var(--ui-green)" }}><CreditCard size={18} strokeWidth={1.7} aria-hidden="true" /></span>
          <h2 id="gw-status-title" className={s.panelTitle}>Moyasar</h2>
        </div>
        <StatusBadge label="بوابة الدفع متصلة" tone="ok" />
      </div>
      <div className={s.panelBody}>
        <div>
          <p className={s.help}>المفتاح العلني</p>
          <code dir="ltr" style={{ fontSize: 14, color: "var(--ui-ink)", wordBreak: "break-all" }}>{publishableKey ?? "—"}</code>
        </div>
        <div>
          <p className={s.help}>تاريخ الربط</p>
          <p className={s.itemName} style={{ fontWeight: 500 }}>
            {connectedAt ? new Date(connectedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }) : "—"}
          </p>
        </div>
        <p className={s.note}>
          <ShieldCheck size={15} strokeWidth={1.8} aria-hidden="true" />
          المفتاح السري وسر الـ Webhook محفوظان ومشفَّران — لا يُعرَضان هنا لأي طرف بعد الحفظ.
        </p>
      </div>
    </section>
  );
}
