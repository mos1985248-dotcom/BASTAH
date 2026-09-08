// lib/shipping/metadata.ts
// بيانات عرض فقط (اسم عربي + مستوى الدعم الفعلي) — لا تُستخدم من Checkout
// أو ShippingService أو أي منطق تشغيلي إطلاقاً، فقط لعرضها بلوحة الإدارة.
// إضافة Provider ثالث تعني إضافة سطر هنا أيضاً (نفس مبدأ registry.ts —
// التوسعة بإضافة، لا بتعديل بنية).

export interface ShippingProviderMeta {
  displayNameAr: string;
  logoUrl: string | null;
  // ما تدعمه فعلياً اليوم (يطابق providers/*.ts حرفياً — getRate/testCredentials
  // موجودان، وباقي القدرات ترمي not_supported صراحة، راجع Shipping Audit)
  capability: "rate_only" | "full";
}

export const SHIPPING_PROVIDER_METADATA: Record<string, ShippingProviderMeta> = {
  ARAMEX: { displayNameAr: "أرامكس", logoUrl: null, capability: "rate_only" },
  SPL: { displayNameAr: "البريد السعودي (SPL)", logoUrl: null, capability: "rate_only" },
};
