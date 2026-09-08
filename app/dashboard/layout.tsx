// app/dashboard/layout.tsx
// Layout مشترك لكل صفحات /dashboard/* تلقائياً في Next.js App Router.
"use client";

import { useCurrentUser } from "@/app/providers";
import { t } from "@/theme";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useCurrentUser();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <div className="basita-dashboard-shell" style={{ display: "flex", flexDirection: "row-reverse", minHeight: "100vh", direction: "rtl" }}>
      <DashboardSidebar isAdmin={isAdmin} />

      <div style={{ flex: 1, minWidth: 0, background: t.colors.cream.bg, minHeight: "100vh" }}>
        <DashboardTopbar userId={user?.id} userName={user?.name} />
        <main>{children}</main>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .basita-dashboard-shell { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}
