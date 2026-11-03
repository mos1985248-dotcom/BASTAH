// components/home/CategoryNav.tsx
import Image from "next/image";
import {
  ArrowLeft,
  ChefHat,
  Droplet,
  FlaskConical,
  Home,
  Leaf,
  MoreHorizontal,
  Palmtree,
  Shirt,
  type LucideIcon,
} from "lucide-react";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import { CATEGORY_LABELS } from "./categories-data";
import { homeImages } from "./homeImages";
import s from "./categories.module.css";

const CATEGORIES: { slug: string; label: string; Icon: LucideIcon; href?: string }[] = [
  { slug: "dates", label: CATEGORY_LABELS["dates"], Icon: Palmtree },
  { slug: "honey", label: CATEGORY_LABELS["honey"], Icon: Droplet },
  { slug: "oud-perfumes", label: CATEGORY_LABELS["oud-perfumes"], Icon: FlaskConical },
  { slug: "abayas-accessories", label: CATEGORY_LABELS["abayas-accessories"], Icon: Shirt },
  { slug: "home-decor", label: CATEGORY_LABELS["home-decor"], Icon: Home },
  { slug: "natural-products", label: CATEGORY_LABELS["natural-products"], Icon: Leaf },
  { slug: "kitchen", label: CATEGORY_LABELS["kitchen"], Icon: ChefHat },
  { slug: "", label: "المزيد", Icon: MoreHorizontal, href: "/marketplace" },
];

export default function CategoryNav() {
  return (
    <section
      aria-labelledby="categories-heading"
      className={s.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
    >
      <p className={s.kicker}>من سوق بسطة</p>
      <h2 id="categories-heading" className={s.title} style={{ fontFamily: t.typography.fontFamily.display }}>
        تسوّق حسب الفئة
      </h2>

      <div className={s.grid}>
        {CATEGORIES.map(({ slug, label, Icon, href }) => {
          const photo = homeImages.categories[slug];
          return (
            <a key={label} href={href ?? `/marketplace?category=${slug}`} className={s.tile}>
              <span className={s.media}>
                {photo ? (
                  <Image
                    src={photo}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 50vw, (max-width: 900px) 33vw, 25vw"
                    className={s.photo}
                  />
                ) : (
                  <Icon size={36} strokeWidth={1.4} className={s.icon} aria-hidden="true" />
                )}
              </span>
              <span className={s.row}>
                <span className={s.label}>{label}</span>
                <ArrowLeft size={18} strokeWidth={1.9} className={s.arrow} aria-hidden="true" />
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
