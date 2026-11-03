// components/story/StoryHero.tsx
import Image from "next/image";
import PillarIcon, { type Pillar } from "./PillarIcon";
import { HERO } from "./story-content";
import s from "./story.module.css";

export default function StoryHero() {
  return (
    <section className={s.hero}>
      <div className={s.wrap}>
        <div className={s.heroGrid}>
          <div>
            <span className={s.kicker}>{HERO.kicker}</span>
            <h1 className={`${s.h1} ${s.display}`}>
              {HERO.titleLines[0]}
              <br />
              {HERO.titleLines[1]}
            </h1>
            <p className={s.lead}>{HERO.lead}</p>
          </div>

          <div className={s.heroImg}>
            <Image src={HERO.img.src} alt={HERO.img.alt} fill priority sizes="(max-width: 900px) 100vw, 50vw" className={s.img} />
          </div>
        </div>

        <div className={s.pillars}>
          {HERO.pillars.map(({ pillar, label }) => (
            <div key={pillar} className={s.pillar}>
              <span className={s.pillarIcon}>
                <PillarIcon pillar={pillar as Pillar} />
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
