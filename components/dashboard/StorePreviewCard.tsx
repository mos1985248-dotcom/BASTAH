// components/dashboard/StorePreviewCard.tsx
import { ExternalLink, Eye } from "lucide-react";
import { t } from "@/theme";

export default function StorePreviewCard({ store }: { store: { nameAr: string; shortDesc: string | null; logo: string | null; coverImage: string | null; whatsapp: string | null; slug: string } }) {
  return (
    <div
      style={{
        background: t.colors.white,
        borderRadius: t.radius.lg,
        border: `1px solid ${t.colors.cream.border}`,
        overflow: "hidden",
        direction: "rtl",
        boxShadow: t.shadows.sm,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${t.spacing["4"]} ${t.spacing["5"]} 0` }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
          <div style={{ width: 32, height: 32, borderRadius: t.radius.full, background: t.colors.primary[100], display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Eye size={17} strokeWidth={1.8} color={t.colors.primary[800]} />
          </div>
          معاينة واجهة المتجر
        </h3>
        <a
          href={`/store/${store.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="basita-btn-interactive"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: t.typography.fontSize.xs,
            color: t.colors.primary[800],
            background: t.colors.primary[50] || "#f4efe6",
            padding: "6px 12px",
            borderRadius: t.radius.full,
            fontWeight: t.typography.fontWeight.bold,
            textDecoration: "none",
          }}
        >
          فتح الصفحة
          <ExternalLink size={13} strokeWidth={1.8} />
        </a>
      </div>

      <div style={{ padding: t.spacing["5"] }}>
        <div
          style={{
            height: 100,
            borderRadius: t.radius.md,
            background: store.coverImage ? `url(${store.coverImage}) center/cover` : `linear-gradient(135deg, ${t.colors.primary[700]}, ${t.colors.primary[900]})`,
            position: "relative",
            boxShadow: t.shadows.sm,
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: -22,
              right: 18,
              width: 52,
              height: 52,
              borderRadius: t.radius.full,
              background: store.logo ? `url(${store.logo}) center/cover` : t.colors.gold[100],
              border: `3px solid ${t.colors.white}`,
              boxShadow: t.shadows.sm,
            }}
          />
        </div>
        <div style={{ marginTop: 32 }}>
          <p style={{ margin: "0 0 4px", fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
            {store.nameAr}
          </p>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, fontWeight: t.typography.fontWeight.medium, lineHeight: t.typography.lineHeight.relaxed }}>
            {store.shortDesc ?? "لا يوجد وصف مختصر بعد"}
          </p>
        </div>
      </div>
    </div>
  );
}