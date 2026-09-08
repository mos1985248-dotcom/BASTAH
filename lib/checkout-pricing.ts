// lib/checkout-pricing.ts
// يفصل منطقين ثقيلين عن app/api/checkout/route.ts:
// 1) resolveCheckoutItems — يحوّل عناصر الطلب المُرسَلة من العميل (productId
//    + variantId اختياري + quantity) لبيانات موثوقة بالكامل من القاعدة
//    (سعر، اسم، مخزون) — لا نثق بأي سعر يرسله العميل مطلقاً.
// 2) computeShippingCost — نفس منطق حساب الشحن الفعلي كما كان بالضبط،
//    فقط منقول لملف مستقل بدون أي تغيير بالسلوك.

import { prisma } from "./prisma";
import { ShippingService } from "./shipping/service";
import { decryptShippingCredentials } from "./shipping/credentials";
import { getBasitaShippingFee } from "./platform-settings";

export interface ResolvedCheckoutItem {
  productId: string;
  variantId: string | null;
  nameAr: string;
  unitPrice: number;
  quantity: number;
  requiresShipping: boolean;
  weight: number | null;
}

export class CheckoutItemError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "CheckoutItemError";
  }
}

/** يحوّل عناصر الطلب لبيانات موثوقة من القاعدة — يرمي CheckoutItemError برسالة جاهزة للعرض عند أي مشكلة */
export async function resolveCheckoutItems(
  storeId: string,
  items: { productId: string; variantId?: string; quantity: number }[]
): Promise<{ resolved: ResolvedCheckoutItem[]; productNames: Map<string, string> }> {
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, storeId, status: "ACTIVE" },
    select: {
      id: true, nameAr: true, price: true, quantity: true, requiresShipping: true, weight: true,
      variants: { select: { id: true, nameAr: true, options: true, price: true, quantity: true } },
    },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));
  const productNames = new Map(products.map((p) => [p.id, p.nameAr]));

  const resolved: ResolvedCheckoutItem[] = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new CheckoutItemError(`منتج غير متاح في هذا المتجر (${item.productId})`, 400);
    }

    let unitPrice = product.price;
    let availableQty = product.quantity;
    let nameAr = product.nameAr;

    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        throw new CheckoutItemError(`الخيار المحدَّد غير صالح لمنتج "${product.nameAr}"`, 400);
      }
      unitPrice = variant.price ?? product.price;
      availableQty = variant.quantity;
      const optionLabel = Array.isArray(variant.options) && (variant.options as { name?: string; value?: string }[])[0]?.value;
      nameAr = optionLabel ? `${product.nameAr} - ${optionLabel}` : `${product.nameAr} - ${variant.nameAr}`;
    }

    if (availableQty < item.quantity) {
      throw new CheckoutItemError(`الكمية المتوفرة من "${nameAr}" غير كافية`, 409);
    }

    resolved.push({
      productId: item.productId,
      variantId: item.variantId ?? null,
      nameAr,
      unitPrice,
      quantity: item.quantity,
      requiresShipping: product.requiresShipping,
      weight: product.weight,
    });
  }

  return { resolved, productNames };
}

export interface ShippingResult {
  shippingCost: number;
  shippingRateLogId: string | null;
}

export class ShippingCalcError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ShippingCalcError";
  }
}

/** نفس منطق حساب الشحن الفعلي (carrier حقيقي أو ShippingZone ثابت للتاجر) — بدون تسعير وهمي */
export async function computeShippingCost(
  storeId: string,
  resolved: ResolvedCheckoutItem[],
  address: { city: string; region: string },
  subtotal: number
): Promise<ShippingResult> {
  const needsShipping = resolved.some((i) => i.requiresShipping);
  if (!needsShipping) return { shippingCost: 0, shippingRateLogId: null };

  const totalWeightKg = resolved.reduce((sum, item) => sum + (item.weight ?? 0.5) * item.quantity, 0);

  const carrierLink = await prisma.storeShipping.findFirst({
    where: { storeId, isActive: true },
    orderBy: { connectedAt: "asc" },
  });

  if (carrierLink) {
    try {
      const credentials = decryptShippingCredentials(carrierLink.credentialsEnc);
      const storeCity = (await prisma.store.findUnique({ where: { id: storeId }, select: { city: true } }))?.city ?? address.city;
      const basitaFee = await getBasitaShippingFee();

      const rate = await ShippingService.calculateRate(carrierLink.carrier, credentials, { originCity: storeCity, destCity: address.city, weightKg: totalWeightKg });
      const shippingCost = rate.carrierRate + basitaFee;

      const logged = await prisma.shippingRate.create({
        data: {
          storeId, carrier: carrierLink.carrier, destCity: address.city, weightKg: totalWeightKg,
          carrierRate: rate.carrierRate, basitaFee, totalRate: shippingCost,
          currency: rate.currency, estimatedDays: rate.estimatedDays ?? null,
        },
      });
      return { shippingCost, shippingRateLogId: logged.id };
    } catch (shippingErr) {
      console.error("[checkout-carrier-rate-failed]", shippingErr);
      throw new ShippingCalcError("تعذّر حساب تكلفة الشحن من شركة الشحن — حاولي مجدداً لاحقاً", 502);
    }
  }

  const zones = await prisma.shippingZone.findMany({ where: { storeId, isActive: true } });
  const matchingZone = zones.find((z) => z.regions.includes(address.region) || z.regions.includes(address.city));
  if (!matchingZone) {
    throw new ShippingCalcError("هذا المتجر لم يفعّل أي طريقة شحن لمنطقتك بعد", 422);
  }

  const freeShipping = matchingZone.isFree || (matchingZone.minOrderAmt !== null && subtotal >= matchingZone.minOrderAmt);
  return { shippingCost: freeShipping ? 0 : matchingZone.price, shippingRateLogId: null };
}
