// app/api/orders/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { updateOrderStatusSchema, formatZodError } from "@/lib/validation";
import { releaseStock } from "@/lib/inventory";
import { createNotification } from "@/lib/notifications";
import { fetchMoyasarInvoice, refundMoyasarPayment, toHalalas, MoyasarError } from "@/lib/moyasar";
import { decryptSecret } from "@/lib/crypto";
import { applyMoyasarPaymentStatus } from "@/lib/order-payment";
import { recordEvent } from "@/lib/analytics";

interface Params {
  params: { id: string };
}

/** يُرمى عند خسارة سباق تزامن على إلغاء الطلب — راجع حارس التزامن أدناه */
class ConcurrentOrderStateError extends Error {}

async function getOrderWithAccessCheck(orderId: string, userId: string, userRole: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      shipments: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
      store: { select: { id: true, nameAr: true, slug: true, userId: true, city: true, region: true, latitude: true, longitude: true, subscription: { select: { merchantMoyasarSecretKeyEnc: true, bankTransferIban: true, bankTransferAccountHolder: true, bankTransferBankName: true } } } },
      buyer: { select: { id: true, name: true, phone: true } },
    },
  });
  if (!order) return { order: null, isOwnerBuyer: false, isOwnerSeller: false };

  const isOwnerBuyer = order.buyerId === userId;
  const isOwnerSeller = order.store.userId === userId;
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  return { order, isOwnerBuyer, isOwnerSeller: isOwnerSeller || isAdmin };
}

// ── GET /api/orders/[id] — تفاصيل الطلب (المشتري أو البائع أو الإدارة) ──
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { order, isOwnerBuyer, isOwnerSeller } = await getOrderWithAccessCheck(params.id, user.id, user.role);
    if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    if (!isOwnerBuyer && !isOwnerSeller) {
      return NextResponse.json({ error: "لا تملكين صلاحية عرض هذا الطلب" }, { status: 403 });
    }

    // لا داعي لتسريب مفتاح Moyasar المشفَّر بأي استجابة عامة
    const { store, ...rest } = order;
    const { subscription: sub, latitude: _storeLat, longitude: _storeLng, ...storePublic } = store;

    // المشتري (فقط) لطلب تحويل بنكي لسه معلّق يقدر يشوف بيانات حساب
    // التاجر مرة ثانية (مثلاً لو رجع للصفحة قبل ما يكمّل التحويل) — نجيبها
    // من الاشتراك الحالي لا من نسخة وقت إنشاء الطلب، احتياطاً لو التاجر
    // غيّر رقم حسابه بعدها
    const bankAccount =
      isOwnerBuyer && order.paymentMethod === "BANK_TRANSFER" && order.paymentStatus === "PENDING"
        ? { iban: sub?.bankTransferIban ?? null, accountHolder: sub?.bankTransferAccountHolder ?? null, bankName: sub?.bankTransferBankName ?? null }
        : undefined;

    // بعكس /api/stores/nearby — هذا طلب فعلي، المشتري صاحبه يحتاج
    // الإحداثيات الدقيقة عملياً ليستلم
    const pickupInfo =
      isOwnerBuyer && order.fulfillmentMethod === "PICKUP"
        ? { city: store.city, region: store.region, latitude: store.latitude, longitude: store.longitude }
        : undefined;

    return NextResponse.json({
      order: { ...rest, store: storePublic, ...(bankAccount ? { bankAccount } : {}), ...(pickupInfo ? { pickupInfo } : {}) },
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/orders/:id]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// ── PATCH /api/orders/[id] — تحديث الحالة (البائع/الإدارة فقط) ──
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();
    const { order, isOwnerSeller } = await getOrderWithAccessCheck(params.id, user.id, user.role);
    if (!order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    if (!isOwnerSeller) {
      return NextResponse.json({ error: "لا تملكين صلاحية تعديل هذا الطلب" }, { status: 403 });
    }
    if (["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status)) {
      return NextResponse.json({ error: `لا يمكن تعديل طلب بحالة "${order.status}" — هذه حالة نهائية` }, { status: 409 });
    }

    const body = await req.json();
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { status, sellerNotes, trackingNumber, carrier } = parsed.data;

    // ⚠️ طلب مدفوع فعلياً لا يمكن "إلغاؤه" بصمت بدون استرداد المبلغ —
    // يجب استخدام REFUNDED بدلاً منها ليُنفَّذ الاسترداد الفعلي عبر Moyasar
    if (status === "CANCELLED" && order.paymentStatus === "PAID") {
      return NextResponse.json(
        { error: "هذا الطلب مدفوع بالفعل — استخدمي \"استرداد المبلغ\" بدل الإلغاء" },
        { status: 409 }
      );
    }
    if (status === "REFUNDED" && order.paymentStatus !== "PAID") {
      return NextResponse.json({ error: "لا يمكن استرداد طلب غير مدفوع" }, { status: 409 });
    }

    // ⚠️ تحويل بنكي: لا يمكن تقديم الطلب (معالجة/شحن/تسليم) قبل ما يرفع
    // المشتري إثبات التحويل — التاجر يراجعه فعلياً قبل ما "يؤكّد" بتقديم
    // الطلب لأي حالة تالية. أول تقديم بعد رفع الإثبات = التأكيد نفسه،
    // فتنقلب paymentStatus تلقائياً PAID بنفس لحظة هذا الانتقال (تحت).
    if (
      order.paymentMethod === "BANK_TRANSFER" &&
      order.paymentStatus !== "PAID" &&
      ["PROCESSING", "SHIPPED", "DELIVERED"].includes(status) &&
      !order.bankTransferProofUrl
    ) {
      return NextResponse.json(
        { error: "المشتري لم يرفع إثبات التحويل البنكي بعد — لا يمكن تقديم الطلب قبل مراجعته" },
        { status: 422 }
      );
    }

    // ── استرداد فعلي عبر Moyasar (خارج المعاملة المحلية — HTTP خارجي) ──
    if (status === "REFUNDED") {
      const secretKeyEnc = order.store.subscription?.merchantMoyasarSecretKeyEnc;
      if (!secretKeyEnc || !order.moyasarTxnId) {
        return NextResponse.json({ error: "تعذّر تحديد عملية الدفع الأصلية لاسترداد المبلغ" }, { status: 422 });
      }
      try {
        const secretKey = decryptSecret(secretKeyEnc);
        const invoice = await fetchMoyasarInvoice(secretKey, order.moyasarTxnId);
        const paidPayment = invoice.payments?.find((p) => p.status === "paid" || p.status === "captured");
        if (!paidPayment) {
          return NextResponse.json({ error: "لا توجد عملية دفع مكتملة على هذه الفاتورة لاستردادها" }, { status: 422 });
        }
        await refundMoyasarPayment(secretKey, paidPayment.id, toHalalas(order.total));
      } catch (refundErr) {
        console.error("[order-refund-failed]", refundErr);
        const message = refundErr instanceof MoyasarError ? "فشل الاسترداد عبر Moyasar — حاولي مجدداً" : "حدث خطأ غير متوقع أثناء الاسترداد";
        return NextResponse.json({ error: message }, { status: 502 });
      }
      // نجاح الاسترداد عند Moyasar → طبّقي نفس منطق applyMoyasarPaymentStatus
      // (يُعيد المخزون ويُحدّث الحالة بنفس القواعد المستخدمة بالـwebhook)
      const result = await applyMoyasarPaymentStatus(order.id, "refunded");
      return NextResponse.json({ order: { id: order.id, status: result.orderStatus, paymentStatus: result.paymentStatus } });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const dateFieldUpdate: Record<string, Date> = {};
      const extraData: Record<string, unknown> = {};

      // ⚠️ تحويل بنكي: أول تقديم للطلب (PROCESSING/SHIPPED/DELIVERED) بعد
      // رفع المشتري للإثبات = تأكيد التاجر (أو الإدارة إشرافياً) لمراجعته
      // فعلياً — نفس لحظة انتقال الحالة هذه تُفعّل paymentStatus=PAID.
      // (التحقق أعلاه ضمن وجود bankTransferProofUrl قبل الوصول هنا)
      if (
        order.paymentMethod === "BANK_TRANSFER" &&
        order.paymentStatus !== "PAID" &&
        ["PROCESSING", "SHIPPED", "DELIVERED"].includes(status)
      ) {
        extraData.paymentStatus = "PAID";
      }

      if (status === "DELIVERED") {
        dateFieldUpdate.deliveredAt = new Date();
        // COD: التسليم يعني تحصيل النقد فعلياً — الآن يصبح الطلب مدفوعاً
        if (order.paymentMethod === "CASH_ON_DELIVERY" && order.paymentStatus !== "PAID") {
          extraData.paymentStatus = "PAID";
        }
      }
      let newOrder: { id: string; status: string; paymentStatus: string };

      if (status === "CANCELLED") {
        dateFieldUpdate.cancelledAt = new Date();
        // ⚠️ حارس تزامن: الفحص أول الدالة (order.status قبل قليل) يمكن أن
        // يفوته طلبا PATCH متزامنان لنفس الطلب يصلان قبل أن يكتب أيٌّ منهما —
        // كلاهما يرى حالة غير نهائية ويحاول الإلغاء، فيُرجَع المخزون مرتين.
        // التحديث الذري هنا (updateMany بشرط WHERE) يضمن أن واحداً فقط
        // "يفوز"، ونُرجع المخزون له وحده (نفس مبدأ applyMoyasarPaymentStatus).
        const guard = await tx.order.updateMany({
          where: { id: order.id, status: { notIn: ["CANCELLED", "DELIVERED", "REFUNDED"] } },
          data: { status, sellerNotes: sellerNotes ?? order.sellerNotes, ...dateFieldUpdate, ...extraData },
        });
        if (guard.count === 0) throw new ConcurrentOrderStateError();

        await releaseStock(
          tx,
          order.items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity }))
        );
        newOrder = await tx.order.findUniqueOrThrow({
          where: { id: order.id },
          select: { id: true, status: true, paymentStatus: true },
        });
      } else {
        newOrder = await tx.order.update({
          where: { id: order.id },
          data: { status, sellerNotes: sellerNotes ?? order.sellerNotes, ...dateFieldUpdate, ...extraData },
          select: { id: true, status: true, paymentStatus: true },
        });
      }

      // ⚠️ شحنة مندوب بسطة (courierId): نزامن حالتها مع الطلب بدل إنشاء شحنة يدوية مكرَّرة
      const courierShipment =
        status === "SHIPPED" || status === "DELIVERED"
          ? await tx.shipment.findFirst({
              where: { orderId: order.id, courierId: { not: null }, status: { notIn: ["FAILED", "RETURNED", "DELIVERED"] } },
              orderBy: { createdAt: "desc" },
            })
          : null;

      if (courierShipment) {
        const isShipped = status === "SHIPPED";
        const nextShipmentStatus = isShipped ? "IN_TRANSIT" : "DELIVERED";
        await tx.shipment.update({
          where: { id: courierShipment.id },
          data: { status: nextShipmentStatus, ...(isShipped ? { pickedUpAt: new Date() } : { deliveredAt: new Date() }) },
        });
        await tx.shipmentEvent.create({
          data: { shipmentId: courierShipment.id, status: nextShipmentStatus, note: isShipped ? "أكّد التاجر خروج الشحنة" : "أكّد التاجر التسليم" },
        });
      } else if (status === "SHIPPED" && (trackingNumber || carrier)) {
        await tx.shipment.create({
          data: { orderId: order.id, carrier: carrier ?? null, trackingNumber: trackingNumber ?? null, status: "IN_TRANSIT" },
        });
      }

      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status, note: sellerNotes ?? `تحديث الحالة إلى ${status}`, createdBy: user.id },
      });

      return newOrder;
    });

    // ⚠️ تحليلات: الطلب تحوّل لمدفوع الآن فعلاً (COD عند DELIVERED، أو تحويل
    // بنكي عند أول تقديم بعد رفع الإثبات) — order.paymentStatus أدناه يقصد
    // الحالة *قبل* هذا التحديث (المتغيّر الأصلي المحمَّل أول الدالة). نُسند
    // الحدث لمصدر الطلب المحفوظ وقت الإنشاء (OrderAttribution) حتى يُحتسب
    // الإيراد تحت المصدر الصحيح بلوحة التسويق، لا "مباشر" دائماً. فشل هذا
    // القسم بالكامل لا يجوز أن يُسقط استجابة تحديث الطلب نفسها.
    if (order.paymentStatus !== "PAID" && updated.paymentStatus === "PAID") {
      try {
        const attribution = await prisma.orderAttribution.findUnique({
          where: { orderId: order.id },
          select: { utmSource: true, utmMedium: true, utmCampaign: true },
        });
        await recordEvent({
          type: "ORDER_PAID", storeId: order.store.id, orderId: order.id, amount: order.total,
          utmSource: attribution?.utmSource, utmMedium: attribution?.utmMedium, utmCampaign: attribution?.utmCampaign,
        });
      } catch (analyticsErr) {
        console.error("[orders PATCH] ORDER_PAID analytics", analyticsErr);
      }
    }

    if (status === "SHIPPED") {
      createNotification({
        userId: order.buyerId,
        type: "ORDER",
        titleAr: "طلبك في الطريق إليك! 🚚",
        bodyAr: `طلبك ${order.orderNumber} شُحن — ${trackingNumber ? `رقم التتبع: ${trackingNumber}` : "ترقّبيه قريباً"}`,
        data: { orderId: order.id, trackingNumber: trackingNumber ?? null },
      }).catch(() => {});
    }
    if (status === "DELIVERED") {
      createNotification({
        userId: order.buyerId,
        type: "ORDER",
        titleAr: "تم توصيل طلبك! 📦",
        bodyAr: `طلبك ${order.orderNumber} وصل بنجاح — شاركينا رأيك بتقييم المنتج`,
        data: { orderId: order.id },
      }).catch(() => {});
    }

    return NextResponse.json({ order: updated });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof ConcurrentOrderStateError) {
      return NextResponse.json({ error: "تغيّرت حالة الطلب أثناء المعالجة — حدّثي الصفحة وحاولي مجدداً" }, { status: 409 });
    }
    console.error("[PATCH /api/orders/:id]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
