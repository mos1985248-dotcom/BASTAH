// components/dashboard/StorePreviewCard.tsx
import { Eye } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import s from "./home.module.css";

interface StorePreview {
  nameAr: string;
  shortDesc: string | null;
  logo: string | null;
  coverImage: string | null;
  whatsapp: string | null;
  slug: string;
}

export default function StorePreviewCard({ store }: { store: StorePreview }) {
  return (
    <section className={s.card} style={uiVars} aria-labelledby="store-preview-title">
      <div className={s.cardHead}>
        <div>
          <h2 id="store-preview-title" className={s.cardTitle}>معاينة واجهة المتجر</h2>
          <p className={s.cardSub}>نظرة سريعة على شكل متجرك</p>
        </div>
        <a href={`/store/${store.slug}`} target="_blank" rel="noopener noreferrer" className={s.more}>
          <Eye size={15} strokeWidth={1.9} aria-hidden="true" />
          فتح المتجر
        </a>
      </div>
      <div className={s.pvCover} style={store.coverImage ? { backgroundImage: `url(${store.coverImage})` } : undefined} aria-hidden="true" />
      <div className={s.pvBody}>
        <span className={s.pvLogo} style={store.logo ? { backgroundImage: `url(${store.logo})` } : undefined} aria-hidden="true">
          {!store.logo && store.nameAr.trim().charAt(0)}
        </span>
        <p className={s.pvName}>{store.nameAr || "متجرك"}</p>
        <p className={s.pvDesc}>{store.shortDesc ?? "لا يوجد وصف مختصر بعد"}</p>
      </div>
    </section>
  );
}
