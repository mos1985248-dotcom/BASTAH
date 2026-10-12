// lib/integrations/types.ts
// عقود نظام التكاملات المركزي. ثلاث طبقات منفصلة لا تعرف إحداها تفاصيل الأخرى:
//   مصادر الأحداث (سلات، محتوى، ...)  →  المحرك (engine)  →  المزوّدون (providers)
// المصدر يعرف نوع الحدث فقط؛ المحرك يعرف الكتالوج والتوجيه؛ المزوّد يعرف طريقة التسليم فقط.

import type { ZodTypeAny } from "zod";

/** ما يُسلَّم للمزوّد: متجر معزول + حساباته المربوطة والمفعَّلة + حمولة المصدر */
export interface IntegrationEnvelope {
  event: string;                              // نوع من EVENT_CATALOG
  source: string;                             // من أطلق الحدث (cart-recovery، marketing-content، ...)
  store: { id: string; name: string; slug: string };
  accounts: { type: string; url: string }[];  // حسابات المتجر الخارجية (بأنواع فعّلتها الإدارة فقط)
  data: Record<string, unknown>;
}

export interface DeliveryResult { ok: boolean; errorMessage?: string }

export interface IntegrationProvider {
  readonly key: string;
  send(envelope: IntegrationEnvelope): Promise<DeliveryResult>;
  test(): Promise<boolean>;
}

/** حقل بيانات اعتماد تعرضه لوحة الإدارة تلقائياً — إضافة مزوّد لا تتطلب تعديل الواجهة */
export interface CredentialField {
  name: string;
  label: string;
  placeholder?: string;
  secret?: boolean;    // يُخفى ولا يُعاد عرضه بعد الحفظ
  generate?: boolean;  // زر «توليد مفتاح»
}

export interface ProviderDefinition {
  key: string;
  label: string;
  description: string;
  /** مفتاح PlatformSetting الذي تُخزَّن فيه بيانات الاعتماد مشفّرة (webhook = "marketing_hub" للتوافق مع ما هو مخزَّن) */
  settingKey: string;
  fields: CredentialField[];
  credentialsSchema: ZodTypeAny;
  /** فحوص أمان إضافية قبل الحفظ (مثل SSRF)؛ ترمي Error برسالة عربية */
  assertSafe?: (credentials: never) => Promise<void>;
  /** وصف غير سرّي يُعرض للإدارة (مثل اسم المضيف) */
  summarize: (credentials: never) => string;
  create: (credentials: unknown) => IntegrationProvider;
}

export interface EventDefinition {
  key: string;
  label: string;
  description: string;
  /** true = لا يُرسل إلا لمتجر ربط حساباً خارجياً واحداً على الأقل (موافقة التاجر) */
  requiresStoreAccount: boolean;
  /** التوجيه الافتراضي قبل أن تضبطه الإدارة */
  defaultProviders: string[];
}

export type Routing = Record<string, { enabled: boolean; providers: string[] }>;
