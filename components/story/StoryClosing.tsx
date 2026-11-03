// components/story/StoryClosing.tsx — «هذه هي بسطة» + بطاقة ختامية بزرّي التسوق وبدء المتجر.
import Image from "next/image";
import { CLOSING } from "./story-content";
import s from "./story.module.css";

export default function StoryClosing() {
  const { card } = CLOSING;

  return (
    <section className={s.block}>
      <div className={s.wrap}>
        <div className={s.closeImg}>
          <Image src={CLOSING.img.src} alt={CLOSING.img.alt} fill sizes="(max-width: 1180px) 100vw, 1180px" className={s.img} />
        </div>

        <div className={s.closeText}>
          <p className={s.eyebrow}>{CLOSING.eyebrow}</p>
          <h2 className={`${s.h2} ${s.display}`}>{CLOSING.title}</h2>
          <div className={s.text}>
            {CLOSING.paras.map((p) => (
              <p key={p.t} className={p.tone && p.tone !== "p" ? s[p.tone] : undefined}>
                {p.t}
              </p>
            ))}
          </div>
        </div>

        <div className={s.final2}>
          <p className={`${s.brand} ${s.display}`}>{card.brand}</p>
          <p className={s.sub}>{card.subtitle}</p>
          <p className={s.desc}>{card.description}</p>
          <div className={s.actions}>
            <a href={card.shop.href} className={`${s.btn} ${s.btnGold}`}>{card.shop.label}</a>
            <a href={card.start.href} className={`${s.btn} ${s.btnLine}`}>{card.start.label}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
