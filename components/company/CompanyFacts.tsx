// components/company/CompanyFacts.tsx
// بطاقة «بيانات الشركة»: تقرأ من lib/company-info.ts وتعرض الحقول المعبّأة فقط.
// لا تعرض شيئاً (ولا ادعاء تسجيل) إن لم توجد بيانات. شارة التسجيل تظهر فقط مع رقم سجل تجاري.
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { COMPANY_INFO } from "@/lib/company-info";
import s from "../story/story.module.css";
import c from "./company.module.css";

interface Row { label: string; value: string; href?: string }

export default function CompanyFacts() {
  const i = COMPANY_INFO;

  const rows: Row[] = [
    { label: "الاسم النظامي", value: i.legalName },
    { label: "الشكل النظامي", value: i.legalForm },
    {
      label: "رقم السجل التجاري",
      value: i.commercialRegister ? (i.commercialRegisterCity ? `${i.commercialRegister} — ${i.commercialRegisterCity}` : i.commercialRegister) : null,
    },
    { label: "الرقم الضريبي", value: i.vatNumber },
    { label: "سنة التأسيس", value: i.foundedYear },
    { label: "المقر الرئيسي", value: i.headquarters },
    { label: "البريد الإلكتروني", value: i.email, href: i.email ? `mailto:${i.email}` : undefined },
    { label: "الهاتف", value: i.phone, href: i.phone ? `tel:${i.phone.replace(/\s/g, "")}` : undefined },
  ].filter((r): r is Row => Boolean(r.value));

  if (rows.length === 0) return null;

  return (
    <section className={c.facts} aria-labelledby="company-facts-title">
      <div className={s.wrap}>
        <div className={c.factsCard}>
          <div className={c.factsHead}>
            <span className={c.factsIcon}>
              <BadgeCheck size={24} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <h2 id="company-facts-title" className={c.factsTitle}>بيانات الشركة</h2>
            {i.commercialRegister && (
              <span className={c.status}>
                <ShieldCheck size={15} strokeWidth={2} aria-hidden="true" />
                منشأة مسجلة بسجل تجاري
              </span>
            )}
          </div>

          <dl className={c.factsGrid}>
            {rows.map((r) => (
              <div key={r.label} className={c.fact}>
                <dt className={c.factLabel}>{r.label}</dt>
                <dd className={c.factValue}>{r.href ? <a href={r.href}>{r.value}</a> : r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
