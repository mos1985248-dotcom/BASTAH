// components/home/TrustedStoresCTACard.tsx
import { t } from "@/theme";

export default function TrustedStoresCTACard() {
  return (
    <div
      className="basita-card-interactive"
      style={{
        flex: "0 0 220px",
        background: t.colors.cream.warm,
        borderRadius: t.radius.lg,
        padding: t.spacing["5"],
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        textAlign: "center",
        border: `1px solid ${t.colors.cream.border}`,
      }}
    >
      <h3 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
        اكتشف متاجر تستحق الثقة
      </h3>
      <p style={{ margin: `0 0 ${t.spacing["4"]}`, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid, lineHeight: t.typography.lineHeight.relaxed }}>
        جودة، أصالة، وتاريخ من شغف الأسر السعودية
      </p>
      <a
        href="/marketplace"
        className="basita-btn-interactive"
        style={{ padding: "10px 16px", background: t.colors.primary[800], color: t.colors.text.onDark, borderRadius: t.radius.md, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, textDecoration: "none", display: "inline-block" }}
      >
        تصفّح جميع المتاجر
      </a>
    </div>
  );
}