// components/home/StoreCard.tsx
import { BadgeCheck, Star } from "lucide-react";
import { t } from "@/theme";

export interface HomeStore {
  id: string;
  nameAr: string;
  slug: string;
  logo: string | null;
  coverImage: string | null;
  shortDesc: string | null;
  city: string;
  isVerified: boolean;
  avgRating: number;
  totalReviews: number;
}

export default function StoreCard({ store }: { store: HomeStore }) {
  return (
    <a href={`/store/${store.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        className="basita-card-interactive"
        style={{
          background: t.colors.white,
          borderRadius: t.radius.lg,
          overflow: "hidden",
          border: `1px solid ${t.colors.cream.border}`,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* صورة الغلاف */}
        <div
          style={{
            height: 110,
            background: store.coverImage
              ? `url(${store.coverImage}) center/cover`
              : `linear-gradient(135deg, ${t.colors.primary[700]}, ${t.colors.primary[900]})`,
            width: "100%",
          }}
        />

        {/* محتوى البطاقة والشعار */}
        <div style={{ padding: t.spacing["4"], display: "flex", alignItems: "flex-start", gap: t.spacing["3"], flex: 1, position: "relative" }}>
          {/* شعار المتجر المتداخل مع الغلاف */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: t.radius.full,
              background: store.logo ? `url(${store.logo}) center/cover` : t.colors.gold[100],
              flexShrink: 0,
              marginTop: -32,
              border: `2px solid ${t.colors.white}`,
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          />

          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                margin: `0 0 ${t.spacing["1"]}`,
                fontSize: t.typography.fontSize.base,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.text.dark,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {store.nameAr} 
              {store.isVerified && <BadgeCheck size={14} strokeWidth={2} color={t.colors.primary[800]} />}
            </p>

            <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, display: "flex", alignItems: "center", gap: 5 }}>
              <span>{store.city}</span>
              {store.totalReviews > 0 && (
                <>
                  <span style={{ color: t.colors.cream.border }}>•</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: t.colors.text.dark, fontWeight: t.typography.fontWeight.medium }}>
                    <Star size={12} strokeWidth={2} color={t.colors.gold[600]} fill={t.colors.gold[600]} />
                    {store.avgRating.toFixed(1)}
                  </span>
                  <span style={{ color: t.colors.text.light }}>({store.totalReviews})</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </a>
  );
}