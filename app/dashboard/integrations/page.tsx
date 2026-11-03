// app/dashboard/integrations/page.tsx — «التكاملات» للتاجر: ربط حساباته الخارجية
// وإدارتها، وعرض الخدمات التي فعّلتها الإدارة. الإعداد التقني كله عند الإدارة.
"use client";

import { useEffect, useState } from "react";
import { Plug } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import LoadingState from "@/components/dashboard/ui/LoadingState";
import ErrorState from "@/components/dashboard/ui/ErrorState";
import AccountsSection from "@/components/dashboard/integrations/AccountsSection";
import ServicesSection from "@/components/dashboard/integrations/ServicesSection";
import type { MerchantIntegrations } from "@/components/dashboard/integrations/types";

import { uiVars } from "@/components/ui/vars";
import f from "@/components/dashboard/forms.module.css";
import s from "@/components/dashboard/integrations/integrations.module.css";

export default function IntegrationsPage() {
  const [data, setData] = useState<MerchantIntegrations | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api.get<MerchantIntegrations>("/api/stores/marketing-links").then(setData).catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل التكاملات"));
  };
  useEffect(load, []);

  if (error) return <div className={f.page} style={uiVars}><ErrorState message={error} onRetry={load} /></div>;
  if (!data) return <div className={f.page} style={uiVars}><LoadingState /></div>;

  return (
    <div className={f.page} style={uiVars} dir="rtl">
      <div className={f.head}>
        <div>
          <h1 className={`${f.title} ${s.titleRow}`}>
            <Plug size={24} strokeWidth={1.8} aria-hidden="true" />
            التكاملات
          </h1>
          <p className={f.sub}>اربط حساباتك الخارجية وتابع الخدمات التي فعّلتها الإدارة لمتجرك</p>
        </div>
      </div>
      <div className={f.layoutEq}>
        <ServicesSection services={data.services} />
        <AccountsSection data={data} onChanged={load} />
      </div>
    </div>
  );
}
