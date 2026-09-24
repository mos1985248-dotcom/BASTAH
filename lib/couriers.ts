// lib/couriers.ts
// مساعدات "بسطة للشحن": تحويل رقم المندوب لصيغة واتساب الدولية + بناء نص
// الرسالة ورابط wa.me. تُبنى كلها على السيرفر — الواجهة تستلم الرابط جاهزاً.
// ⚠️ لا إحداثيات خام في الرسالة إطلاقاً (قرار معماري: distance_km فقط علنياً).

export function toWhatsAppNumber(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("05") && digits.length === 10) return `966${digits.slice(1)}`;
  if (digits.startsWith("5") && digits.length === 9) return `966${digits}`;
  return digits;
}

interface CourierMessageOrder {
  orderNumber: string;
  shippingName: string;
  shippingPhone: string;
  shippingCity: string;
  shippingAddress: string;
  paymentMethod: string;
  total: number;
}

interface CourierMessageStore {
  nameAr: string;
  city: string | null;
  whatsapp: string | null;
}

export function buildCourierMessage(order: CourierMessageOrder, store: CourierMessageStore): string {
  const lines = [
    `طلب توصيل جديد — ${order.orderNumber}`,
    "",
    `المتجر: ${store.nameAr}${store.city ? ` (${store.city})` : ""}`,
    ...(store.whatsapp ? [`جوال المتجر: ${store.whatsapp}`] : []),
    "",
    `المستلم: ${order.shippingName}`,
    `الجوال: ${order.shippingPhone}`,
    `المدينة: ${order.shippingCity}`,
    `العنوان: ${order.shippingAddress}`,
  ];
  if (order.paymentMethod === "CASH_ON_DELIVERY") {
    lines.push("", `الدفع عند الاستلام — المبلغ المطلوب تحصيله: ${order.total} ر.س`);
  } else {
    lines.push("", "مدفوع مسبقاً — لا يوجد تحصيل");
  }
  return lines.join("\n");
}

export function buildWhatsAppUrl(phone: string, text: string): string {
  return `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(text)}`;
}

export const COURIER_CARRIER_LABEL = "بسطة للشحن";
