// components/layout/SiteShell.tsx
import { t } from "@/theme";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div 
      style={{ 
        minHeight: "100vh", 
        background: t.colors.cream.bg, 
        display: "flex", 
        flexDirection: "column",
        fontFamily: t.typography.fontFamily.sans,
      }}
    >
      <Navbar />
      <div style={{ flex: 1 }}>{children}</div>
      <Footer />
    </div>
  );
}