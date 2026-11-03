// components/home/WhyVisual.tsx
import Image from "next/image";
import { t } from "@/theme";
import { homeImages } from "./homeImages";
import s from "./why.module.css";

export default function WhyVisual() {
  const { src, alt } = homeImages.why;
  return (
    <div className={s.visual}>
      {src ? (
        <Image src={src} alt={alt} fill sizes="(max-width: 899px) 100vw, 40vw" className={s.image} />
      ) : (
        <span className={s.mark} aria-hidden="true" style={{ fontFamily: t.typography.fontFamily.display }}>
          ب
        </span>
      )}
    </div>
  );
}
