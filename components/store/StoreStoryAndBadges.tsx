// components/store/StoreStoryAndBadges.tsx
import type { ReactNode } from "react";
import { Landmark, Lock, Truck, Zap, BadgeCheck, Sparkles, RotateCcw, Leaf } from "lucide-react";
import { t } from "@/theme";
import { StoreDetail } from "./types";

// شارات ثابتة تعكس قدرات المنصة الفعلية (Moyasar لكل المتاجر، شحن لكل المملكة) —
// وليست ميزة خاصة بمتجر معيّن، لذا لها أيقونة عامة ثابتة.
const PLATFORM_BADGES: { label: string; Icon: ReactNode }[] = [
  { label: "منتج سعودي", Icon: <Landmark size={20} strokeWidth={1.6} color={t.colors.primary[800]} /> },
  { label: "دفع آمن", Icon: <Lock size={20} strokeWidth={1.6} color={t.colors.primary[800]} /> },
  { label: "شحن لكل المملكة", Icon: <Truck size={20} strokeWidth={1.6} color={t.colors.primary[800]} /> },
  { label: "استجابة سريعة", Icon: <Zap size={20} strokeWidth={1.6} color={t.colors.primary[800]} /> },
];

export default function StoreStoryAndBadges({ store }: { store: StoreDetail }) {
  const storyImage = store.bannerImages?.[0] ?? null;
  const dynamicBadges: { label: string; Icon: ReactNode }[] = [
    ...(store.isVerified ? [{ label: "متجر موثّق", Icon: <BadgeCheck size={20} strokeWidth={1.6} color={t.colors.primary[800]} /> }] : []),
    ...(store.publicInfo?.storyTags ?? []).map((tag) => ({ label: tag, Icon: <Sparkles size={20} strokeWidth={1.6} color={t.colors.gold[600]} /> })),
  ];
  const returnDays = store.publicInfo?.returnPolicyDays;
  const badges: { label: string; Icon: ReactNode }[] = [
    ...dynamicBadges,
    ...PLATFORM_BADGES,
    ...(returnDays !== undefined ? [{ label: `إرجاع خلال ${returnDays} ${returnDays === 1 ? "يوم" : "أيام"}`, Icon: <RotateCcw size={20} strokeWidth={1.6} color={t.colors.primary[800]} /> }] : []),
  ];

  return (
    <section style={{ maxWidth: 1080, margin: "0 auto", padding: `${t.spacing["8"]} ${t.spacing["4"]} 0`, display: "grid", gridTemplateColumns: "1.1fr 1.4fr", gap: t.spacing["6"], direction: "rtl" }} className="basita-store-story-grid">
      {/* قصة الأسرة */}
      <div style={{ background: t.colors.white, borderRadius: t.radius.lg, border: `1px solid ${t.colors.cream.border}`, overflow: "hidden" }}>
        {storyImage ? (
          <div style={{ height: 160, background: `url(${storyImage}) center/cover` }} />
        ) : (
          <div
            style={{
              height: 160,
              background: `linear-gradient(135deg, ${t.colors.gold[200]}, ${t.colors.cream.warm})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Leaf size={38} strokeWidth={1.5} color={t.colors.gold[700]} />
          </div>
        )}
        <div style={{ padding: t.spacing["6"] }}>
          <h2 style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>قصة الأسرة</h2>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.body, lineHeight: t.typography.lineHeight.relaxed }}>
            {store.publicInfo?.storyAr || store.description || "لسه ما أضافت هذه الأسرة قصتها — تابعونا قريباً."}
          </p>
        </div>
      </div>

      {/* لماذا يثق العملاء بنا */}
      <div style={{ background: t.colors.cream?.warm || "#fdfbf7", borderRadius: t.radius.lg, padding: t.spacing["6"], border: `1px solid ${t.colors.cream.border}` }}>
        <h3 style={{ margin: `0 0 ${t.spacing["4"]}`, fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>لماذا يثق العملاء بنا؟</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: t.spacing["3"] }}>
          {badges.map((b) => (
            <div
              key={b.label}
              style={{
                background: t.colors.white,
                border: `1px solid ${t.colors.cream.border}`,
                borderRadius: t.radius.md,
                padding: `${t.spacing["4"]} ${t.spacing["2"]}`,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>{b.Icon}</div>
              <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.body, fontWeight: t.typography.fontWeight.medium, lineHeight: t.typography.lineHeight.snug }}>
                {b.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .basita-store-story-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}