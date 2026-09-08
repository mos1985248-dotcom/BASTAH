// components/layout/Footer.tsx
import { t } from "@/theme";
import FooterNewsletter from "./FooterNewsletter";
import FooterColumns from "./FooterColumns";
import FooterBottom from "./FooterBottom";

export default function Footer() {
  return (
    <footer 
      style={{ 
        background: t.colors.primary[950],
        marginTop: t.spacing["16"],
        borderTop: `1px solid ${t.colors.primary[800]}`
      }}
    >
      <FooterNewsletter />
      <FooterColumns />
      <FooterBottom />
    </footer>
  );
}