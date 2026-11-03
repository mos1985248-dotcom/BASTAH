// components/story/StoryBlock.tsx — كتلة «صورة + نص» تتبادل جهة الصورة، وتُرتَّب صورةً أولاً على الجوال.
import Image from "next/image";
import type { StoryBlockData } from "./story-content";
import s from "./story.module.css";

export default function StoryBlock({ block, index }: { block: StoryBlockData; index: number }) {
  const reverse = index % 2 === 1;

  return (
    <section id={block.id} className={`${s.block} ${reverse ? s.band : ""}`}>
      <div className={s.wrap}>
        <div className={`${s.grid} ${reverse ? s.rev : ""}`}>
          <div className={s.media}>
            <Image src={block.img.src} alt={block.img.alt} fill sizes="(max-width: 900px) 100vw, 48vw" className={s.img} />
          </div>

          <div>
            {block.eyebrow && <p className={s.eyebrow}>{block.eyebrow}</p>}
            <h2 className={`${s.h2} ${s.display}`}>{block.title}</h2>
            <div className={s.text}>
              {block.paras.map((p) => (
                <p key={p.t} className={p.tone && p.tone !== "p" ? s[p.tone] : undefined}>
                  {p.t}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
