// components/layout/FooterColumns.tsx — أعمدة روابط الفوتر (كل الروابط الموجودة كما هي)
import s from "./FooterColumns.module.css";

const COLUMNS = [
  {
    title: "عن بسطة مارت",
    links: [
      { href: "/about", label: "من نحن" },
      { href: "/story", label: "قصتنا" },
      { href: "/pricing", label: "الأسعار" },
      { href: "/register", label: "ابدأ متجرك" },
      { href: "/blog", label: "المدونة" },
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
  {
    title: "المساعدة",
    links: [
      { href: "/dashboard/support", label: "مركز المساعدة" },
      { href: "/faq", label: "الأسئلة الشائعة" },
      { href: "/dashboard/support", label: "تواصل معنا" },
      { href: "/reset-password", label: "استعادة كلمة المرور" },
    ],
  },
  {
    title: "السياسات القانونية",
    links: [
      { href: "/terms", label: "الشروط والأحكام" },
      { href: "/privacy", label: "سياسة الخصوصية" },
      { href: "/shipping-policy", label: "سياسة الشحن والتوصيل" },
      { href: "/returns-policy", label: "سياسة الإرجاع والاستبدال" },
      { href: "/payment-policy", label: "سياسة الدفع" },
    ],
  },
];

export default function FooterColumns() {
  return (
    <nav className={s.grid} aria-label="روابط الفوتر">
      {COLUMNS.map((col) => (
        <div key={col.title}>
          <div className={s.heading}>
            <h2 className={s.title}>{col.title}</h2>
          </div>
          <ul className={s.list}>
            {col.links.map((link, index) => (
              <li key={`${link.label}-${index}`}>
                <a href={link.href} className={s.link}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
