// components/checkout/TrustSidebar.tsx
// شارات منصّة ثابتة (نفس مبدأ PLATFORM_BADGES بصفحة المتجر) — قدرات
// حقيقية للمنصة (تشفير AES-256-GCM لمفاتيح الدفع فعلياً — lib/crypto.ts،
// وسياسة الإرجاع الفعلية تُعرض بملخص الطلب لو الحقل مضبوط) وليست أرقاماً
// مُلفَّقة لكل طلب.
import { Lock, ShieldCheck, RotateCcw, Star, MessageCircle, type LucideIcon } from "lucide-react";
import { t } from "@/theme";

const TRUST_ITEMS: { Icon: LucideIcon; title: string; body: string }[] = [
  { Icon: Lock, title: "تشفير البيانات", body: "تشفير AES 256-bit لكل معاملة" },
  { Icon: ShieldCheck, title: "حماية المعلومات", body: "لا نشارك بياناتك مع أي طرف" },
  { Icon: RotateCcw, title: "ضمان الاسترجاع", body: "استرجاع سهل حسب سياسة كل متجر" },
];

const PAYMENT_BADGES = ["VISA", "Mastercard", "مدى", "STC Pay", "Apple Pay"];

export default function TrustSidebar({ whatsapp }: { whatsapp?: string | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["4"] }}>
      <div style={{ background: t.colors.primary[900], borderRadius: t.radius.lg, padding: t.spacing["4"] }}>
        <p style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.bold, color: t.colors.gold[400], display: "flex", alignItems: "center", gap: 6 }}>
          <Star size={15} strokeWidth={1.8} fill={t.colors.gold[400]} />
          تسوّق بثقة وأمان
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
          {TRUST_ITEMS.map((it) => (
            <div key={it.title} style={{ display: "flex", gap: t.spacing["2"] }}>
              <it.Icon size={17} strokeWidth={1.7} color={t.colors.gold[400]} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ margin: 0, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.onDark }}>{it.title}</p>
                <p style={{ margin: 0, fontSize: t.typography.fontSize.xs, color: t.colors.text.onDarkMuted }}>{it.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {whatsapp && (
        <div style={{ background: t.colors.cream.warm, borderRadius: t.radius.lg, padding: t.spacing["4"], textAlign: "center" }}>
          <p style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>تحتاجين مساعدة؟</p>
          <p style={{ margin: `0 0 ${t.spacing["3"]}`, fontSize: t.typography.fontSize.xs, color: t.colors.text.mid }}>تواصلي مع المتجر مباشرة</p>
          <a
            href={`https://wa.me/${whatsapp.replace("+", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", background: t.colors.brand.whatsapp, color: t.colors.white, borderRadius: t.radius.full, textDecoration: "none", fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}
          >
            <MessageCircle size={14} strokeWidth={1.8} />
            واتساب
          </a>
        </div>
      )}

      <div style={{ background: t.colors.white, borderRadius: t.radius.lg, padding: t.spacing["4"] }}>
        <p style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.text.dark }}>وسائل دفع آمنة ومعتمدة</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PAYMENT_BADGES.map((b) => (
            <span key={b} style={{ fontSize: t.typography.fontSize.xs, border: `1px solid ${t.colors.cream.border}`, borderRadius: t.radius.sm, padding: "4px 10px", color: t.colors.text.mid }}>
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
