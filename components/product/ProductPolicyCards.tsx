// components/product/ProductPolicyCards.tsx
// امتداد حقيقي لإعدادات المتجر (Dashboard → Backend → Storefront → Product
// Page) — كل قيمة من StorePublicInfo الحقيقي، ولا بطاقة تُعرض بدون بيانات.
import { t } from "@/theme";
import { RotateCcw, Truck, CreditCard, type LucideIcon } from "lucide-react";
import { ProductDetail } from "./types";

export default function ProductPolicyCards({ product }: { product: ProductDetail }) {
  const info = product.store.publicInfo;

  const cards: { Icon: LucideIcon; title: string; body: string | null }[] = [
    {
      Icon: RotateCcw,
      title: "سياسة الإرجاع",
      body: info ? `يمكنك إرجاع المنتج خلال ${info.returnPolicyDays} ${info.returnPolicyDays === 1 ? "يوم" : "أيام"} من الاستلام، بشرط أن يكون بحالته الأصلية.` : null,
    },
    {
      Icon: Truck,
      title: "الشحن والتوصيل",
      body: info
        ? `تجهيز خلال ${info.prepTimeDays}${info.deliveryPartner ? ` عبر ${info.deliveryPartner}` : ""} — يشحن إلى ${info.shippingCoverage}.`
        : null,
    },
    {
      Icon: CreditCard,
      title: "وسائل الدفع",
      body: info?.paymentMethods?.length ? info.paymentMethods.join(" · ") : null,
    },
  ].filter((c) => c.body);

  if (cards.length === 0) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: t.spacing["3"], marginTop: t.spacing["4"] }}>
      {cards.map((c) => (
        <div key={c.title} style={{ background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, padding: t.spacing["3"] }}>
          <p style={{ display: "flex", alignItems: "center", gap: 6, margin: `0 0 6px`, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
            <c.Icon size={15} strokeWidth={1.8} />
            {c.title}
          </p>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, lineHeight: t.typography.lineHeight.snug }}>{c.body}</p>
        </div>
      ))}
    </div>
  );
}
