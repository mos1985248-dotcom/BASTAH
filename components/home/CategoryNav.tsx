// components/home/CategoryNav.tsx
import { t } from "@/theme";
import {
  MoreHorizontal,
  Palmtree,
  Droplet,
  FlaskConical,
  Shirt,
  Home,
  Leaf,
  ChefHat,
  type LucideIcon,
} from "lucide-react";

const CATEGORIES: {
  slug: string;
  label: string;
  Icon: LucideIcon;
  href?: string;
}[] = [
  { slug: "dates", label: "تمور", Icon: Palmtree },
  { slug: "honey", label: "عسل ومنتجات النحل", Icon: Droplet },
  { slug: "oud-perfumes", label: "عطور وبخور", Icon: FlaskConical },
  { slug: "abayas-accessories", label: "أزياء وإكسسوارات", Icon: Shirt },
  { slug: "home-decor", label: "أزياء وديكور منزلي", Icon: Home },
  { slug: "natural-products", label: "منتجات طبيعية", Icon: Leaf },
  { slug: "kitchen", label: "مطبخ وأدوات منزلية", Icon: ChefHat },
  { slug: "", label: "المزيد", Icon: MoreHorizontal, href: "/marketplace" },
];

export default function CategoryNav() {
  return (
    <section
      style={{
        maxWidth: t.layout.containerMaxWidth,
        margin: "0 auto",
        padding: `${t.spacing["10"]} ${t.spacing["4"]} 0`,
        direction: "rtl",
      }}
    >
      {/* عنوان القسم */}
      <div
        style={{
          textAlign: "center",
          marginBottom: t.spacing["6"],
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: t.spacing["2"],
            marginBottom: t.spacing["2"],
          }}
        >
          <span
            style={{
              width: 28,
              height: 1,
              background: t.colors.gold[400],
            }}
          />

          <span
            style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.gold[700],
              fontWeight: t.typography.fontWeight.semibold,
            }}
          >
            من سوق بسطة
          </span>

          <span
            style={{
              width: 28,
              height: 1,
              background: t.colors.gold[400],
            }}
          />
        </div>

        <h2
          style={{
            fontFamily: t.typography.fontFamily.heading,
            fontSize:
              t.typography.fontSize["2xl"] ?? t.typography.fontSize.xl,
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.text.dark,
            margin: 0,
          }}
        >
          تسوّق حسب الفئة
        </h2>
      </div>

      {/* الفئات */}
      <div
        className="basita-category-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
          gap: t.spacing["3"],
          direction: "rtl",
        }}
      >
        {CATEGORIES.map((c) => (
          <a
            key={c.label}
            href={c.href ?? `/marketplace?category=${c.slug}`}
            className="basita-category-card"
            style={{
              textDecoration: "none",
              color: "inherit",
              minWidth: 0,
            }}
          >
            <div
              className="basita-category-card-inner"
              style={{
                height: 128,
                padding: t.spacing["3"],
                borderRadius: 18,
                background: "#F8F3E8",
                border: "1px solid rgba(109, 88, 59, 0.12)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: t.spacing["2"],
                boxSizing: "border-box",
                transition:
                  `transform ${t.motion.base} ${t.motion.ease}, ` +
                  `box-shadow ${t.motion.base} ${t.motion.ease}, ` +
                  `border-color ${t.motion.base} ${t.motion.ease}, ` +
                  `background ${t.motion.base} ${t.motion.ease}`,
              }}
            >
              <div
                className="basita-category-icon"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "#FFFDF7",
                  border: "1px solid rgba(109, 88, 59, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: `transform ${t.motion.base} ${t.motion.ease}`,
                }}
              >
                <c.Icon
                  size={24}
                  strokeWidth={1.7}
                  color={t.colors.gold[700]}
                />
              </div>

              <span
                style={{
                  display: "block",
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.semibold,
                  color: t.colors.text.dark,
                  lineHeight: 1.5,
                  textAlign: "center",
                }}
              >
                {c.label}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}