// components/layout/SiteShell.tsx
import { t } from "@/theme";
import Navbar from "./Navbar";
import Footer from "./Footer";
import s from "./nav.module.css";

export default function SiteShell({ children, homeMobileNav = false }: {
  children: React.ReactNode;
  homeMobileNav?: boolean;
}) {
  return (
    <div
      id="site-top"
      tabIndex={-1}
      className={homeMobileNav ? s.homeShell : undefined}
      style={{ 
        minHeight: "100vh", 
        background: t.colors.cream.bg, 
        display: "flex", 
        flexDirection: "column",
        fontFamily: t.typography.fontFamily.base,
      }}
    >
      <Navbar homeMobileNav={homeMobileNav} />
      <div style={{ flex: 1 }}>{children}</div>
      <Footer />
    </div>
  );
}
