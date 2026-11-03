// app/dashboard/marketing/page.tsx
// "التسويق والتحليلات": نظرة عامة ومصادر الزيارات حقيقية بالكامل (AnalyticsEvent).
// المحتوى يُنشأ DRAFT ثم يُرسل بزر صريح عبر نظام التكاملات (ربط الحسابات من صفحة التكاملات).
// الحملات الإعلانية تبقى DRAFT — لا إطلاق فعلي بلا Provider أصلي للإعلانات.
"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import LoadingState from "@/components/dashboard/ui/LoadingState";
import ErrorState from "@/components/dashboard/ui/ErrorState";
import TrafficOverviewSection from "@/components/dashboard/marketing/TrafficOverviewSection";
import AbandonedCartsSection from "@/components/dashboard/marketing/AbandonedCartsSection";
import ContentSection from "@/components/dashboard/marketing/ContentSection";
import CampaignsSection from "@/components/dashboard/marketing/CampaignsSection";
import type { AdCampaignRow, MarketingContentRow } from "@/components/dashboard/marketing/types";
import { uiVars } from "@/components/ui/vars";
import f from "@/components/dashboard/forms.module.css";
import s from "@/components/dashboard/marketing/marketing.module.css";

export default function MarketingPage() {
  const [content, setContent] = useState<MarketingContentRow[] | null>(null);
  const [campaigns, setCampaigns] = useState<AdCampaignRow[] | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    Promise.all([
      api.get<{ content: MarketingContentRow[] }>("/api/marketing/content"),
      api.get<{ campaigns: AdCampaignRow[] }>("/api/marketing/campaigns"),
    ])
      .then(([c, camp]) => {
        setContent(c.content);
        setCampaigns(camp.campaigns);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل بيانات التسويق"));
  };

  useEffect(load, []);

  if (error) return <div className={f.page} style={uiVars}><ErrorState message={error} onRetry={load} /></div>;
  if (!content || !campaigns) return <LoadingState label="جاري تحميل لوحة التسويق..." />;

  return (
    <div className={f.page} style={uiVars}>
      <div className={s.stack}>
        <div>
          <h1 className={f.title}>التسويق والتحليلات</h1>
          <p className={s.note}>
            <Info size={14} strokeWidth={1.8} />
            المحتوى والحملات أدناه بنية أولية بلا نشر فعلي على أي منصة بعد. النظرة العامة ومصادر الزيارات بيانات حقيقية من متجرك.
          </p>
        </div>

        <div className={f.layoutEq}>
          <TrafficOverviewSection />
          <AbandonedCartsSection />
        </div>
        <div className={f.layoutEq}>
          <ContentSection content={content} onChanged={load} />
          <CampaignsSection campaigns={campaigns} onChanged={load} />
        </div>
      </div>
    </div>
  );
}
