// lib/marketing/provider.interface.ts
//
// ⚠️ لا يوجد أي Provider حقيقي بهذا الملف ولا بأي ملف آخر بهذه المرحلة —
// هذا عقد (interface) فقط، جاهز ليطبّقه لاحقاً أي مزود فعلي (إنستقرام،
// TikTok، يوتيوب، إلخ) عند توفر مفتاح API/OAuth حقيقي. لا كود هنا يتصل
// بأي شبكة خارجية إطلاقاً.
//
// TODO: يحتاج مفتاح API/OAuth فعلي عند التفعيل — راجع كل provider مستقبلي
// (مثال: lib/marketing/providers/instagram.provider.ts) لتفاصيل الربط.

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

  /** جلب مقاييس تحويل محتوى منشور فعلياً */
  getConversionMetrics(externalContentId: string): Promise<ConversionMetricsResult>;

  /** جلب أداء حملة إعلانية فعلية عند المزود */
  getAdPerformance(externalCampaignId: string): Promise<AdPerformanceResult>;
}
