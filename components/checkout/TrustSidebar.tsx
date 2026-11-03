// components/checkout/TrustSidebar.tsx
// ملاحظة صياغة: أُزيلت عبارتان غير دقيقتين كانتا هنا («تشفير AES 256-bit لكل معاملة»
// و«لا نشارك بياناتك مع أي طرف»)؛ الدفع يتم عبر صفحة Moyasar المُستضافة ولا تمر بيانات
// البطاقة بالمنصة، والبيانات تُشارَك مع المتجر وشركة الشحن لإتمام الطلب. تُراجَع قانونياً (PDPL).
import { Lock, MessageCircle, RotateCcw, ShieldCheck, type LucideIcon } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import s from "./summary.module.css";

const TRUST_ITEMS: { Icon: LucideIcon; title: string; body: string }[] = [
  { Icon: Lock, title: "دفع آمن", body: "تتم عملية الدفع عبر بوابة دفع مرخّصة، ولا تمر بيانات بطاقتك بمنصة بسطة" },
  { Icon: ShieldCheck, title: "خصوصية بياناتك", body: "نشارك بيانات طلبك مع المتجر وشركة الشحن فقط لإتمام الطلب" },
  { Icon: RotateCcw, title: "الاسترجاع", body: "استرجاع سهل حسب سياسة كل متجر" },
];

const PAYMENT_BADGES = ["VISA", "Mastercard", "مدى", "STC Pay", "Apple Pay"];

export default function TrustSidebar({ whatsapp }: { whatsapp?: string | null }) {
  return (
    <aside className={s.trust} style={uiVars} aria-label="معلومات الأمان والدعم">
      <h2 className={s.trustTitle}>تسوّق بثقة وأمان</h2>
      <ul className={s.trustList}>
        {TRUST_ITEMS.map(({ Icon, title, body }) => (
          <li key={title} className={s.trustItem}>
            <span className={s.trustIcon}><Icon size={18} strokeWidth={1.7} aria-hidden="true" /></span>
            <span>
              <span className={s.trustName}>{title}</span>
              <span className={s.trustBody}>{body}</span>
            </span>
          </li>
        ))}
      </ul>

      {whatsapp && (
        <div className={s.help}>
          <p className={s.helpTitle}>تحتاج مساعدة؟</p>
          <p className={s.helpText}>تواصل مع المتجر مباشرة</p>
          <a
            href={`https://wa.me/${whatsapp.replace("+", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="التواصل مع المتجر عبر واتساب"
            className={s.wa}
          >
            <MessageCircle size={17} strokeWidth={1.8} aria-hidden="true" />
            واتساب
          </a>
        </div>
      )}

      <ul className={s.badges} aria-label="وسائل الدفع">
        {PAYMENT_BADGES.map((b) => (
          <li key={b} className={s.badge}>{b}</li>
        ))}
      </ul>
    </aside>
  );
}
