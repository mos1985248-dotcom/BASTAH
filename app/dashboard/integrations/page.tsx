// app/dashboard/integrations/page.tsx — «التكاملات» للتاجر: ربط حساباته الخارجية
// وإدارتها، وعرض الخدمات التي فعّلتها الإدارة. الإعداد التقني كله عند الإدارة.
"use client";

import { useEffect, useState } from "react";
import { Plug } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";
import AccountsSection from "@/components/dashboard/integrations/AccountsSection";
import ServicesSection from "@/components/dashboard/integrations/ServicesSection";
import type { MerchantIntegrations } from "@/components/dashboard/integrations/types";

export default function IntegrationsPage() {
  const [data, setData] = useState<MerchantIntegrations | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api.get<MerchantIntegrations>("/api/stores/marketing-links").then(setData).catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل التكاملات"));
  };
  useEffect(load, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <LoadingState />;

  return (
    <div dir="rtl" style={{ maxWidth: 760 }}>
      <h1 style={{ display: "flex", alignItems: "center", gap: 8, margin: `0 0 ${t.spacing["4"]}`, fontSize: t.typography.fontSize.xl, color: t.colors.text.dark }}>
        <Plug size={20} strokeWidth={1.8} />
        التكاملات
      </h1>
      <ServicesSection services={data.services} />
      <AccountsSection data={data} onChanged={load} />
    </div>
  );
}
