// app/dashboard/marketing/page.tsx
// "التسويق والتحليلات": نظرة عامة ومصادر الزيارات حقيقية بالكامل (AnalyticsEvent).
// المحتوى يُنشأ DRAFT ثم يُرسل بزر صريح عبر نظام التكاملات (ربط الحسابات من صفحة التكاملات).
// الحملات الإعلانية تبقى DRAFT — لا إطلاق فعلي بلا Provider أصلي للإعلانات.
"use client";

import { useEffect, useState } from "react";
import { FeatureGate, useStoreFeatures } from "@/components/dashboard/marketing/FeatureGate";
import { api, ApiError } from "@/lib/api-client";
import LoadingState from "@/components/dashboard/ui/LoadingState";
import ErrorState from "@/components/dashboard/ui/ErrorState";
import TrafficOverviewSection from "@/components/dashboard/marketing/TrafficOverviewSection";
import AbandonedCartsSection from "@/components/dashboard/marketing/AbandonedCartsSection";
import ContentSection from "@/components/dashboard/marketing/ContentSection";
import CampaignsSection from "@/components/dashboard/marketing/CampaignsSection";
import CouponsSection from "@/components/dashboard/marketing/CouponsSection";
import type { AdCampaignRow, MarketingContentRow } from "@/components/dashboard/marketing/types";
import { uiVars } from "@/components/ui/vars";
import f from "@/components/dashboard/forms.module.css";
import s from "@/components/dashboard/marketing/marketing.module.css";

export default function MarketingPage() {
  const { features, error: permissionError } = useStoreFeatures();
  const [content, setContent] = useState<MarketingContentRow[] | null>(null);
  const [campaigns, setCampaigns] = useState<AdCampaignRow[] | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    if (!features) return;
    setError("");
    Promise.all([
      features.marketing_content?.allowed ? api.get<{ content: MarketingContentRow[] }>("/api/marketing/content") : Promise.resolve({ content: [] }),
      features.campaigns?.allowed ? api.get<{ campaigns: AdCampaignRow[] }>("/api/marketing/campaigns") : Promise.resolve({ campaigns: [] }),
    ])
      .then(([c, camp]) => {
        setContent(c.content);
        setCampaigns(camp.campaigns);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "تعذّر تحميل بيانات التسويق"));
  };

  useEffect(load, [features]); // eslint-disable-line react-hooks/exhaustive-deps

  if (permissionError) return <ErrorState message={permissionError} />;
  if (error) return <div className={f.page} style={uiVars}><ErrorState message={error} onRetry={load} /></div>;
  if (!features || !content || !campaigns) return <LoadingState label="جاري تحميل لوحة التسويق..." />;

  return (
    <div className={f.page} style={uiVars}>
      <div className={s.stack}>
        <div>
          <h1 className={f.title}>التسويق والتحليلات</h1>
        </div>

        <div className={f.layoutEq}>
          <FeatureGate access={features.traffic} title="إحصاءات الزيارات" description="اطّلع على زيارات متجرك وطلباته."><TrafficOverviewSection /></FeatureGate>
          <FeatureGate access={features.abandoned_carts} title="السلات المتروكة" description="راجع السلات وأرسل تذكيرًا للعملاء الموافقين."><AbandonedCartsSection /></FeatureGate>
        </div>
        <FeatureGate access={features.coupons} title="كوبونات الخصم" description="أدر رموز الخصومات الخاصة بمتجرك."><CouponsSection /></FeatureGate>
        <div className={f.layoutEq}>
          <FeatureGate access={features.marketing_content} title="المحتوى التسويقي" description="جهّز وصف المنتجات والمنشورات والعناوين."><ContentSection content={content} onChanged={load} /></FeatureGate>
          <FeatureGate access={features.campaigns} title="الحملات التسويقية" description="أنشئ مسودات الحملات وراجع نتائجها المتاحة."><CampaignsSection campaigns={campaigns} onChanged={load} /></FeatureGate>
        </div>
      </div>
    </div>
  );
}
