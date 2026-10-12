
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
        background: t.colors.primary[900],
        marginTop: t.spacing["16"],
        borderTop: `1px solid ${t.colors.primary[700]}`,
        color: t.colors.text.onDark,
      }}
    >
      <FooterNewsletter />

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <FooterColumns />
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <FooterBottom />
      </div>
    </footer>
  );
}
