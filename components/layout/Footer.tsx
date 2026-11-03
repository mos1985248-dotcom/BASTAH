// components/layout/Footer.tsx
import { uiVars } from "@/components/ui/vars";
import FooterBrand from "./FooterBrand";
import FooterNewsletter from "./FooterNewsletter";
import FooterColumns from "./FooterColumns";
import FooterBottom from "./FooterBottom";
import s from "./footer.module.css";

export default function Footer() {
  return (
    <footer dir="rtl" className={s.footer} style={uiVars}>
      {/* صورة زخرفية: لا تحجب الروابط ولا الأزرار */}
      <div className={s.art} aria-hidden="true" />

      <div className={s.inner}>
        <FooterBrand />
        <FooterNewsletter />
        <div className={s.links}>
          <FooterColumns />
        </div>
      </div>

      <FooterBottom />
    </footer>
  );
}
