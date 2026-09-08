// components/account/HelpCard.tsx
import { t } from "@/theme";

export default function HelpCard() {
  return (
    <div style={{ background: t.colors.cream.warm, borderRadius: t.radius.lg, padding: t.spacing["4"], textAlign: "center" }}>
      <p style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>
        تحتاج مساعدة؟
      </p>
      <p style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>
        نحن هنا لخدمتك
      </p>
      <a
        href="/dashboard/support"
        style={{ display: "inline-block", padding: "8px 16px", background: t.colors.primary[800], color: t.colors.white, borderRadius: t.radius.full, fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, textDecoration: "none" }}
      >
        تواصل مع الدعم
      </a>
    </div>
  );
}
