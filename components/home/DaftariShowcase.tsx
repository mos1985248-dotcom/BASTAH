// components/home/DaftariShowcase.tsx
// ✅ يروّج لميزة حقيقية موجودة بالباك اند (موديل DaftariEntry: قيود بيع،
// مصروفات، أرباح) — لم تكن معروضة بأي صفحة قبل الآن رغم وجودها بالـ schema.
import { t } from "@/theme";
import { Wallet, Receipt, TrendingUp, ClipboardList, type LucideIcon } from "lucide-react";

const FEATURES: { Icon: LucideIcon; label: string }[] = [
  { Icon: Wallet, label: "تسجيل المدفوعات" },
  { Icon: Receipt, label: "تسجيل المصروفات" },
  { Icon: TrendingUp, label: "حساب الأرباح" },
  { Icon: ClipboardList, label: "تقارير سهلة وواضحة" },
];

export default function DaftariShowcase() {
  return (
    <section aria-labelledby="daftari-heading" style={{ maxWidth: 1200, margin: "0 auto", padding: `${t.spacing["10"]} ${t.spacing["4"]} 0` }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: t.spacing["6"],
          background: t.colors.cream.warm,
          borderRadius: t.radius.xl,
          padding: t.spacing["6"],
          alignItems: "center",
        }}
        className="basita-daftari-grid"
      >
        {/* قسم مميزات دفاتري */}
        <div>
          <h2 id="daftari-heading" style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
            دفاتري — محاسبة بسيطة لمتجرك
          </h2>
          <p style={{ margin: `0 0 ${t.spacing["5"]}`, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid, lineHeight: t.typography.lineHeight.relaxed }}>
            تتبّعي مبيعاتك ومصروفاتك وأرباحك بدون تعقيد محاسبي
          </p>
          
          <div style={{ display: "flex", gap: t.spacing["4"], flexWrap: "wrap" }}>
            {FEATURES.map((f) => (
              <div 
                key={f.label} 
                style={{ 
                  textAlign: "center", 
                  flex: "1 1 90px", 
                  background: t.colors.white, 
                  padding: `${t.spacing["3"]} ${t.spacing["2"]}`, 
                  borderRadius: t.radius.md, 
                  border: `1px solid ${t.colors.cream.border}`,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                  <f.Icon size={24} strokeWidth={1.7} color={t.colors.primary[800]} aria-hidden="true" />
                </div>
                <div style={{ fontSize: t.typography.fontSize.xs, color: t.colors.text.body, fontWeight: t.typography.fontWeight.medium }}>
                  {f.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* قسم بدون عمولات الترويجي */}
        <div
          style={{
            background: `linear-gradient(135deg, ${t.colors.primary[900]}, ${t.colors.primary[800]})`,
            borderRadius: t.radius.lg,
            padding: t.spacing["6"],
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            height: "100%",
          }}
        >
          <p style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.onDark }}>
            بدون عمولات
          </p>
          <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, color: t.colors.text.onDarkMuted, lineHeight: t.typography.lineHeight.relaxed }}>
            جميع متاجر بسطة مرتبطة بحساباتها مباشرة — لا تُوجد أي عمولة على المبيعات، فقط رسوم اشتراك ثابتة شهرياً
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .basita-daftari-grid { grid-template-columns: 1fr !important; gap: ${t.spacing["4"]} !important; }
        }
      `}</style>
    </section>
  );
}
