// components/company/CompanyIntro.tsx
import Image from "next/image";
import { INTRO } from "./company-content";
import s from "../story/story.module.css";
import c from "./company.module.css";

export default function CompanyIntro() {
  return (
    <section className={`${s.block} ${s.band}`}>
      <div className={s.wrap}>
        <div className={s.grid}>
          <div className={s.media}>
            <Image src={INTRO.img.src} alt={INTRO.img.alt} fill sizes="(max-width: 900px) 100vw, 48vw" className={s.img} />
          </div>

          <div>
            <p className={s.eyebrow}>{INTRO.eyebrow}</p>
            <h2 className={`${s.h2} ${s.display}`}>{INTRO.title}</h2>
            <p className={c.desc}>{INTRO.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
