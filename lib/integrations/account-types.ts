// lib/integrations/account-types.ts
// أنواع الحسابات الخارجية التي يستطيع التاجر ربطها (رابط حسابه). الإدارة تفعّل
// أو تعطّل كل نوع. المنفَّذ اليوم: حسابات منصات التواصل فقط — البنية عامة
// (مفتاح + نطاقات مسموحة)، وإضافة نوع جديد = إضافة سطر هنا. لا نعلن نوعاً لم يُنفَّذ.

export interface AccountTypeDef { key: string; label: string; hosts: string[]; example: string }

export const ACCOUNT_TYPES: AccountTypeDef[] = [
  { key: "instagram", label: "إنستقرام", hosts: ["instagram.com"], example: "https://instagram.com/حسابك" },
  { key: "tiktok", label: "تيك توك", hosts: ["tiktok.com"], example: "https://tiktok.com/@حسابك" },
  { key: "snapchat", label: "سناب شات", hosts: ["snapchat.com"], example: "https://snapchat.com/add/حسابك" },
  { key: "x", label: "منصة X", hosts: ["x.com", "twitter.com"], example: "https://x.com/حسابك" },
  { key: "facebook", label: "فيسبوك", hosts: ["facebook.com", "fb.com"], example: "https://facebook.com/صفحتك" },
  { key: "youtube", label: "يوتيوب", hosts: ["youtube.com"], example: "https://youtube.com/@قناتك" },
];

export function getAccountType(key: string): AccountTypeDef | undefined {
  return ACCOUNT_TYPES.find((p) => p.key === key);
}

/** يرجع الرابط المنظَّف أو يرمي خطأ بسبب عربي واضح */
export function validateAccountUrl(typeKey: string, raw: string): string {
  const type = getAccountType(typeKey);
  if (!type) throw new Error("نوع الحساب غير مدعوم");

  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("الرابط غير صحيح");
  }
  if (url.protocol !== "https:") throw new Error("الرابط يجب أن يبدأ بـ https://");
  if (url.username || url.password) throw new Error("الرابط غير صحيح");

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (!type.hosts.some((h) => host === h || host.endsWith(`.${h}`))) throw new Error(`الرابط ليس من ${type.label}`);

  const clean = url.toString();
  if (clean.length > 300) throw new Error("الرابط طويل جداً");
  return clean;
}
