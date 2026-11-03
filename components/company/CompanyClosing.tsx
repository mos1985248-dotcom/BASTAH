// components/company/CompanyClosing.tsx
import Image from "next/image";
import { CLOSING } from "./company-content";
import s from "../story/story.module.css";
import c from "./company.module.css";

export default function CompanyClosing() {
  return (
    <section className={`${s.block} ${s.band}`}>
      <div className={s.wrap}>
        <div className={s.closeImg}>
          <Image src={CLOSING.img.src} alt={CLOSING.img.alt} fill sizes="(max-width: 1180px) 100vw, 1180px" className={s.img} />
        </div>

        <div className={c.cta}>
          <p className={c.ctaKicker}>{CLOSING.eyebrow}</p>
          <h2 className={`${c.ctaTitle} ${s.display}`}>{CLOSING.title}</h2>
          <p className={c.ctaLead}>{CLOSING.lead}</p>
          <div className={s.actions}>
            <a href={CLOSING.shop.href} className={`${s.btn} ${s.btnGold}`}>{CLOSING.shop.label}</a>
            <a href={CLOSING.start.href} className={`${s.btn} ${s.btnLine}`}>{CLOSING.start.label}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
