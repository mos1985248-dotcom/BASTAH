// app/not-found.tsx — صفحة 404 بهوية المنصة (بدل صفحة Next الخام)
import SiteShell from "@/components/layout/SiteShell";
import { t } from "@/theme";

export default function NotFound() {
  return (
    <SiteShell>
      <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: `${t.spacing["16"]} ${t.spacing["4"]}` }}>
        <p style={{ margin: 0, fontSize: 56, fontWeight: t.typography.fontWeight.bold, color: t.colors.gold[600] }}>404</p>
        <h1 style={{ margin: `${t.spacing["2"]} 0`, fontSize: t.typography.fontSize.xl, color: t.colors.primary[800] }}>الصفحة غير موجودة</h1>
        <p style={{ margin: `0 0 ${t.spacing["5"]}`, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid }}>
          ربما تغيّر الرابط أو لم تعد الصفحة متاحة. تصفّحي الأسر المنتجة من الرئيسية.
        </p>
        <a href="/" style={{ display: "inline-block", padding: "12px 28px", background: t.colors.primary[800], color: t.colors.white, borderRadius: t.radius.full, textDecoration: "none", fontWeight: t.typography.fontWeight.bold }}>
          العودة للرئيسية
        </a>
      </div>
    </SiteShell>
  );
}
