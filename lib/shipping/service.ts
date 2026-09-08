// lib/shipping/service.ts
// نقطة الدخول الموحّدة للشحن — بديل استدعاء getShippingProvider() مباشرة
// من أي مستهلك (checkout, routes مستقبلية).
//
// calculateRate/testConnection: أغلفة رقيقة (نفس RateResult/behavior
// تماماً + retry + تطبيع أخطاء) — تأخذ credentials جاهزة من المتصل، تماماً
// كما كان checkout-pricing.ts و/api/stores/shipping يفعلان سابقاً، حتى لا
// يتغيّر سلوكهما إطلاقاً.
//
// createShipment/getTracking/cancelShipment/getLabel: عقود كاملة وجاهزة،
// تحلّ StoreShipping وتفكّ تشفير بيانات الاعتماد داخلياً (المتصل يمرّر
// المعرّفات فقط) — لكنها تعتمد على Provider.createShipment وأخواتها التي
// **ترمي not_supported حالياً** (راجع تعليقات aramex.ts/spl.ts). هذا
// تثبيت Contract، وليس ادّعاءً بأن إنشاء الشحنات الحقيقي يعمل اليوم.

import { prisma } from "../prisma";
import type { ShippingStatus } from "@prisma/client";
import { getShippingProvider } from "./registry";
import { decryptShippingCredentials } from "./credentials";
import { withRetry, normalizeShippingError } from "./reliability";
import { RateRequest, RateResult, ShipmentRequest, ShippingProviderError } from "./types";

// حالات نهائية — شحنة "غير فعّالة" لأغراض idempotency (يجوز إنشاء شحنة
// بديلة بعدها، مثلاً إعادة شحن بعد فشل أو إرجاع)
const INACTIVE_STATUSES: ShippingStatus[] = ["FAILED", "RETURNED"];

async function resolveStoreShipping(storeId: string) {
  const link = await prisma.storeShipping.findFirst({ where: { storeId, isActive: true }, orderBy: { connectedAt: "asc" } });
  if (!link) throw new ShippingProviderError("لا توجد شركة شحن مربوطة ونشطة لهذا المتجر", "UNKNOWN", "invalid_request");
  return { carrier: link.carrier, credentials: decryptShippingCredentials(link.credentialsEnc) };
}

export const ShippingService = {
  /** يجلب سعر شحن حي — نفس RateResult تماماً، بإعادة محاولة محدودة للأخطاء الشبكية فقط */
  async calculateRate(carrier: Parameters<typeof getShippingProvider>[0], credentials: Record<string, string>, request: RateRequest): Promise<RateResult> {
    const provider = getShippingProvider(carrier);
    try {
      return await withRetry(() => provider.getRate(credentials, request));
    } catch (err) {
      throw normalizeShippingError(err, carrier);
    }
  },

  /** يتحقق من بيانات اعتماد فعلياً عند الشركة — يُستخدم عند الربط لأول مرة */
  async testConnection(carrier: Parameters<typeof getShippingProvider>[0], credentials: Record<string, string>): Promise<boolean> {
    const provider = getShippingProvider(carrier);
    try {
      return await withRetry(() => provider.testCredentials(credentials), { retries: 1 });
    } catch {
      return false;
    }
  },

  /**
   * ينشئ شحنة حقيقية عند شركة الشحن المربوطة لهذا المتجر + يُسجّلها محلياً.
   * Idempotent: لو فيه شحنة "فعّالة" مسبقاً لنفس الطلب، تُعاد كما هي بدل تكرار الإنشاء.
   */
  async createShipment(orderId: string, storeId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true, orderNumber: true, storeId: true, total: true, paymentMethod: true,
        shippingName: true, shippingPhone: true, shippingCity: true, shippingRegion: true, shippingAddress: true, shippingZip: true,
        store: { select: { nameAr: true, city: true, region: true } },
      },
    });
    if (!order || order.storeId !== storeId) {
      throw new ShippingProviderError("الطلب غير موجود أو لا يخص هذا المتجر", "UNKNOWN", "invalid_request");
    }

    // ── idempotency: شحنة فعّالة موجودة مسبقاً؟ لا نُنشئ ثانية ──
    const existing = await prisma.shipment.findFirst({
      where: { orderId, status: { notIn: INACTIVE_STATUSES } },
      orderBy: { createdAt: "desc" },
    });
    if (existing) return existing;

    const { carrier, credentials } = await resolveStoreShipping(storeId);
    const provider = getShippingProvider(carrier);

    const shipmentRequest: ShipmentRequest = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      from: { name: order.store.nameAr, phone: "", city: order.store.city ?? "", region: order.store.region ?? "", address: "" },
      to: { name: order.shippingName, phone: order.shippingPhone, city: order.shippingCity, region: order.shippingRegion ?? "", address: order.shippingAddress, zipCode: order.shippingZip },
      weightKg: 0.5, // ⚠️ تقريبي — لا OrderItem.weight snapshot متوفر حالياً (فجوة موثَّقة بالـAudit، مؤجَّلة)
      codAmount: order.paymentMethod === "CASH_ON_DELIVERY" ? order.total : undefined,
    };

    let result;
    try {
      result = await withRetry(() => provider.createShipment(credentials, shipmentRequest));
    } catch (err) {
      throw normalizeShippingError(err, carrier);
    }

    return prisma.shipment.create({
      data: {
        orderId,
        carrier,
        carrierCode: carrier,
        externalShipmentId: result.externalShipmentId,
        trackingNumber: result.trackingNumber,
        trackingUrl: result.trackingUrl,
        labelUrl: result.labelUrl,
        status: "PENDING",
        lastSyncedAt: new Date(),
        events: { create: { status: "PENDING", note: `تم إنشاء الشحنة عبر ${carrier}` } },
      },
    });
  },

  /** يجلب أحداث التتبّع من شركة الشحن ويُحدّث السجل المحلي — يعمل فقط لشحنات أُنشئت عبر ShippingService */
  async getTracking(shipmentId: string, storeId: string) {
    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId }, include: { order: { select: { storeId: true } } } });
    if (!shipment || shipment.order.storeId !== storeId) {
      throw new ShippingProviderError("الشحنة غير موجودة أو لا تخص هذا المتجر", "UNKNOWN", "invalid_request");
    }
    if (!shipment.carrierCode || !shipment.externalShipmentId) {
      throw new ShippingProviderError("هذه الشحنة أُدخلت يدوياً — لا يمكن تتبّعها آلياً", shipment.carrier ?? "UNKNOWN", "not_supported");
    }

    const { credentials } = await resolveStoreShipping(storeId);
    const provider = getShippingProvider(shipment.carrierCode);

    let result;
    try {
      result = await withRetry(() => provider.getTracking(credentials, shipment.externalShipmentId!));
    } catch (err) {
      throw normalizeShippingError(err, shipment.carrierCode);
    }

    await prisma.shipmentEvent.createMany({
      data: result.events.map((e) => ({ shipmentId: shipment.id, status: shipment.status, note: e.description ?? e.status })),
    });
    await prisma.shipment.update({ where: { id: shipment.id }, data: { lastSyncedAt: new Date() } });

    return result;
  },

  async cancelShipment(shipmentId: string, storeId: string): Promise<void> {
    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId }, include: { order: { select: { storeId: true } } } });
    if (!shipment || shipment.order.storeId !== storeId) {
      throw new ShippingProviderError("الشحنة غير موجودة أو لا تخص هذا المتجر", "UNKNOWN", "invalid_request");
    }
    if (!shipment.carrierCode || !shipment.externalShipmentId) {
      throw new ShippingProviderError("هذه الشحنة أُدخلت يدوياً — لا يمكن إلغاؤها آلياً", shipment.carrier ?? "UNKNOWN", "not_supported");
    }
    const { credentials } = await resolveStoreShipping(storeId);
    const provider = getShippingProvider(shipment.carrierCode);
    try {
      await withRetry(() => provider.cancelShipment(credentials, shipment.externalShipmentId!));
    } catch (err) {
      throw normalizeShippingError(err, shipment.carrierCode);
    }
    await prisma.shipment.update({ where: { id: shipment.id }, data: { status: "FAILED" } });
    await prisma.shipmentEvent.create({ data: { shipmentId: shipment.id, status: "FAILED", note: "أُلغيت الشحنة" } });
  },

  async getLabel(shipmentId: string, storeId: string): Promise<string> {
    const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId }, include: { order: { select: { storeId: true } } } });
    if (!shipment || shipment.order.storeId !== storeId) {
      throw new ShippingProviderError("الشحنة غير موجودة أو لا تخص هذا المتجر", "UNKNOWN", "invalid_request");
    }
    if (shipment.labelUrl) return shipment.labelUrl;
    if (!shipment.carrierCode || !shipment.externalShipmentId) {
      throw new ShippingProviderError("هذه الشحنة أُدخلت يدوياً — لا يوجد ملصق آلي لها", shipment.carrier ?? "UNKNOWN", "not_supported");
    }
    const { credentials } = await resolveStoreShipping(storeId);
    const provider = getShippingProvider(shipment.carrierCode);
    try {
      const labelUrl = await withRetry(() => provider.getLabel(credentials, shipment.externalShipmentId!));
      await prisma.shipment.update({ where: { id: shipment.id }, data: { labelUrl } });
      return labelUrl;
    } catch (err) {
      throw normalizeShippingError(err, shipment.carrierCode);
    }
  },
};
