// app/api/checkout/route.ts
//
// قرار معماري مهم (نتيجة طبيعية لقرار أحمد بأن كل تاجر يملك حساب Moyasar
// خاص): الدفع غير قابل للتجزئة بين متاجر متعددة في طلب واحد، لأن المبلغ
// يذهب مباشرة لحساب التاجر نفسه — لا يوجد حساب منصة وسيط يُقسَّم منه.
// لذلك: سلة فيها منتجات من متجرين = طلبان منفصلان بدفعتين منفصلتين.
//
// ⚠️ تحديثات هذه الجلسة (منطق التسعير/الشحن نُقل لـlib/checkout-pricing.ts):
// 1) الدفع الإلكتروني يستخدم الآن Moyasar Invoices API الحقيقي بدل
//    Payments API الذي كان يفشل دائماً (راجع تعليق lib/moyasar.ts).
// 2) الدفع عند الاستلام (COD) طريقة حقيقية — تتخطى Moyasar كلياً، بدون
//    اشتراط بوابة دفع، ويبقى paymentStatus=PENDING حتى يُسلَّم فعلياً.
// 3) VAT حقيقية من الـbackend فقط (lib/tax.ts) — 15% على المجموع الفرعي،
//    ومشروطة بأن التاجر لديه رقم ضريبي فعلي (hasTaxNumber).
// 4) variantId مدعوم بالكامل: السعر/المخزون من الـvariant الفعلي لو وُجد.
// 5) رسوم الشحن التشغيلية ورسوم COD أصبحتا قابلتين للضبط عبر
//    PlatformSetting (lib/platform-settings.ts) بدل أرقام ثابتة بالكود،
//    ومنفصلتان تماماً عن بعضهما بمعادلة الإجمالي:
//    subtotal + shippingCost + codFee - discountAmount + taxAmount = total

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { checkoutSchema, formatZodError } from "@/lib/validation";
import { reserveStock, releaseStock, InsufficientStockError } from "@/lib/inventory";
import { createMoyasarInvoice, toHalalas, MoyasarError } from "@/lib/moyasar";
import { computeVat } from "@/lib/tax";
import { getCodFee } from "@/lib/platform-settings";
import { decryptSecret } from "@/lib/crypto";
import { resolveCheckoutItems, computeShippingCost, CheckoutItemError, ShippingCalcError } from "@/lib/checkout-pricing";

function generateOrderNumber(): string {
  const ts = Date.now().toString().slice(-6);
  const rand = Math.floor(Math.random() * 90 + 10);
  return `BS-${ts}${rand}`;
}

interface ReservedItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export async function POST(req: NextRequest) {
  let reservedItems: ReservedItem[] | null = null;

  try {
    const user = await requireUser();

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { storeId, items, addressId, paymentMethod, fulfillmentMethod, buyerNotes, couponCode } = parsed.data;
    const isCod = paymentMethod === "CASH_ON_DELIVERY";
    const isBankTransfer = paymentMethod === "BANK_TRANSFER";
    const isPickup = fulfillmentMethod === "PICKUP";

    // ── تحقق المتجر والبوابة ───────────────────────────
    const subscription = await prisma.storeSubscription.findUnique({
      where: { storeId },
      include: {
        store: { select: { status: true, nameAr: true, pickupEnabled: true, latitude: true, longitude: true, city: true, region: true } },
      },
    });
    if (!subscription || subscription.store.status !== "ACTIVE") {
      return NextResponse.json({ error: "المتجر غير متاح حالياً" }, { status: 404 });
    }
    if (subscription.status === "SUSPENDED") {
      return NextResponse.json({ error: "هذا المتجر معلّق مؤقتاً ولا يستقبل طلبات" }, { status: 403 });
    }
    // بوابة الدفع الإلكتروني (Moyasar) مطلوبة فقط لطرق البطاقة —
    // COD وBANK_TRANSFER لهما مسارهما الخاص، بدون Moyasar إطلاقاً
    if (!isCod && !isBankTransfer && !subscription.merchantMoyasarSecretKeyEnc) {
      return NextResponse.json(
        { error: "هذا المتجر لم يفعّل بوابة الدفع الإلكتروني بعد — جرّبي الدفع عند الاستلام أو تواصلي معه عبر واتساب" },
        { status: 422 }
      );
    }
    if (isBankTransfer && !subscription.bankTransferEnabled) {
      return NextResponse.json(
        { error: "هذا المتجر لم يفعّل الدفع بتحويل بنكي — جرّبي طريقة دفع أخرى" },
        { status: 422 }
      );
    }
    if (isPickup && !subscription.store.pickupEnabled) {
      return NextResponse.json(
        { error: "هذا المتجر لم يفعّل الاستلام من موقعه — اختاري الشحن العادي" },
        { status: 422 }
      );
    }

    // ── تحقق العنوان (SHIPPING فقط) — PICKUP لا يحتاج عنوان شحن إطلاقاً ──
    const address = isPickup
      ? null
      : await prisma.address.findUnique({ where: { id: addressId! } });
    if (!isPickup && (!address || address.userId !== user.id)) {
      return NextResponse.json({ error: "عنوان الشحن غير صالح" }, { status: 400 });
    }

    // ── تحقق المنتجات/المتغيّرات + حساب الشحن (من القاعدة فقط) ──
    let resolved, productNames, shippingCost, shippingRateLogId;
    try {
      ({ resolved, productNames } = await resolveCheckoutItems(storeId, items));
      if (isPickup) {
        // لا شحن إطلاقاً — استلام شخصي من موقع التاجر
        shippingCost = 0;
        shippingRateLogId = null;
      } else {
        const subtotalForShipping = resolved.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        ({ shippingCost, shippingRateLogId } = await computeShippingCost(storeId, resolved, address!, subtotalForShipping));
      }
    } catch (e) {
      if (e instanceof CheckoutItemError || e instanceof ShippingCalcError) {
        return NextResponse.json({ error: e.message }, { status: e.status });
      }
      throw e;
    }

    const subtotal = resolved.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    // كوبونات الخصم: التحقق الفعلي (الحد الأدنى، تاريخ الانتهاء، حد الاستخدام)
    // مؤجَّل لمرحلة قادمة — حالياً نقبل الحقل ونُسجّله بدون تطبيق خصم فعلي
    const discountAmount = 0;

    // ── VAT: 15% على المجموع الفرعي فقط، ومشروطة برقم ضريبي حقيقي للتاجر ──
    const taxAmount = computeVat(subtotal, subscription.hasTaxNumber);

    // ⚠️ رسوم COD منفصلة تماماً عن shippingCost — قابلة للضبط من PlatformSetting،
    // وصفر دائماً لأي طريقة دفع غير الدفع عند الاستلام
    const codFee = await getCodFee(paymentMethod);

    // subtotal + shipping + codFee - discount + VAT = total
    const total = subtotal + shippingCost + codFee - discountAmount + taxAmount;

    const orderNumber = generateOrderNumber();
    reservedItems = resolved.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity }));

    // ── المعاملة المحلية: حجز المخزون + إنشاء الطلب (atomic) ──
    const order = await prisma.$transaction(async (tx) => {
      await reserveStock(tx, reservedItems!, productNames);

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerId: user.id,
          storeId,
          paymentMethod,
          fulfillmentMethod,
          subtotal,
          discountAmount,
          couponCode: couponCode ?? null,
          shippingCost,
          codFee,
          taxAmount,
          total,
          // ⚠️ PICKUP: لا يوجد عنوان شحن فعلي — نستخدم بيانات المشتري
          // نفسه للتواصل (تأكيد الاستلام)، ونص وصفي بدل عنوان حقيقي.
          // حقول Order.shipping* تبقى NOT NULL بالـschema عمداً (تجنّب
          // توسعة أكبر) لكنها غير مستخدَمة فعلياً لأي شحن بهذي الحالة.
          shippingName: isPickup ? user.name : address!.name,
          shippingPhone: isPickup ? (user.phone ?? "غير محدد") : address!.phone,
          shippingCity: isPickup ? (subscription.store.city ?? "غير محدد") : address!.city,
          shippingRegion: isPickup ? subscription.store.region : address!.region,
          shippingAddress: isPickup ? "استلام شخصي من موقع التاجر (راجعي تفاصيل الموقع بصفحة الطلب)" : address!.address,
          shippingZip: isPickup ? null : address!.zipCode,
          buyerNotes: buyerNotes ?? null,
          items: {
            create: resolved.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              nameAr: item.nameAr,
              price: item.unitPrice,
              quantity: item.quantity,
              total: item.unitPrice * item.quantity,
            })),
          },
          statusHistory: {
            create: {
              status: "PENDING",
              note: isCod
                ? "تم إنشاء الطلب — الدفع عند الاستلام"
                : isBankTransfer && isPickup
                ? "تم إنشاء الطلب — بانتظار تحويل بنكي، استلام شخصي من موقع التاجر"
                : isBankTransfer
                ? "تم إنشاء الطلب — بانتظار تحويل بنكي من المشتري"
                : "تم إنشاء الطلب، بانتظار الدفع",
            },
          },
        },
        select: { id: true, orderNumber: true, total: true },
      });

      if (shippingRateLogId) {
        await tx.shippingRate.update({ where: { id: shippingRateLogId }, data: { orderId: newOrder.id } });
      }

      return newOrder;
    });

    // ── الدفع عند الاستلام: لا Moyasar إطلاقاً — الطلب جاهز فوراً ──
    if (isCod) {
      return NextResponse.json(
        { orderId: order.id, orderNumber: order.orderNumber, total: order.total, paymentUrl: null, paymentMethod: "CASH_ON_DELIVERY" },
        { status: 201 }
      );
    }

    // ── تحويل بنكي: لا Moyasar — نرجع بيانات حساب التاجر ليحوّل عليها
    // المشتري، ثم يرفع الإثبات عبر POST /api/orders/[id]/bank-transfer-proof ──
    if (isBankTransfer) {
      return NextResponse.json(
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
          paymentUrl: null,
          paymentMethod: "BANK_TRANSFER",
          fulfillmentMethod,
          bankAccount: {
            iban: subscription.bankTransferIban,
            accountHolder: subscription.bankTransferAccountHolder,
            bankName: subscription.bankTransferBankName,
          },
          // ⚠️ بعكس /api/stores/nearby (تصفح عام قبل أي التزام)، هذا طلب
          // فعلي ملتزم به المشتري مع هذا التاجر بالذات — يحتاج الإحداثيات
          // الدقيقة عملياً عشان يروح يستلم، فلا داعي لإخفائها هنا.
          pickupInfo: isPickup
            ? {
                city: subscription.store.city,
                region: subscription.store.region,
                latitude: subscription.store.latitude,
                longitude: subscription.store.longitude,
              }
            : undefined,
        },
        { status: 201 }
      );
    }

    // ── خارج المعاملة: استدعاء Moyasar (HTTP خارجي، لا نُبقي قفل DB له) ──
    try {
      const secretKey = decryptSecret(subscription.merchantMoyasarSecretKeyEnc!);
      const invoice = await createMoyasarInvoice({
        secretKey,
        amountHalalas: toHalalas(order.total),
        description: `طلب ${order.orderNumber} - ${subscription.store.nameAr}`,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?justPaid=1`,
        metadata: { orderId: order.id, storeId },
      });

      await prisma.order.update({ where: { id: order.id }, data: { moyasarTxnId: invoice.id } });

      return NextResponse.json(
        { orderId: order.id, orderNumber: order.orderNumber, total: order.total, paymentUrl: invoice.url },
        { status: 201 }
      );
    } catch (paymentErr) {
      // ── تعويض: فشل إنشاء الفاتورة بعد نجاح الطلب محلياً → نُلغي ونُرجع المخزون ──
      await prisma.$transaction(async (tx) => {
        await releaseStock(tx, reservedItems!);
        await tx.order.update({
          where: { id: order.id },
          data: { status: "CANCELLED", paymentStatus: "FAILED", cancelledAt: new Date() },
        });
        await tx.orderStatusHistory.create({
          data: { orderId: order.id, status: "CANCELLED", note: "فشل إنشاء فاتورة الدفع عند Moyasar" },
        });
      });

      console.error("[checkout-payment-creation-failed]", paymentErr);
      const message = paymentErr instanceof MoyasarError ? "تعذّر بدء عملية الدفع، حاولي مجدداً" : "حدث خطأ غير متوقع أثناء الدفع";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof InsufficientStockError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("[POST /api/checkout]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
