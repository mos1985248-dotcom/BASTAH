// components/home/CategoryNav.tsx
// ⚠️ الـ slugs هنا تخمين توضيحي حسب المحتوى الظاهر بالصور المرجعية.
// لازم تتأكد إنها تطابق قيم Category.slug الفعلية المزروعة بقاعدة البيانات
// قبل النشر، وإلا فلتر /marketplace?category=... ما راح يرجّع نتائج.
import { t } from "@/theme";
import { MoreHorizontal, Palmtree, Droplet, FlaskConical, Shirt, Home, Leaf, ChefHat, type LucideIcon } from "lucide-react";

const CATEGORIES: { slug: string; label: string; Icon: LucideIcon; href?: string }[] = [
  { slug: "", label: "المزيد", Icon: MoreHorizontal, href: "/marketplace" },
  { slug: "dates", label: "تمور", Icon: Palmtree },
  { slug: "honey", label: "عسل ومنتجات النحل", Icon: Droplet },
  { slug: "oud-perfumes", label: "عطور وبخور", Icon: FlaskConical },
  { slug: "abayas-accessories", label: "أزياء وإكسسوارات", Icon: Shirt },
  { slug: "home-decor", label: "أزياء وديكور منزلي", Icon: Home },
  { slug: "natural-products", label: "منتجات طبيعية", Icon: Leaf },
  { slug: "kitchen", label: "مطبخ وأدوات منزلية", Icon: ChefHat },
];

export default function CategoryNav() {
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: `${t.spacing["10"]} ${t.spacing["4"]} 0`, direction: "rtl" }}>
      <h2
        style={{
          fontSize: t.typography.fontSize.xl,
          fontWeight: t.typography.fontWeight.bold,
          color: t.colors.text.dark,
          margin: `0 0 ${t.spacing["4"]}`,
          textAlign: "center",
        }}
      >
        تسوّق حسب الفئة
      </h2>
      <div style={{ display: "flex", flexDirection: "row-reverse", gap: t.spacing["6"], overflowX: "auto", justifyContent: "center", flexWrap: "wrap", direction: "rtl" }}>
        {CATEGORIES.map((c) => (
          <a key={c.label} href={c.href ?? `/marketplace?category=${c.slug}`} className="basita-category-tile" style={{ textDecoration: "none", textAlign: "center", width: 96 }}>
            <div
              className="basita-category-icon"
              style={{
                width: 72,
                height: 72,
                borderRadius: t.radius.full,
                background: t.colors.gold[100],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                transition: `transform ${t.motion.base} ${t.motion.ease}, background ${t.motion.base} ${t.motion.ease}`,
              }}
            >
              <c.Icon size={28} strokeWidth={1.6} color={t.colors.gold[700]} />
            </div>
            <span style={{ display: "block", marginTop: t.spacing["2"], fontSize: t.typography.fontSize.sm, color: t.colors.text.body }}>
              {c.label}
            </span>
          </a>
        ))}
      </div>

      <style>{`
        .basita-category-tile:hover .basita-category-icon { transform: scale(1.08); background: ${t.colors.gold[200]}; }
      `}</style>
    </section>
  );
}