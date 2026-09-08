// components/store/StoreClosingBanner.tsx
import { Heart, ShoppingBag } from "lucide-react";
import { t } from "@/theme";
import { StoreDetail } from "./types";

export default function StoreClosingBanner({ store }: { store: StoreDetail }) {
  return (
    <section style={{ maxWidth: 1080, margin: "0 auto", padding: `${t.spacing["10"]} ${t.spacing["4"]} ${t.spacing["12"]}` }}>
      {store.bannerImages?.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(store.bannerImages.length, 5)}, 1fr)`, gap: t.spacing["2"], marginBottom: t.spacing["6"], direction: "rtl" }}>
          {store.bannerImages.slice(0, 5).map((src) => (
            <div key={src} style={{ height: 100, borderRadius: t.radius.md, background: `url(${src}) center/cover` }} />
          ))}
        </div>
      )}

      <div
        style={{
          background: `linear-gradient(135deg, ${t.colors.primary[950]}, ${t.colors.primary[900]})`,
          borderRadius: t.radius.xl,
          padding: t.spacing["8"],
          textAlign: "center",
          direction: "rtl",
          boxShadow: t.shadows.md,
        }}
      >
        <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: 0, color: t.colors.text.onDark, fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold }}>
          شكراً لدعمك للأسر المنتجة السعودية
          <Heart size={20} strokeWidth={1.8} fill={t.colors.gold[400]} color={t.colors.gold[400]} />
        </p>
        <p style={{ margin: `${t.spacing["2"]} 0 ${t.spacing["6"]}`, color: t.colors.text.onDarkMuted, fontSize: t.typography.fontSize.base }}>
          كل عملية شراء منك تدعم أسرة سعودية وتصنع فرقاً حقيقياً في حياتهم
        </p>
        <a
          href="#products"
          className="basita-btn-interactive"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 32px",
            background: t.colors.gold[500],
            color: t.colors.primary[950],
            borderRadius: t.radius.full,
            textDecoration: "none",
            fontSize: t.typography.fontSize.base,
            fontWeight: t.typography.fontWeight.bold,
            boxShadow: t.shadows.sm,
          }}
        >
          <ShoppingBag size={18} strokeWidth={2} />
          تصفّح جميع المنتجات
        </a>
      </div>
    </section>
  );
}