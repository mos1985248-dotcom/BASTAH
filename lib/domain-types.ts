// lib/domain-types.ts
// أنواع مشتركة بين السيرفر (lib/vercel-domains.ts) وواجهة التاجر — بلا أي كود
// سيرفر هنا حتى يجوز استيرادها من مكوّنات "use client" بلا سحب متغيرات البيئة.

export type DomainState =
  | "CONNECTED"          // مُضاف ومُتحقَّق وDNS سليم — الموقع يعمل
  | "PENDING_DNS"        // مُضاف لكن سجلات DNS عند مزوّد التاجر غير مضبوطة بعد
  | "PENDING_OWNERSHIP"; // Vercel يطلب إثبات ملكية (سجل TXT) — يحدث عند وجوده بحساب آخر

export interface DnsRecord {
  type: "A" | "CNAME" | "TXT";
  name: string;  // الاسم عند مزوّد الدومين (@ للجذر، أو الجزء الفرعي مثل www)
  value: string;
}

export interface DomainStatus {
  domain: string;
  state: DomainState;
  /** السجلات المطلوب أن يضيفها التاجر — فارغة حين يكون الدومين متصلاً */
  records: DnsRecord[];
}
