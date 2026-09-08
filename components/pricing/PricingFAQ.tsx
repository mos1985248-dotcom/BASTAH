// components/pricing/PricingFAQ.tsx
import { t } from "@/theme";

const FAQS = [
  { q: "ليش بسطة ما تاخذ عمولة على مبيعاتي؟", a: "نؤمن أن إيرادك من تعبك يرجع لك بالكامل — لهذا موديل بسطة اشتراك شهري ثابت فقط، بدون أي نسبة من مبيعاتك." },
  { q: "هل أقدر أغيّر باقتي بأي وقت؟", a: "نعم، تقدرين ترقّي أو تنزّلي باقتك من لوحة تحكم متجرك مباشرة، وتُطبَّق التغييرات على دورة الفوترة القادمة." },
  { q: "شنو رسوم الشحن؟", a: "رسوم شحن ثابتة 3 ريال على كل طلب، توزّع حسب اتفاقك مع شركة الشحن — بدون أي رسوم إضافية من بسطة." },
  { q: "متى أقدر أستخدم منيرة، المساعدة الذكية؟", a: "منيرة متاحة تلقائياً لباقتي نماء وبرو، وتساعدك في الرد على استفسارات العملاء وإدارة متجرك بذكاء." },
];

export default function PricingFAQ() {
  return (
    <section id="faq" style={{ maxWidth: 760, margin: "0 auto", padding: `${t.spacing["12"]} ${t.spacing["4"]}`, direction: "rtl", textAlign: "right" }}>
      <h2
        style={{
          textAlign: "center",
          fontSize: t.typography.fontSize.xl,
          fontWeight: t.typography.fontWeight.bold,
          color: t.colors.text.dark,
          margin: `0 0 ${t.spacing["6"]}`,
        }}
      >
        أسئلة شائعة
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
        {FAQS.map((f) => (
          <div key={f.q} style={{ background: t.colors.white, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.md, padding: t.spacing["4"], boxShadow: t.shadows.xs }}>
            <p style={{ margin: `0 0 ${t.spacing["1"]}`, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800], fontSize: t.typography.fontSize.base }}>
              {f.q}
            </p>
            <p style={{ margin: 0, color: t.colors.text.mid, fontSize: t.typography.fontSize.sm, lineHeight: t.typography.lineHeight.relaxed, fontWeight: t.typography.fontWeight.medium }}>
              {f.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}