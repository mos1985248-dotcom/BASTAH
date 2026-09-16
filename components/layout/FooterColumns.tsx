import Image from "next/image";
import { Facebook, Instagram, Music2 } from "lucide-react";
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

const linkStyle = {
color: t.colors.text.onDarkMuted,
fontSize: t.typography.fontSize.base,
textDecoration: "none",
lineHeight: 1.7,
};

const socialStyle = {
width: 42,
height: 42,
borderRadius: 999,
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
color: t.colors.text.onDarkMuted,
background: "rgba(255,255,255,0.07)",
border: "1px solid rgba(255,255,255,0.10)",
textDecoration: "none",
flexShrink: 0,
};

export default function FooterColumns() {
return (
<div
dir="rtl"
className="basita-footer-grid"
style={{
width: "100%",
maxWidth: t.layout.containerMaxWidth,
margin: "0 auto",
padding: `${t.spacing["12"]} ${t.spacing["4"]} ${t.spacing["8"]}`,
boxSizing: "border-box",
display: "grid",
gridTemplateColumns: "1.3fr 1fr 1fr 1fr 1fr",
gap: t.spacing["8"],
}}
>
{/* هوية بسطة */} <div className="basita-footer-brand">
<div
style={{
display: "flex",
alignItems: "center",
gap: t.spacing["3"],
marginBottom: t.spacing["4"],
}}
>
{/* شعار بسطة */}
<div
style={{
width: 48,
height: 48,
borderRadius: 14,
background: "#FFFFFF",
border: "1px solid rgba(91,70,45,0.12)",
display: "flex",
alignItems: "center",
justifyContent: "center",
overflow: "hidden",
boxShadow: "0 4px 14px rgba(67,48,29,0.08)",
flexShrink: 0,
}}
>
<Image
src="/images/logo-icon.png"
alt="بسطة"
width={38}
height={38}
style={{
width: 38,
height: 38,
objectFit: "contain",
display: "block",
}}
/> </div>

      {/* اسم بسطة */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: t.typography.fontFamily.heading,
            color: t.colors.text.onDark,
            fontSize: "22px",
            fontWeight: t.typography.fontWeight.bold,
            lineHeight: 1.15,
          }}
        >
          بسطة
        </div>

        <div
          style={{
            marginTop: 3,
            fontFamily: t.typography.fontFamily.heading,
            color: t.colors.text.onDarkMuted,
            fontSize: "10px",
            fontWeight: t.typography.fontWeight.medium,
            lineHeight: 1.3,
            whiteSpace: "nowrap",
          }}
        >
          منصة الأسر المنتجة السعودية
        </div>
      </div>
    </div>

    {/* وصف بسطة */}
    <p
      style={{
        color: t.colors.text.onDarkMuted,
        fontSize: t.typography.fontSize.base,
        lineHeight: t.typography.lineHeight.relaxed,
        margin: 0,
        maxWidth: 360,
      }}
    >
      منصة سعودية تجمع الأسر المنتجة وأصحاب المتاجر الصغيرة في مكان واحد،
      لتقديم منتجاتهم وخدماتهم بطريقة عصرية بروح السوق السعودي.
    </p>

    {/* وسائل التواصل */}
    <div
      style={{
        marginTop: t.spacing["6"],
      }}
    >
      <p
        style={{
          margin: `0 0 ${t.spacing["3"]}`,
          color: t.colors.text.onDark,
          fontSize: t.typography.fontSize.sm,
          fontWeight: t.typography.fontWeight.semibold,
        }}
      >
        تابع بسطة
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: t.spacing["2"],
          flexWrap: "wrap",
        }}
      >
        {SOCIAL_LINKS.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            title={label}
            className="basita-footer-social"
            style={socialStyle}
          >
            {label === "إكس" ? (
              <span
                aria-hidden="true"
                className="basita-footer-x-icon"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: "currentColor",
                }}
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

  {/* أعمدة الفوتر */}
  {COLUMNS.map((col) => (
    <div key={col.title}>
      <h4
        style={{
          color: t.colors.text.onDark,
          fontSize: t.typography.fontSize.lg,
          fontWeight: t.typography.fontWeight.semibold,
          lineHeight: 1.5,
          margin: `0 0 ${t.spacing["4"]}`,
        }}
      >
        {col.title}
      </h4>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: t.spacing["3"],
        }}
      >
        {col.links.map((link, index) => (
          <a
            key={`${link.label}-${index}`}
            href={link.href}
            className="basita-footer-link"
            style={linkStyle}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  ))}

  <style>{`
    .basita-footer-link,
    .basita-footer-social {
      transition:
        color 0.2s ease,
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
    }

    .basita-footer-link:hover {
      color: #ffffff !important;
      transform: translateX(-2px);
    }

    .basita-footer-link:focus-visible,
    .basita-footer-social:focus-visible {
      outline: 2px solid #d9b36c;
      outline-offset: 3px;
      border-radius: 4px;
    }

    .basita-footer-social:hover {
      color: #ffffff !important;
      background: rgba(255,255,255,0.14) !important;
      border-color: rgba(255,255,255,0.22) !important;
      transform: translateY(-2px);
    }

    @media (max-width: 1100px) {
      .basita-footer-grid {
        grid-template-columns: 1.4fr 1fr 1fr 1fr !important;
      }

      .basita-footer-brand {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 760px) {
      .basita-footer-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: ${t.spacing["6"]} !important;
        padding-top: ${t.spacing["8"]} !important;
      }

      .basita-footer-brand {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 480px) {
      .basita-footer-grid {
        grid-template-columns: 1fr !important;
        gap: ${t.spacing["6"]} !important;
        padding-left: ${t.spacing["4"]} !important;
        padding-right: ${t.spacing["4"]} !important;
      }

      .basita-footer-brand {
        grid-column: auto;
      }

      .basita-footer-social {
        width: 40px !important;
        height: 40px !important;
      }

      .basita-footer-x-icon {
        width: 17px !important;
        height: 17px !important;
        font-size: 17px !important;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .basita-footer-link,
      .basita-footer-social {
        transition: none !important;
      }

      .basita-footer-link:hover,
      .basita-footer-social:hover {
        transform: none;
      }
    }
  `}</style>
</div>
);
}
