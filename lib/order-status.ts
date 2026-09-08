// lib/order-status.ts
// المصدر الوحيد لتسميات وألوان حالة الطلب — كان مكرراً بـ3 نسخ مختلفة
// الصياغة (مثلاً DELIVERED: "تم التسليم" مقابل "تم التوصيل" مقابل "مُسلَّم")
// عبر صفحات مختلفة. أي صفحة تعرض حالة طلب يجب أن تستورد من هنا فقط.
import { t } from "@/theme";

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "بانتظار تأكيد الدفع",
  CONFIRMED: "مؤكد",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
  REFUNDED: "مسترجع",
};

export const ORDER_STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  PENDING: { color: t.colors.semantic.warning, bg: t.colors.semantic.warningBg },
  CONFIRMED: { color: t.colors.semantic.info, bg: t.colors.semantic.infoBg },
  PROCESSING: { color: t.colors.semantic.warning, bg: t.colors.semantic.warningBg },
  SHIPPED: { color: t.colors.semantic.info, bg: t.colors.semantic.infoBg },
  DELIVERED: { color: t.colors.semantic.success, bg: t.colors.semantic.successBg },
  CANCELLED: { color: t.colors.semantic.danger, bg: t.colors.semantic.dangerBg },
  REFUNDED: { color: t.colors.text.light, bg: t.colors.cream.bg },
};
