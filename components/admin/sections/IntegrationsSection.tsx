// components/admin/sections/IntegrationsSection.tsx — «التكاملات» في لوحة الإدارة:
// المزوّدون + توجيه الأحداث + أنواع الحسابات. كل التحكم الفني هنا لا عند التاجر.
"use client";

import { useEffect, useState } from "react";
import { Plug } from "lucide-react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import LoadingState from "@/components/admin/ui/LoadingState";
import ErrorState from "@/components/admin/ui/ErrorState";
import ProvidersCard from "@/components/admin/integrations/ProvidersCard";
import EventRoutingCard from "@/components/admin/integrations/EventRoutingCard";
import AccountTypesCard from "@/components/admin/integrations/AccountTypesCard";
import type { Overview } from "@/components/admin/integrations/types";

export default function IntegrationsSection() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    api.get<Overview>("/api/admin/integrations").then((d) => { setData(d); setError(""); }).catch(() => setError("تعذّر تحميل التكاملات"));
  };
  useEffect(load, []);

  if (error && !data) return <div dir="rtl" style={{ maxWidth: 720 }}><ErrorState message={error} onRetry={load} /></div>;
  if (!data) return <LoadingState />;

  return (
    <div dir="rtl" style={{ maxWidth: 720 }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: 8, margin: `0 0 ${t.spacing["3"]}`, fontSize: t.typography.fontSize.lg, color: t.colors.text.dark }}>
        <Plug size={18} strokeWidth={1.8} />
        التكاملات
      </h2>
      <ProvidersCard providers={data.providers} onChanged={load} />
      <EventRoutingCard events={data.events} providers={data.providers} onChanged={load} />
      <AccountTypesCard accountTypes={data.accountTypes} stats={data.stats} onChanged={load} />
    </div>
  );
}
