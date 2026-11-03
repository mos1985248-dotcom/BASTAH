// components/home/HeroVisual.tsx
import Image from "next/image";
import { homeImages } from "./homeImages";
import s from "./hero.module.css";

export default function HeroVisual() {
  const { src, alt } = homeImages.hero;
  return (
    <div className={s.visual}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(max-width: 767px) 100vw, 50vw"
          className={s.image}
        />
      ) : (
        <div className={s.placeholder} aria-hidden="true" />
      )}
      <span className={s.madeIn}>صنع في السعودية</span>
    </div>
  );
}
