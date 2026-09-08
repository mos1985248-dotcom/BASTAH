// app/admin/page.tsx
"use client";

import { useState } from "react";
import { Lock, Home } from "lucide-react";
import { useCurrentUser } from "@/app/providers";
import { t } from "@/theme";
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

// ⚠️ ملاحظة انتقالية: أقسام "نظرة عامة/المتاجر/المستخدمون/الدعم/المدونة/
// سجل العمليات" لا تزال تستخدم مكوّناتها القديمة كما هي (تعمل فعلياً،
// مربوطة بنفس الـAPIs) — لم يُعَد تصميمها بصرياً بعد بهذه الجولة، فقط
// "إعدادات المنصة" الجديدة كلياً (مطلوبة تحديداً بهذه المرحلة). الشريط
// الجانبي الجديد هو الحاوية المشتركة الوحيدة التي تغيّرت.
export default function AdminPage() {
  const { user, loading } = useCurrentUser();
  const [section, setSection] = useState<AdminSection>("overview");

  if (loading) {
    return <p style={{ textAlign: "center", padding: t.spacing["10"], color: t.colors.text.mid }}>جاري التحميل...</p>;
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <div style={{ textAlign: "center", padding: t.spacing["16"], direction: "rtl" }}>
        <Lock size={44} strokeWidth={1.5} color={t.colors.text.light} />
        <p style={{ color: t.colors.semantic.danger, fontSize: t.typography.fontSize.base, marginTop: t.spacing["3"] }}>غير مصرّح لك بالوصول</p>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: t.colors.gold[600] }}>
          <Home size={14} strokeWidth={1.8} />
          الرئيسية
        </a>
      </div>
    );
  }

  return (
    <div style={{ background: t.colors.cream.bg, minHeight: "100vh", direction: "rtl", display: "flex" }}>
      <AdminSidebar active={section} onChange={setSection} ticketBadge={0} userName={user.name} />

      <div style={{ flex: 1, minWidth: 0, paddingBottom: 70 }}>
        <AdminTopbar active={section} />

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: t.spacing["5"] }}>
          {section === "overview" && <AnalyticsTab />}
          {section === "stores" && <StoresTab />}
          {section === "support" && <TicketsTab />}
          {section === "users" && <UsersTab />}
          {section === "blog" && <BlogTab />}
          {section === "settings" && <SettingsSection />}
          {section === "shipping" && <ShippingProvidersSection />}
          {section === "audit" && <AuditTab />}
        </div>
      </div>

      <AdminMobileNav active={section} onChange={setSection} ticketBadge={0} />
    </div>
  );
}
