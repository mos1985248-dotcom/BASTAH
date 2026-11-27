// components/home/DaftariShowcase.tsx
import { ArrowLeft, ClipboardList, Receipt, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import MerchantToolCopy from "./MerchantToolCopy";
import tools from "./merchant-tools.module.css";
import s from "./daftari.module.css";

const ENTRIES: { Icon: LucideIcon; label: string; mobile: string }[] = [
  { Icon: Wallet, label: "تسجيل المدفوعات", mobile: "وش دخل من المبيعات؟" },
  { Icon: Receipt, label: "تسجيل المصروفات", mobile: "وش راح على الخامات والتغليف؟" },
  { Icon: TrendingUp, label: "حساب الأرباح", mobile: "كم بقي لك ربح صافي؟" },
  { Icon: ClipboardList, label: "تقارير سهلة وواضحة", mobile: "ملخّص بسطتك بنظرة" },
];

export default function DaftariShowcase() {
  return (
    <section
      aria-labelledby="daftari-heading"
      className={`${s.section} ${tools.section}`}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
    >
      <div className={s.grid}>
        <div className={s.copy}>
          <div className={s.heading}>
            <h2 id="daftari-heading" className={s.title} style={{ fontFamily: t.typography.fontFamily.display }}>
              دفاتري
            </h2>
            <p className={s.sub}><MerchantToolCopy desktop="محاسبة بسيطة لمتجرك" mobile="دفتر بسطتك، على راحتك" /></p>
          </div>
          <p className={s.lead}>
            <MerchantToolCopy
              desktop="متابعة مبيعاتك ومصروفاتك وأرباحك بلا تعقيد محاسبي، لتبقى أرقام متجرك واضحة أمامك في كل وقت."
              mobile="خلّ اللي دخل من البيع لحاله، واللي راح على الخامات والتغليف لحاله. كذا تعرف صافي ربحك وتشوف الملخّص براحة بال."
            />
          </p>
        </div>

        {/* صفحة دفتر: المزايا نفسها هي أسطر الدفتر، بلا أرقام مختلقة */}
        <div className={s.ledger}>
          <div className={s.binding} aria-hidden="true" />
          <p className={s.ledgerTitle} style={{ fontFamily: t.typography.fontFamily.display }} aria-hidden="true">
            دفتر المتجر
          </p>
          <div className={s.entries} role="list" aria-label="ما يتيحه دفاتري">
            {ENTRIES.map(({ Icon, label, mobile }) => (
              <div key={label} role="listitem" className={s.entry}>
                <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                <span className={s.entryLabel}><MerchantToolCopy desktop={label} mobile={mobile} /></span>
                <span className={s.leader} aria-hidden="true" />
            </div>
          ))}
          </div>
        </div>
      </div>

      <div className={s.band}>
        <div>
          <h3 className={s.bandTitle} style={{ fontFamily: t.typography.fontFamily.display }}>
            بدون عمولات
          </h3>
          <p className={s.bandText}>
            جميع متاجر بسطة مارت مرتبطة بحساباتها مباشرة — لا توجد أي عمولة على
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
