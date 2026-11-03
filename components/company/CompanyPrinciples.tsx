// components/company/CompanyPrinciples.tsx — الرؤية والرسالة، ثم القيم.
import { Eye, Target, Heart, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { PRINCIPLES } from "./company-content";
import s from "../story/story.module.css";
import c from "./company.module.css";

const ICONS: Record<string, LucideIcon> = { vision: Eye, mission: Target, heart: Heart, shield: ShieldCheck, sparkles: Sparkles };

export default function CompanyPrinciples() {
  return (
    <section className={`${s.block} ${s.band}`}>
      <div className={s.wrap}>
        <div className={c.head}>
          <p className={s.eyebrow}>{PRINCIPLES.eyebrow}</p>
          <h2 className={`${s.h2} ${s.display}`}>{PRINCIPLES.title}</h2>
          <p className={c.headLead}>{PRINCIPLES.lead}</p>
        </div>

        <div className={c.duo}>
          {PRINCIPLES.duo.map(({ icon, label, title, description }) => {
            const Icon = ICONS[icon];
            return (
              <article key={label} className={c.big}>
                <span className={c.bigIcon}>
                  <Icon size={25} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div>
                  <p className={c.bigLabel}>{label}</p>
                  <h3 className={c.bigTitle}>{title}</h3>
                  <p className={c.bigDesc}>{description}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className={c.gap} />

        <div className={c.head}>
          <p className={s.eyebrow}>{PRINCIPLES.valuesEyebrow}</p>
          <h2 className={`${s.h2} ${s.display}`}>{PRINCIPLES.valuesTitle}</h2>
          <p className={c.headLead}>{PRINCIPLES.valuesLead}</p>
        </div>

        <div className={c.values}>
          {PRINCIPLES.values.map(({ number, icon, title, description }) => {
            const Icon = ICONS[icon];
            return (
              <article key={number} className={c.value}>
                <div className={c.valueTop}>
                  <span className={c.number}>{number}</span>
                  <span className={c.itemIcon}>
                    <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </div>
                <h3 className={c.itemTitle}>{title}</h3>
                <p className={c.itemDesc}>{description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
