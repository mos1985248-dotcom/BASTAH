// lib/order-payment.ts
// منطق واحد لتطبيق حالة دفع Moyasar على الطلب — يستخدمه كل من:
// 1) app/api/payments/moyasar/webhook/route.ts (المصدر الأساسي والفوري)
// 2) app/api/orders/[id]/verify-payment/route.ts (مصالحة احتياطية لو تأخر
//    الـwebhook — "تحقق موثوق من API" بدل الاكتفاء بنجاح الـredirect)
//
// كل انتقال حالة محروس بشرط WHERE على الحالة الحالية (updateMany) — idempotent
// فعلياً: استدعاء نفس الحدث عدة مرات لا يُكرر خصم/إرجاع المخزون ولا الإشعارات.

import { prisma } from "./prisma";
import { releaseStock } from "./inventory";
import { createNotification } from "./notifications";
import { recordEvent } from "./analytics";

export type PaymentApplyResult = {
  applied: boolean; // false لو الطلب غير موجود
  changed: boolean; // false لو كانت الحالة مطابقة مسبقاً (idempotent skip)
  orderStatus: string;
  paymentStatus: string;
};

/** يُطبَّق على أي حالة دفع Moyasar (data.status من الـwebhook أو من Fetch مباشر) */
export async function applyMoyasarPaymentStatus(orderId: string, moyasarStatus: string): Promise<PaymentApplyResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, store: { select: { id: true, userId: true } } },
  });
  if (!order) return { applied: false, changed: false, orderStatus: "", paymentStatus: "" };

  if (moyasarStatus === "paid" || moyasarStatus === "captured") {
    if (order.paymentStatus === "PAID") {
      return { applied: true, changed: false, orderStatus: order.status, paymentStatus: order.paymentStatus };
    }
    const result = await prisma.order.updateMany({
      where: { id: order.id, paymentStatus: { not: "PAID" } },
      data: { paymentStatus: "PAID", status: "CONFIRMED", confirmedAt: new Date() },
    });
    if (result.count === 0) {
      // خسرنا سباق التزامن لصالح استدعاء آخر — لا بأس، النتيجة النهائية صحيحة إما حال
      return { applied: true, changed: false, orderStatus: "CONFIRMED", paymentStatus: "PAID" };
    }
    await prisma.orderStatusHistory.create({
      data: { orderId: order.id, status: "CONFIRMED", note: "تأكيد الدفع من Moyasar" },
    });
    createNotification({
      userId: order.buyerId,
      type: "PAYMENT",
      titleAr: "تم تأكيد طلبك! 🎉",
      bodyAr: `طلبك ${order.orderNumber} مدفوع ومُؤكَّد — قيد التجهيز الآن`,
      data: { orderId: order.id, orderNumber: order.orderNumber },
    }).catch(() => {});
    createNotification({
      userId: order.store.userId,
      type: "ORDER",
      titleAr: "طلب جديد وصلك! 🛍️",
      bodyAr: `طلب ${order.orderNumber} بانتظار تجهيزك`,
      data: { orderId: order.id, orderNumber: order.orderNumber },
    }).catch(() => {});
    // ⚠️ هذا المسار وحده (result.count > 0) يعني تحوّلاً فعلياً لمدفوع —
    // إعادة تسليم الـwebhook (idempotent) تمر من فرع changed:false أعلاه
    // فلا يُسجَّل الحدث مرتين لنفس الطلب. نُسند الحدث لمصدر الطلب المحفوظ
    // وقت الإنشاء (OrderAttribution) حتى يُحتسب الإيراد تحت المصدر الصحيح.
    // فشل هذا القسم بالكامل لا يجوز أن يُسقط تأكيد الدفع نفسه — الدفع والحالة
    // تحدّثا أعلاه بالفعل بنجاح بغض النظر عن نتيجة التحليلات.
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
      console.error("[applyMoyasarPaymentStatus] ORDER_PAID analytics", analyticsErr);
    }
    return { applied: true, changed: true, orderStatus: "CONFIRMED", paymentStatus: "PAID" };
  }

  if (moyasarStatus === "failed" || moyasarStatus === "voided" || moyasarStatus === "abandoned") {
    const alreadyHandled = order.paymentStatus === "FAILED" || order.status === "CANCELLED" || order.status === "REFUNDED";
    if (alreadyHandled) {
      return { applied: true, changed: false, orderStatus: order.status, paymentStatus: order.paymentStatus };
    }
    // ⚠️ حارس تزامن (نفس مبدأ فرع paid أعلاه بالضبط): لو وصل إشعاران
    // متزامنان (إعادة تسليم webhook + مصالحة verify-payment في نفس اللحظة)
    // قبل أن يلتزم أيٌّ منهما، الفحص أعلاه (alreadyHandled) يفوته كلاهما —
    // فيُعاد نفس المخزون مرتين. updateMany بشرط WHERE يضمن فوز واحد فقط.
    let releasedByThisCall = false;
    await prisma.$transaction(async (tx) => {
      const guard = await tx.order.updateMany({
        where: { id: order.id, paymentStatus: { not: "FAILED" }, status: { notIn: ["CANCELLED", "REFUNDED"] } },
        data: { paymentStatus: "FAILED", status: "CANCELLED", cancelledAt: new Date() },
      });
      if (guard.count === 0) return; // خسرنا السباق — استدعاء آخر تولّى الأمر فعلاً
      releasedByThisCall = true;
      await releaseStock(
        tx,
        order.items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity }))
      );
      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status: "CANCELLED", note: "فشل الدفع — تم إلغاء الطلب وإعادة المخزون" },
      });
    });
    return { applied: true, changed: releasedByThisCall, orderStatus: "CANCELLED", paymentStatus: "FAILED" };
  }

  if (moyasarStatus === "refunded") {
    if (order.paymentStatus === "REFUNDED") {
      return { applied: true, changed: false, orderStatus: order.status, paymentStatus: order.paymentStatus };
    }
    // الاسترداد يعني الطلب كان مدفوعاً وتم إرجاع المبلغ — نُعيد المخزون فقط
    // لو لم يُعَد مسبقاً (أي لو الطلب لم يكن CANCELLED من قبل)
    const shouldReleaseStock = order.status !== "CANCELLED" && order.status !== "REFUNDED";
    // ⚠️ حارس تزامن (نفس مبدأ الفرعين أعلاه): updateMany بشرط WHERE يضمن
    // أن استرداداً واحداً فقط من بين نداءين متزامنين "يفوز" ويُرجع المخزون
    // ويرسل الإشعار — لا مرتين لنفس الطلب.
    let refundedByThisCall = false;
    await prisma.$transaction(async (tx) => {
      const guard = await tx.order.updateMany({
        where: { id: order.id, paymentStatus: { not: "REFUNDED" } },
        data: { paymentStatus: "REFUNDED", status: "REFUNDED" },
      });
      if (guard.count === 0) return; // خسرنا السباق — نداء آخر تولّى الأمر فعلاً
      refundedByThisCall = true;
      if (shouldReleaseStock) {
        await releaseStock(
          tx,
          order.items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity }))
        );
      }
      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status: "REFUNDED", note: "تم استرداد المبلغ عبر Moyasar" },
      });
    });
    if (!refundedByThisCall) {
      return { applied: true, changed: false, orderStatus: "REFUNDED", paymentStatus: "REFUNDED" };
    }
    createNotification({
      userId: order.buyerId,
      type: "PAYMENT",
      titleAr: "تم استرداد مبلغ طلبك",
      bodyAr: `تم استرداد مبلغ طلبك ${order.orderNumber} بنجاح`,
      data: { orderId: order.id, orderNumber: order.orderNumber },
    }).catch(() => {});
    return { applied: true, changed: true, orderStatus: "REFUNDED", paymentStatus: "REFUNDED" };
  }

  // authorized | verified | initiated وغيرها: لا تُغيّر حالة الطلب في تدفقنا
  // الحالي (لا نستخدم manual capture ولا التوكنة) — نُسجّل الحدث فقط
  return { applied: true, changed: false, orderStatus: order.status, paymentStatus: order.paymentStatus };
}
