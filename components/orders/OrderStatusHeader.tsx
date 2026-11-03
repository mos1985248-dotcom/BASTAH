// components/orders/OrderStatusHeader.tsx
import type { LucideIcon } from "lucide-react";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import c from "./order.module.css";

export interface StatusView {
  Icon: LucideIcon;
  title: string;
  note: string;
  spin?: boolean;
}

export default function OrderStatusHeader({
  view,
  tone,
  orderNumber,
  storeName,
  storeSlug,
  status,
}: {
  view: StatusView;
  tone: "ok" | "bad" | "neutral";
  orderNumber: string;
  storeName: string;
  storeSlug: string;
  status: string;
}) {
  return (
    <section className={c.status} style={uiVars} aria-live="polite">
      <span className={`${c.statusIcon} ${tone === "ok" ? c.ok : tone === "bad" ? c.bad : ""}`}>
        <view.Icon size={38} strokeWidth={1.6} className={view.spin ? c.spin : undefined} aria-hidden="true" />
      </span>
      <h1 className={c.statusTitle} style={{ fontFamily: t.typography.fontFamily.display }}>{view.title}</h1>
      <p className={c.statusMeta}>
        {orderNumber} · <a href={`/store/${storeSlug}`}>{storeName}</a>
      </p>
      <p className={c.statusNote}>{view.note}</p>
      <span className={c.chip}>
        الحالة: <strong>{ORDER_STATUS_LABEL[status] ?? status}</strong>
      </span>
    </section>
  );
}
