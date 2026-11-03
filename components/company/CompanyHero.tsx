// components/company/CompanyHero.tsx
import Image from "next/image";
import { HERO } from "./company-content";
import s from "../story/story.module.css";
import c from "./company.module.css";

export default function CompanyHero() {
  return (
    <section className={s.hero}>
      <div className={s.wrap}>
        <div className={s.heroGrid}>
          <div>
            <span className={s.kicker}>{HERO.kicker}</span>
            <h1 className={`${s.h1} ${s.display}`}>
              {HERO.title}
              <span className={c.accent}>{HERO.accent}</span>
            </h1>
            <p className={s.lead}>{HERO.lead}</p>
            <div className={c.chips}>
              {HERO.chips.map((chip) => (
                <span key={chip} className={c.chip}>{chip}</span>
              ))}
            </div>
          </div>

          <div className={s.heroImg}>
            <Image src={HERO.img.src} alt={HERO.img.alt} fill priority sizes="(max-width: 900px) 100vw, 50vw" className={s.img} />
            <span className={c.badge}>
              <span className={c.dot} aria-hidden="true" />
              {HERO.imgBadge}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
