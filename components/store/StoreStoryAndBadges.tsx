// components/store/StoreStoryAndBadges.tsx
// الشارات الثابتة تعكس قدرات المنصة الفعلية وليست ميزة خاصة بمتجر معيّن.
import { BadgeCheck, Clock, Leaf, ShieldCheck, Tag, Truck, type LucideIcon } from "lucide-react";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import sec from "./sections.module.css";
import type { StoreDetail } from "./types";
import s from "./about.module.css";

const PLATFORM_BADGES: { label: string; Icon: LucideIcon }[] = [
  { label: "منتج سعودي", Icon: Leaf },
  { label: "دفع آمن", Icon: ShieldCheck },
  { label: "شحن لكل المملكة", Icon: Truck },
  { label: "استجابة سريعة", Icon: Clock },
];

export default function StoreStoryAndBadges({ store }: { store: StoreDetail }) {
  const image = store.bannerImages?.[0] ?? null;
  const badges: { label: string; Icon: LucideIcon }[] = [
    ...(store.isVerified ? [{ label: "بسطة موثّقة", Icon: BadgeCheck }] : []),
    ...(store.publicInfo?.storyTags ?? []).map((label) => ({ label, Icon: Tag })),
    ...PLATFORM_BADGES,
  ];

  return (
    <section
      aria-label="حكاية أهل البسطة ومزاياها"
      className={sec.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
    >
      <div className={s.story}>
        <div className={s.storyCard}>
          {image && <div className={s.storyImage} role="img" aria-label={`صورة من ${store.nameAr}`} style={{ backgroundImage: `url(${image})` }} />}
          <div className={s.storyBody}>
            <h2 className={s.storyTitle} style={{ fontFamily: t.typography.fontFamily.display }}>حكاية أهل البسطة</h2>
            <p className={s.storyText}>
              {store.publicInfo?.storyAr || "أهل البسطة لم يرووا حكايتهم بعد."}
            </p>
          </div>
        </div>

        <div className={s.trust}>
          <h2 className={s.trustTitle} style={{ fontFamily: t.typography.fontFamily.display }}>تسوّق من بسطتنا بثقة</h2>
          <ul className={s.badges}>
            {badges.map(({ label, Icon }) => (
              <li key={label} className={s.badge}>
                <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
