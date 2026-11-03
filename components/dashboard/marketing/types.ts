// components/dashboard/marketing/types.ts — أشكال استجابات /api/marketing/content و/campaigns.
export interface ConversionMetric {
  views: number;
  clicksToProduct: number;
  purchasesAttributed: number;
  lastSyncedAt: string | null;
}
export interface MarketingContentRow {
  id: string;
  title: string;
  videoUrl: string | null;
  providerName: string | null;
  status: string;
  createdAt: string;
  metric: ConversionMetric | null;
}
export interface AdCampaignRow {
  id: string;
  name: string;
  budget: number;
  status: string;
  createdAt: string;
}
