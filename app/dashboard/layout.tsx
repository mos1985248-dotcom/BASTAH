// app/dashboard/layout.tsx
// Layout مشترك لكل صفحات /dashboard/* تلقائياً في Next.js App Router.
// القائمة على يمين الصفحة (اتجاه RTL الطبيعي)، والمحتوى يأخذ بقية العرض بلا حشو جانبي.
"use client";

import { useCurrentUser } from "@/app/providers";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import s from "@/components/dashboard/dash.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useCurrentUser();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <div className={s.shell} style={{ ...uiVars, background: t.colors.heritage.sand }}>
      <DashboardSidebar isAdmin={isAdmin} />
      <div className={s.content}>
        <DashboardTopbar userId={user?.id} userName={user?.name} />
        <main className={s.main}>{children}</main>
      </div>
    </div>
  );
}
