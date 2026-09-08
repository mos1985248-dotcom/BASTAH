// lib/shipping/types.ts
// الواجهة المشتركة التي يلتزم بها أي مزوّد شحن — هذا هو أساس قابلية
// التوسعة: شركة شحن جديدة = كلاس جديد يطبّق ShippingProvider + سطر واحد
// في registry.ts. لا تعديل على أي route أو منطق آخر إطلاقاً.
//
// ⚠️ موسَّع (مرحلة Shipping Backend الأولى): أضيفت عقود إنشاء/تتبع/إلغاء
// الشحنة وجلب الملصق — لكن التنفيذ الفعلي لهذه القدرات عند Aramex وSPL
// **غير مؤكَّد رسمياً بعد** (راجع Shipping Audit)، لذا كل تطبيق حالي لهذه
// الدوال يرمي ShippingProviderError صريحاً بدل التظاهر بنجاح وهمي عبر
// endpoint افتراضي. هذا تثبيت للـContract فقط، وليس تكاملاً حقيقياً مؤكَّداً.

export interface RateRequest {
  originCity: string;
  destCity: string;
  weightKg: number;
}

export interface RateResult {
  carrierRate: number;   // السعر الفعلي القادم من شركة الشحن — بدون أي تعديل
  currency: string;
  estimatedDays?: number;
}

/** فئات خطأ مُطبَّعة — تُستخدم لتحديد هل يستحق إعادة المحاولة أم لا (lib/shipping/reliability.ts) */
export type ShippingErrorReason =
  | "timeout"
  | "network"
  | "auth"
  | "invalid_request"
  | "not_supported"
  | "unavailable"
  | "unknown";

export class ShippingProviderError extends Error {
  constructor(message: string, public carrier: string, public reason: ShippingErrorReason = "unknown") {
    super(message);
    this.name = "ShippingProviderError";
  }
}

export interface ShipmentAddress {
  name: string;
  phone: string;
  city: string;
  region: string;
  address: string;
  zipCode?: string | null;
}

export interface ShipmentRequest {
  orderId: string;
  orderNumber: string;
  from: ShipmentAddress;
  to: ShipmentAddress;
  weightKg: number;
  codAmount?: number; // مبلغ التحصيل عند الاستلام إن كان الطلب COD — 0/undefined لغيره
}

export interface ShipmentResult {
  externalShipmentId: string;
  trackingNumber: string;
  trackingUrl?: string;
  labelUrl?: string;
  raw?: unknown; // الاستجابة الخام لأغراض التشخيص/السجل فقط
}

export interface TrackingEvent {
  status: string; // نص الحالة كما أرجعتها شركة الشحن (قبل التطبيع)
  description?: string;
  occurredAt: Date;
}

export interface TrackingResult {
  normalizedStatus: string; // مُطبَّع لأقرب قيمة من ShippingStatus enum
  events: TrackingEvent[];
}

export interface ShippingProvider {
  readonly carrier: string;

  /** أسماء الحقول المطلوبة في بيانات الاعتماد لهذه الشركة بالتحديد (للتحقق + نموذج الواجهة) */
  readonly requiredCredentialFields: string[];

  /** يجلب سعر شحن حقيقي من API الشركة باستخدام بيانات اعتماد التاجر نفسه */
  getRate(credentials: Record<string, string>, request: RateRequest): Promise<RateResult>;

  /** يتحقق من صلاحية بيانات الاعتماد فعلياً عند الشركة — يُستخدم عند الربط لأول مرة */
  testCredentials(credentials: Record<string, string>): Promise<boolean>;

  /** ⚠️ عقد جديد — ينشئ شحنة حقيقية عند شركة الشحن. يرمي ShippingProviderError("not_supported") حتى تأكيد التكامل الرسمي */
  createShipment(credentials: Record<string, string>, request: ShipmentRequest): Promise<ShipmentResult>;

  /** ⚠️ عقد جديد — يجلب أحداث تتبع الشحنة */
  getTracking(credentials: Record<string, string>, externalShipmentId: string): Promise<TrackingResult>;

  /** ⚠️ عقد جديد — يلغي شحنة لم تُستلَم بعد */
  cancelShipment(credentials: Record<string, string>, externalShipmentId: string): Promise<void>;

  /** ⚠️ عقد جديد — يجلب رابط ملصق الشحن (PDF عادة) */
  getLabel(credentials: Record<string, string>, externalShipmentId: string): Promise<string>;
}
