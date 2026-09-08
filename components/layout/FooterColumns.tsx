// components/layout/FooterColumns.tsx
import Image from "next/image";
import { t } from "@/theme";

const COLUMNS = [
  {
    title: "عن بسطة",
    links: [
      { href: "/about", label: "قصتنا" },
      { href: "/pricing", label: "الأسعار" },
      { href: "/register", label: "ابدأ متجرك" },
      { href: "/blog", label: "المدونة" },
    ],
  },
  {
    title: "قانوني",
    links: [
      { href: "/terms", label: "الشروط والأحكام" },
      { href: "/privacy", label: "سياسة الخصوصية" },
      { href: "/shipping-policy", label: "سياسة الشحن والتوصيل" },
      { href: "/returns-policy", label: "سياسة الإرجاع والاستبدال" },
      { href: "/payment-policy", label: "سياسة الدفع" },
    ],
  },
  {
    title: "المساعدة",
    links: [
      { href: "/dashboard/support", label: "مركز المساعدة" },
      { href: "/pricing#faq", label: "الأسئلة الشائعة" },
      { href: "/dashboard/support", label: "تواصل معنا" },
      { href: "/reset-password", label: "استعادة كلمة المرور" },
    ],
  },
  {
    title: "روابط سريعة",
    links: [
      { href: "/marketplace", label: "تصفح المتاجر" },
      { href: "/marketplace#categories", label: "الأقسام" },
      { href: "/offers", label: "العروض" },
      { href: "/login", label: "تسجيل الدخول" },
    ],
  },
];

export default function FooterColumns() {
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: `${t.spacing["12"]} ${t.spacing["4"]} ${t.spacing["8"]}`,
        display: "grid",
        gridTemplateColumns: "1.3fr 1fr 1fr 1fr 1fr",
        gap: t.spacing["8"],
      }}
      className="basita-footer-grid"
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: t.spacing["3"], marginBottom: t.spacing["4"] }}>
          <Image src="/images/logo-icon.png" alt="بسطة" width={36} height={36} />
          <span style={{ color: t.colors.text.onDark, fontWeight: t.typography.fontWeight.bold, fontSize: t.typography.fontSize.xl }}>
            بسطة
          </span>
        </div>
        <p style={{ color: t.colors.text.onDarkMuted, fontSize: t.typography.fontSize.base, lineHeight: t.typography.lineHeight.relaxed, margin: 0 }}>
          منصة الأسر المنتجة السعودية
        </p>
      </div>

      {COLUMNS.map((col) => (
        <div key={col.title}>
          <h4 style={{ color: t.colors.text.onDark, fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, margin: `0 0 ${t.spacing["4"]}` }}>
            {col.title}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
            {col.links.map((l, i) => (
              <a
                key={`${l.label}-${i}`}
                href={l.href}
                className="basita-footer-link"
                style={{ color: t.colors.text.onDarkMuted, fontSize: t.typography.fontSize.base, textDecoration: "none", transition: `color ${t.motion.fast} ${t.motion.ease}` }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      ))}

      <style>{`
        .basita-footer-link:hover { color: ${t.colors.gold[400]} !important; }
        @media (max-width: 900px) {
          .basita-footer-grid { grid-template-columns: 1fr 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .basita-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}