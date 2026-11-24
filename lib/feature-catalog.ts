export const planOrder = ["FREE", "STARTER", "GROWTH", "PRO"] as const;
export const featureCatalog = {
  products: ["عدد المنتجات", 0],
  pricing: ["محرك التسعير", 0],
  daftari: ["دفاتري", 1],
  munira: ["منيرة", 1],
  munira_images: ["توليد الصور مع منيرة", 2],
  abandoned_carts: ["السلات المتروكة", 2],
  traffic: ["إحصاءات الزيارات", 0],
  traffic_advanced: ["إحصاءات الزيارات المتقدمة", 2],
  coupons: ["كوبونات الخصم", 1],
  marketing_content: ["المحتوى التسويقي", 2],
  campaigns: ["الحملات التسويقية", 3],
  social: ["التكاملات الاجتماعية", 3],
  cart_reminders: ["تذكيرات السلات المتروكة", 2],
} as const;

export function featureDefault(key: string) {
  return Object.hasOwn(featureCatalog, key) ? featureCatalog[key as keyof typeof featureCatalog] : undefined;
}
