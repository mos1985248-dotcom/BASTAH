// components/dashboard/orderDetailLogic.ts
// منطق صفحة طلب التاجر المنقول حرفياً من الصفحة (النوع والحالات التالية وتسميات العرض).
export interface OrderDetail {
  id: string; orderNumber: string; status: string; paymentStatus: string; paymentMethod: string; total: number; fulfillmentMethod?: string;
  shippingName: string; shippingPhone: string; shippingCity: string; shippingAddress: string;
  buyerNotes: string | null;
  items: { nameAr: string; price: number; quantity: number; total: number }[];
  bankTransferReference: string | null;
  bankTransferProofUrl: string | null;
  bankTransferSubmittedAt: string | null;
}

const STATIC_NEXT_STATUS: Record<string, { value: string; label: string }[]> = {
  CONFIRMED: [{ value: "PROCESSING", label: "بدء التجهيز" }, { value: "CANCELLED", label: "إلغاء الطلب" }],
  PROCESSING: [{ value: "SHIPPED", label: "تم الشحن" }],
  SHIPPED: [{ value: "DELIVERED", label: "تم التسليم" }],
};

/**
 * ⚠️ إصلاح فجوة موجودة مسبقاً: NEXT_STATUS ما كانت تحوي مفتاح PENDING
 * إطلاقاً — طلبات البطاقات تنتقل لـCONFIRMED تلقائياً بمجرد نجاح الدفع
 * (webhook مويسّر، راجع lib/order-payment.ts)، لكن COD والتحويل البنكي
 * ما عندهما أي webhook، فتبقى عالقة PENDING بدون أي زر إجراء بهذي
 * الصفحة. نحسبها ديناميكياً حسب طريقة الدفع بدل تعديل الكائن الثابت:
 * - COD: يقدر التاجر يبدأ التجهيز فوراً (الدفع يصير عند التسليم أصلاً)
 * - تحويل بنكي: زر "تأكيد استلام التحويل" يظهر فقط بعد رفع المشتري
 *   للإثبات (الباكند برضو يحرس هذا الشرط بـPATCH /api/orders/[id])
 * - بطاقات (لسه PENDING): بدون زر — طلب لم يُدفع فعلياً بعد، ننتظر الـwebhook
 */
export function getNextStatusOptions(order: OrderDetail): { value: string; label: string }[] | undefined {
  if (order.status !== "PENDING") return STATIC_NEXT_STATUS[order.status];
  if (order.paymentMethod === "CASH_ON_DELIVERY") {
    return [{ value: "PROCESSING", label: "بدء التجهيز" }, { value: "CANCELLED", label: "إلغاء الطلب" }];
  }
  if (order.paymentMethod === "BANK_TRANSFER" && order.bankTransferProofUrl) {
    return [{ value: "PROCESSING", label: "تأكيد استلام التحويل وبدء التجهيز" }, { value: "CANCELLED", label: "إلغاء الطلب" }];
  }
  return undefined;
}

export const PAYMENT_LABEL: Record<string, string> = { PAID: "مدفوع", PENDING: "بانتظار الدفع", FAILED: "فشل الدفع", REFUNDED: "مسترجع" };
export const METHOD_LABEL: Record<string, string> = {
  CREDIT_CARD: "بطاقة / مدى", STCPAY: "STC Pay", APPLE_PAY: "Apple Pay", CASH_ON_DELIVERY: "الدفع عند الاستلام", BANK_TRANSFER: "تحويل بنكي",
};
