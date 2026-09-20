import Image from "next/image";
import { Facebook, Instagram, Music2 } from "lucide-react";
import { t } from "@/theme";
import styles from "./FooterColumns.module.css";

const COLUMNS = [
  {
  title: "عن بسطة",
  links: [
    { href: "/about", label: "من نحن" },
    { href: "/about#story", label: "قصتنا" },
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
      { href: "/faq", label: "الأسئلة الشائعة" },
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

const SOCIAL_LINKS = [
  {
    label: "تيك توك",
    href: "#",
    Icon: Music2,
  },
  {
    label: "إنستغرام",
    href: "#",
    Icon: Instagram,
  },
  {
    label: "إكس",
    href: "#",
    Icon: null,
  },
  {
    label: "فيسبوك",
    href: "#",
    Icon: Facebook,
  },
];

export default function FooterColumns() {
  return (
    <div
      dir="rtl"
      className={styles.grid}
      style={{
        maxWidth: t.layout.containerMaxWidth,
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════
          هوية بسطة
          ═══════════════════════════════════════════════════════════════ */}
      <div className={styles.brandSection}>
        <div className={styles.brandHeader}>
          <div className={styles.logoBox}>
            <Image
              src="/images/logo-icon.png"
              alt="بسطة"
              width={44}
              height={44}
              className={styles.logo}
            />
          </div>

          <div className={styles.brandName}>
            <div className={styles.brandTitle}>بسطة</div>

            <div className={styles.brandSubtitle}>
              منصة الأسر المنتجة السعودية
            </div>
          </div>
        </div>

        <div className={styles.brandAccent} aria-hidden="true" />

        <p className={styles.description}>
          منصة سعودية تجمع الأسر المنتجة وأصحاب المتاجر الصغيرة في مكان واحد،
          لتقديم منتجاتهم وخدماتهم بطريقة عصرية بروح السوق السعودي.
        </p>

        {/* وسائل التواصل */}
        <div className={styles.socialSection}>
          <p className={styles.socialTitle}>تابع بسطة</p>

          <div className={styles.socialList}>
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                title={label}
                className={styles.social}
              >
                {label === "إكس" ? (
                  <span
                    aria-hidden="true"
                    className={styles.xIcon}
                  >
                    𝕏
                  </span>
                ) : Icon ? (
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                ) : null}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          أعمدة الفوتر
          ═══════════════════════════════════════════════════════════════ */}
      {COLUMNS.map((col) => (
        <div key={col.title} className={styles.column}>
          <div className={styles.columnHeading}>
            <span
              className={styles.columnMarker}
              aria-hidden="true"
            />

            <h4 className={styles.columnTitle}>
              {col.title}
            </h4>
          </div>

          <div className={styles.links}>
            {col.links.map((link, index) => (
              <a
                key={`${link.label}-${index}`}
                href={link.href}
                className={styles.link}
              >
                <span>{link.label}</span>

                <span
                  className={styles.linkArrow}
                  aria-hidden="true"
                >
                  ←
                </span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}