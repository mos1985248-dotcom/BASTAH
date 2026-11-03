// components/home/DaftariShowcase.tsx
import { ArrowLeft, ClipboardList, Receipt, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import s from "./daftari.module.css";

const ENTRIES: { Icon: LucideIcon; label: string }[] = [
  { Icon: Wallet, label: "تسجيل المدفوعات" },
  { Icon: Receipt, label: "تسجيل المصروفات" },
  { Icon: TrendingUp, label: "حساب الأرباح" },
  { Icon: ClipboardList, label: "تقارير سهلة وواضحة" },
];

export default function DaftariShowcase() {
  return (
    <section
      aria-labelledby="daftari-heading"
      className={s.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
    >
      <div className={s.grid}>
        <div className={s.copy}>
          <p className={s.kicker}>أدوات تساعدك في إدارة متجرك</p>
          <h2 id="daftari-heading" className={s.title} style={{ fontFamily: t.typography.fontFamily.display }}>
            دفاتري
          </h2>
          <p className={s.sub}>محاسبة بسيطة لمتجرك</p>
          <p className={s.lead}>
            متابعة مبيعاتك ومصروفاتك وأرباحك بلا تعقيد محاسبي، لتبقى أرقام
            متجرك واضحة أمامك في كل وقت.
          </p>
        </div>

        {/* صفحة دفتر: المزايا نفسها هي أسطر الدفتر، بلا أرقام مختلقة */}
        <div className={s.ledger} role="list" aria-label="ما يتيحه دفاتري">
          <div className={s.binding} aria-hidden="true" />
          <p className={s.ledgerTitle} style={{ fontFamily: t.typography.fontFamily.display }} aria-hidden="true">
            دفتر المتجر
          </p>
          {ENTRIES.map(({ Icon, label }) => (
            <div key={label} role="listitem" className={s.entry}>
              <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
              <span className={s.entryLabel}>{label}</span>
              <span className={s.leader} aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>

      <div className={s.band}>
        <div>
          <h3 className={s.bandTitle} style={{ fontFamily: t.typography.fontFamily.display }}>
            بدون عمولات
          </h3>
          <p className={s.bandText}>
            جميع متاجر بسطة مرتبطة بحساباتها مباشرة — لا توجد أي عمولة على
            المبيعات، فقط رسوم اشتراك ثابتة شهريًا.
          </p>
        </div>
        <a href="/pricing" className={s.bandCta}>
          تعرّف على الباقات
          <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
