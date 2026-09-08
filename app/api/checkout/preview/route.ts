// app/api/checkout/preview/route.ts
// ⚠️ Endpoint جديد بالكامل (إضافي) — معاينة سعرية فقط، لا يُنشئ طلباً ولا
// يحجز مخزوناً. يُعيد استخدام *نفس* الدوال المستخدمة فعلياً بـ
// /api/checkout (lib/checkout-pricing.ts, lib/tax.ts, lib/platform-settings.ts)
// حتى لا يظهر بصفحة الدفع رقم مختلف عمّا سيُحتسَب فعلياً عند التأكيد.
//
// ملاحظة: مسار الناقل الحقيقي (StoreShipping) يُسجّل صف ShippingRate لكل
// معاينة (orderId فارغ) — تماماً نفس سلوك /api/shipping/rates الموجود
// مسبقاً لهذا الغرض، وليس شيئاً جديداً أُدخل هنا.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { checkoutBaseSchema, applyCheckoutRefinements, formatZodError } from "@/lib/validation";
import { computeVat } from "@/lib/tax";
import { getCodFee } from "@/lib/platform-settings";
import { resolveCheckoutItems, computeShippingCost, CheckoutItemError, ShippingCalcError } from "@/lib/checkout-pricing";

const previewSchema = applyCheckoutRefinements(checkoutBaseSchema.omit({ buyerNotes: true, couponCode: true }));

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const parsed = previewSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    const { storeId, items, addressId, paymentMethod, fulfillmentMethod } = parsed.data;
    const isPickup = fulfillmentMethod === "PICKUP";

    const subscription = await prisma.storeSubscription.findUnique({ where: { storeId } });
    if (!subscription) return NextResponse.json({ error: "المتجر غير متاح حالياً" }, { status: 404 });

    // ⚠️ نفس فرع PICKUP بـ/api/checkout بالضبط — لا عنوان، لا شحن إطلاقاً
    const address = isPickup ? null : await prisma.address.findUnique({ where: { id: addressId! } });
    if (!isPickup && (!address || address.userId !== user.id)) {
      return NextResponse.json({ error: "عنوان الشحن غير صالح" }, { status: 400 });
    }

    const { resolved } = await resolveCheckoutItems(storeId, items);
    const subtotal = resolved.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const shippingCost = isPickup ? 0 : (await computeShippingCost(storeId, resolved, address!, subtotal)).shippingCost;

    const discountAmount = 0;
    const taxAmount = computeVat(subtotal, subscription.hasTaxNumber);
    const codFee = await getCodFee(paymentMethod);
    const total = subtotal + shippingCost + codFee - discountAmount + taxAmount;

    return NextResponse.json({ subtotal, shippingCost, codFee, discountAmount, taxAmount, total });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof CheckoutItemError || err instanceof ShippingCalcError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[POST /api/checkout/preview]", err);
    return NextResponse.json({ error: "تعذّرت معاينة السعر" }, { status: 500 });
  }
}
