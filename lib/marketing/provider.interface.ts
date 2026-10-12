// lib/marketing/provider.interface.ts
//
// ⚠️ عقد قديم غير مستخدم حالياً. نظام التكاملات الفعلي المركزي في lib/integrations/
// (محرك + Provider Registry + Event Catalog). يُبقى هذا الملف لعدم حذف ما كان في main.

export type MarketingContentStatus = "DRAFT" | "PENDING_CONNECTION" | "PUBLISHED" | "FAILED";

export interface PostContentInput {
  contentId: string;
  title: string;
  videoUrl?: string | null;
}

export interface PostContentResult {
  success: boolean;
  externalId?: string; // معرّف المحتوى عند المزود الخارجي (لو نجح النشر)
  status: MarketingContentStatus;
  errorMessage?: string;
}

export interface ConversionMetricsResult {
  views: number;
  clicksToProduct: number;
  purchasesAttributed: number;
  lastSyncedAt: Date | null;
}

export interface AdPerformanceResult {
  impressions: number;
  clicks: number;
  spend: number;
  currency: string;
}

/**
 * العقد العام لأي مزود تسويق — كل Provider مستقبلي (إنستقرام، TikTok،
 * يوتيوب...) يطبّق هذه الواجهة. لا تنفيذ فعلي بهذا الملف، فقط التوقيع.
 */
export interface MarketingProvider {
  readonly providerName: string;

  /** تحقق من صحة الربط (مفتاح API/OAuth صالح) قبل أي عملية أخرى */
  testConnection(): Promise<boolean>;

  /** نشر محتوى على منصة المزود */
  postContent(input: PostContentInput): Promise<PostContentResult>;

  /** اختياري: إرسال حدث تجاري عام (مثل cart.abandoned) للطرف الآخر */
  sendEvent?(event: string, data: Record<string, unknown>): Promise<{ success: boolean; errorMessage?: string }>;

  /** اختياري: جلب مقاييس محتوى منشور من المنصة نفسها — غير مدعوم عند كل المنصات */
  getConversionMetrics?(externalContentId: string): Promise<ConversionMetricsResult>;

  /** اختياري: جلب أداء حملة إعلانية فعلية عند المزود */
  getAdPerformance?(externalCampaignId: string): Promise<AdPerformanceResult>;
}
