// lib/integrations/catalog.ts
// كتالوج الأحداث المسموح بها — هذا هو الحد الفاصل: المحرك يرفض أي نوع غير مذكور هنا.
// لإضافة نوع حدث: سطر هنا + استدعاء emitIntegrationEvent من مصدره. لا شيء آخر.
// (أحداث الطلبات والإشعارات والتحليلات لم تُنفَّذ بعد، فلا تُعلَن هنا.)

import type { EventDefinition } from "./types";

export const EVENT_CATALOG: EventDefinition[] = [
  {
    key: "content.publish",
    label: "نشر المحتوى",
    description: "إرسال محتوى التاجر للنشر على حساباته الخارجية، أياً كان مصدر المحتوى.",
    requiresStoreAccount: true,
    defaultProviders: ["webhook"],
  },
  {
    key: "cart.abandoned",
    label: "السلات المتروكة",
    description: "إشعار بسلة متروكة لمتجر (بلا هوية المشتري إلا بموافقته الصريحة).",
    requiresStoreAccount: true,
    defaultProviders: ["webhook"],
  },
];

export function getEvent(key: string): EventDefinition | undefined {
  return EVENT_CATALOG.find((e) => e.key === key);
}
