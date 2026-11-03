// app/admin/page.tsx
"use client";

import { useState } from "react";
import { Lock, Home } from "lucide-react";
import { useCurrentUser } from "@/app/providers";
import { uiVars } from "@/components/ui/vars";
import LoadingState from "@/components/dashboard/ui/LoadingState";
import s from "@/components/admin/admin.module.css";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminTopbar from "@/components/admin/layout/AdminTopbar";
import AdminMobileNav from "@/components/admin/layout/AdminMobileNav";
import { AdminSection } from "@/components/admin/layout/sections";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import StoresTab from "@/components/admin/StoresTab";
import TicketsTab from "@/components/admin/TicketsTab";
import UsersTab from "@/components/admin/UsersTab";
import BlogTab from "@/components/admin/BlogTab";
import AuditTab from "@/components/admin/AuditTab";
import SettingsSection from "@/components/admin/sections/SettingsSection";
import ShippingProvidersSection from "@/components/admin/sections/ShippingProvidersSection";
import IntegrationsSection from "@/components/admin/sections/IntegrationsSection";

// ⚠️ ملاحظة انتقالية: الهيكل (الشريط الجانبي والعلوي وتنقل الجوال) ومكتبة ui/ بالهوية الجديدة؛
// أقسام المحتوى تُعاد تصميماً قسماً بعد قسم (تعمل كما هي ومربوطة بنفس الـAPIs).
export default function AdminPage() {
  const { user, loading } = useCurrentUser();
  const [section, setSection] = useState<AdminSection>("overview");

  if (loading) {
    return <LoadingState />;
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <div className={s.guard} style={uiVars}>
        <Lock size={44} strokeWidth={1.5} />
        <p className={s.guardText}>غير مصرّح لك بالوصول</p>
        <a href="/" className={s.guardLink}>
          <Home size={14} strokeWidth={1.8} />
          الرئيسية
        </a>
      </div>
    );
  }

  return (
    <div className={s.shell} style={uiVars}>
      <AdminSidebar active={section} onChange={setSection} ticketBadge={0} userName={user.name} />

      <div className={s.main}>
        <AdminTopbar active={section} />

        <div className={s.content}>
          {section === "overview" && <AnalyticsTab />}
          {section === "stores" && <StoresTab />}
          {section === "support" && <TicketsTab />}
          {section === "users" && <UsersTab />}
          {section === "blog" && <BlogTab />}
          {section === "settings" && <SettingsSection />}
          {section === "shipping" && <ShippingProvidersSection />}
          {section === "integrations" && <IntegrationsSection />}
          {section === "audit" && <AuditTab />}
        </div>
      </div>

      <AdminMobileNav active={section} onChange={setSection} ticketBadge={0} />
    </div>
  );
}
