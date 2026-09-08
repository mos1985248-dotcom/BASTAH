// lib/tax.ts
// ضريبة القيمة المضافة السعودية — 15%، تُطبَّق فقط لو كان للتاجر رقم
// ضريبي مسجَّل فعلاً (StoreSubscription.hasTaxNumber — نفس الحقل المستخدم
// أصلاً بمنطق فوترة الاشتراك في MerchantBilling.jsx، وليس حقلاً جديداً).
// تجّار غير مسجَّلين ضريبياً (أغلب "الأسر المنتجة" الصغيرة) لا يحق لهم
// قانونياً تحصيل ضريبة لا يملكون رقماً لتوريدها — فتبقى صفراً لهم بصدق.
//
// أساس الاحتساب: على المجموع الفرعي (subtotal) فقط قبل الخصم وقبل الشحن —
// وليس على الشحن، وليس بعد خصم الكوبون. هذا يطابق تماماً حساب الصورة
// المرجعية (١٦٥ × ١٥٪ = ٢٤.٧٥ ريال بالضبط).

export const VAT_RATE = 0.15;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeVat(subtotal: number, storeHasTaxNumber: boolean): number {
  if (!storeHasTaxNumber) return 0;
  return round2(subtotal * VAT_RATE);
}
