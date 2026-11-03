// components/product/ProductPolicyCards.tsx
// كل قيمة من إعدادات المتجر الحقيقية، ولا بطاقة تُعرض بدون بيانات.
import { CreditCard, RotateCcw, Truck, type LucideIcon } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import type { ProductDetail } from "./types";
import s from "./extras.module.css";

export default function ProductPolicyCards({ product }: { product: ProductDetail }) {
  const info = product.store.publicInfo;
  if (!info) return null;

  const days = info.returnPolicyDays;
  const cards: { Icon: LucideIcon; title: string; text: string }[] = [];
  if (days !== undefined && days !== null) {
    cards.push({
      Icon: RotateCcw,
      title: "سياسة الإرجاع",
      text: `يمكنك إرجاع المنتج خلال ${days} ${days === 1 ? "يوم" : "أيام"} من الاستلام، بشرط أن يكون بحالته الأصلية.`,
    });
  }
  if (info.prepTimeDays || info.shippingCoverage) {
    cards.push({
      Icon: Truck,
      title: "الشحن والتوصيل",
      text: `تجهيز خلال ${info.prepTimeDays}${info.deliveryPartner ? ` عبر ${info.deliveryPartner}` : ""} — يشحن إلى ${info.shippingCoverage}.`,
    });
  }
  if (info.paymentMethods?.length) {
    cards.push({ Icon: CreditCard, title: "وسائل الدفع", text: info.paymentMethods.join(" · ") });
  }
  if (cards.length === 0) return null;

  return (
    <ul className={s.policies} style={uiVars} aria-label="سياسات المتجر">
      {cards.map(({ Icon, title, text }) => (
        <li key={title} className={s.policy}>
          <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
          <h3 className={s.policyTitle}>{title}</h3>
          <p className={s.policyText}>{text}</p>
        </li>
      ))}
    </ul>
  );
}
