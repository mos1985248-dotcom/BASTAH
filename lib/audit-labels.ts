// lib/audit-labels.ts
// تحويل سجل العمليات الإدارية إلى نصوص عربية مقروءة. دوال نقية بلا React.
// ⚠️ بعض الإجراءات تُسجَّل تحت AuditAction عام (SUBSCRIPTION_CHANGED و
// SHIPPING_PROVIDER_ADDED) ويُميَّز معناها الفعلي عبر metadata.event —
// لذلك العنوان يُشتقّ من الاثنين معاً وليس من action وحده.

export const ACTION_LABEL: Record<string, string> = {
  STORE_SUSPENDED: "تعليق متجر",
  STORE_REACTIVATED: "إعادة تفعيل متجر",
  STORE_VERIFIED: "توثيق متجر",
  STORE_REJECTED: "رفض توثيق متجر",
  SUBSCRIPTION_CHANGED: "تغيير في إعدادات المتجر",
  INVOICE_MARKED_PAID: "تأكيد سداد فاتورة",
  REFUND_ISSUED: "استرداد مبلغ",
  USER_ROLE_CHANGED: "تغيير دور مستخدم",
  USER_SUSPENDED: "إيقاف مستخدم",
  USER_REACTIVATED: "تفعيل مستخدم",
  PRODUCT_REMOVED: "إزالة منتج",
  PAYOUT_PROCESSED: "معالجة دفعة للتاجر",
  SHIPPING_PROVIDER_ADDED: "إعدادات الشحن",
};

const EVENT_LABEL: Record<string, string> = {
  bank_transfer_enabled: "تفعيل التحويل البنكي",
  bank_transfer_disabled: "إيقاف التحويل البنكي",
  payment_gateway_connected: "ربط بوابة الدفع",
  custom_domain_enabled: "تفعيل ميزة الدومين المخصص",
  custom_domain_disabled: "إيقاف ميزة الدومين المخصص",
  city_courier_created: "إضافة مندوب",
  city_courier_enabled: "تفعيل مندوب",
  city_courier_disabled: "تعطيل مندوب",
  custom_shipping_provider_created: "إضافة شركة شحن مخصصة",
  custom_provider_enabled: "تفعيل شركة شحن مخصصة",
  custom_provider_disabled: "تعطيل شركة شحن مخصصة",
  platform_carrier_credential_saved: "حفظ بيانات اعتماد شركة شحن",
  platform_carrier_enabled: "تفعيل شركة شحن للمنصة",
  platform_carrier_disabled: "تعطيل شركة شحن للمنصة",
};

export const TARGET_TYPE_LABEL: Record<string, string> = {
  Store: "متجر",
  User: "مستخدم",
  CityCourier: "مندوب",
  ShippingProviderConfig: "شركة شحن مخصصة",
  PlatformCarrierCredential: "شركة شحن (المنصة)",
  Order: "طلب",
  Invoice: "فاتورة",
  Product: "منتج",
};

export const ROLE_LABEL: Record<string, string> = {
  BUYER: "مشتري",
  SELLER: "تاجر",
  ADMIN: "مدير",
  SUPER_ADMIN: "مدير عام",
};

const STORE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "نشط",
  INACTIVE: "غير نشط",
  SUSPENDED: "معلّق",
  PENDING_REVIEW: "قيد المراجعة",
};

type Meta = Record<string, unknown> | null | undefined;

export function auditTitle(action: string, metadata: Meta): string {
  const ev = typeof metadata?.event === "string" ? metadata.event : undefined;

  // تعديل المندوب حدث واحد يغطي التفعيل أو العمولة — نفرّق بمحتواه
  if (ev === "city_courier_updated") {
    const hasActive = typeof metadata?.isActive === "boolean";
    const hasCommission = metadata?.commissionPerShipment !== undefined;
    if (hasActive && !hasCommission) return metadata!.isActive ? "تفعيل مندوب" : "تعطيل مندوب";
    if (hasCommission && !hasActive) return "تعديل عمولة مندوب";
    return "تعديل مندوب";
  }

  if (ev && EVENT_LABEL[ev]) return EVENT_LABEL[ev];
  return ACTION_LABEL[action] ?? action.replace(/_/g, " ");
}

export interface MetaLine { label: string; value: string }

const yesNo = (v: unknown, yes: string, no: string) => (v ? yes : no);

export function auditMetaLines(metadata: Meta): MetaLine[] {
  if (!metadata || typeof metadata !== "object") return [];
  const lines: MetaLine[] = [];

  for (const [key, raw] of Object.entries(metadata)) {
    if (key === "event") continue; // ظاهر أصلاً في العنوان

    // العمولة: null تعني أنها أُزيلت، وهي الحالة الوحيدة التي يُعرض فيها null
    if (key === "commissionPerShipment") {
      lines.push({ label: "العمولة لكل شحنة", value: raw == null ? "أُزيلت" : `${raw} ر.س` });
      continue;
    }
    if (raw === null || raw === undefined || raw === "") continue;

    switch (key) {
      case "reason": lines.push({ label: "السبب", value: String(raw) }); break;
      case "previousStatus": lines.push({ label: "الحالة السابقة", value: STORE_STATUS_LABEL[String(raw)] ?? String(raw) }); break;
      case "previousIsActive": lines.push({ label: "الحالة السابقة", value: yesNo(raw, "فعّال", "موقوف") }); break;
      case "isActive": lines.push({ label: "الحالة الجديدة", value: yesNo(raw, "مفعّل", "معطّل") }); break;
      case "city": lines.push({ label: "المدينة", value: String(raw) }); break;
      case "carrierKey": lines.push({ label: "المعرّف", value: String(raw) }); break;
      case "providerType": lines.push({ label: "نوع الربط", value: raw === "MANUAL" ? "يدوي" : raw === "REST" ? "API" : String(raw) }); break;
      case "carrier": lines.push({ label: "الشركة", value: String(raw) }); break;
      case "connectionOk": lines.push({ label: "اختبار الاتصال", value: yesNo(raw, "نجح", "فشل") }); break;
      default:
        // مفتاح غير معروف: نعرضه كما هو حتى لا يُخفى أي تفصيل مسجَّل
        lines.push({ label: key, value: typeof raw === "object" ? JSON.stringify(raw) : String(raw) });
    }
  }
  return lines;
}
