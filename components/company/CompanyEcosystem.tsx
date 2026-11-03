// components/company/CompanyEcosystem.tsx — منظومة بسطة (أصحاب المشاريع، العملاء، المجتمع).
import Image from "next/image";
import { Store, ShoppingBag, Users, type LucideIcon } from "lucide-react";
import { ECOSYSTEM } from "./company-content";
import s from "../story/story.module.css";
import c from "./company.module.css";

const ICONS: Record<string, LucideIcon> = { store: Store, bag: ShoppingBag, users: Users };

export default function CompanyEcosystem() {
  return (
    <section className={s.block}>
      <div className={s.wrap}>
        <div className={`${s.grid} ${s.rev}`}>
          <div className={s.media}>
            <Image src={ECOSYSTEM.img.src} alt={ECOSYSTEM.img.alt} fill sizes="(max-width: 900px) 100vw, 45vw" className={s.img} />
          </div>

          <div>
            <p className={s.eyebrow}>{ECOSYSTEM.eyebrow}</p>
            <h2 className={`${s.h2} ${s.display}`}>{ECOSYSTEM.title}</h2>
            <p className={c.desc}>{ECOSYSTEM.lead}</p>

            <div className={c.eco}>
              {ECOSYSTEM.items.map(({ icon, number, title, description }) => {
                const Icon = ICONS[icon];
                return (
                  <article key={title} className={c.ecoRow}>
                    <span className={c.itemIcon}>
                      <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className={c.itemTitle}>{title}</h3>
                      <p className={c.itemDesc}>{description}</p>
                    </div>
                    <span className={c.ecoNum}>{number}</span>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
