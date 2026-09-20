// components/layout/Footer.tsx

import { t } from "@/theme";
import FooterNewsletter from "./FooterNewsletter";
import FooterColumns from "./FooterColumns";
import FooterBottom from "./FooterBottom";

export default function Footer() {
  return (
    <footer
      dir="rtl"
      style={{
        background: t.colors.primary[950],
        marginTop: t.spacing["16"],
        borderTop: `1px solid ${t.colors.primary[800]}`,
        color: t.colors.text.onDark,
      }}
    >
      <FooterNewsletter />

      <div
        style={{
          borderTop: `1px solid rgba(255,255,255,0.08)`,
        }}
      >
        <FooterColumns />
      </div>

      <div
        style={{
          borderTop: `1px solid rgba(255,255,255,0.10)`,
        }}
      >
        <FooterBottom />
      </div>
    </footer>
  );
}