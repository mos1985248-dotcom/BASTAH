// components/story/StoryExperience.tsx — «المتجر ليس مجرد قائمة منتجات».
import Image from "next/image";
import { BookOpen, Film, Palette, History, type LucideIcon } from "lucide-react";
import { EXPERIENCE } from "./story-content";
import s from "./story.module.css";

const ICONS: Record<string, LucideIcon> = { story: BookOpen, media: Film, identity: Palette, memory: History };

export default function StoryExperience() {
  return (
    <section className={`${s.block} ${s.band}`}>
      <div className={s.wrap}>
        <div className={s.expTop}>
          <div className={s.media}>
            <Image src={EXPERIENCE.img.src} alt={EXPERIENCE.img.alt} fill sizes="(max-width: 900px) 100vw, 40vw" className={s.img} />
          </div>

          <div>
            <p className={s.eyebrow}>{EXPERIENCE.eyebrow}</p>
            <h2 className={`${s.h2} ${s.display}`}>{EXPERIENCE.title}</h2>
            <p className={s.expLead}>{EXPERIENCE.lead}</p>
          </div>
        </div>

        <div className={s.expGrid}>
          {EXPERIENCE.cards.map(({ icon, title, desc }) => {
            const Icon = ICONS[icon];
            return (
              <div key={title} className={s.expCard}>
                <span className={s.expIcon}>
                  <Icon size={24} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <h3 className={s.expTitle}>{title}</h3>
                <p className={s.expDesc}>{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
