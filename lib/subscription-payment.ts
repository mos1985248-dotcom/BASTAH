// lib/subscription-payment.ts
// منطق واحد لتطبيق حالة دفع Moyasar (بوابة المنصة) على SubscriptionInvoice
// ثم تفعيل/تجديد StoreSubscription — يستخدمه كل من:
// 1) app/api/webhooks/moyasar-platform/route.ts (المصدر الأساسي والفوري)
// 2) app/api/subscription/verify-payment/route.ts (مصالحة احتياطية لو
//    تأخر الـwebhook — نفس نمط orders/[id]/verify-payment تماماً)
//
// كل انتقال حالة محروس بشرط WHERE على الحالة الحالية (updateMany) — idempotent
// فعلياً: استدعاء نفس الحدث عدة مرات لا يُفعّل الاشتراك مرتين ولا يُكرر الإشعارات.
//
// ⚠️ لا proration: أي دفعة ناجحة (ترقية/تخفيض/تجديد) تُنشئ دورة فوترة
// كاملة جديدة تبدأ الآن (أو من endDate الحالي لو لم ينتهِ بعد، لتفادي
// خسارة وقت مدفوع) — لا يوجد تصميم لحساب المبلغ الجزئي المتبقي من الباقة
// القديمة، فلم أخترعه.

import { prisma } from "./prisma";
import { createNotification } from "./notifications";
import type { SubscriptionPlan } from "@prisma/client";

export type SubscriptionPaymentResult = {
  applied: boolean; // false لو الفاتورة غير موجودة
  changed: boolean; // false لو كانت الحالة مطابقة مسبقاً (idempotent skip)
  invoiceStatus: string;
  subscriptionStatus: string;
};

const CYCLE_DAYS: Record<string, number> = { monthly: 30, yearly: 365 };

/** يُطبَّق على أي حالة دفع Moyasar (data.status من الـwebhook أو من Fetch مباشر) */
export async function applyMoyasarSubscriptionPaymentStatus(
  invoiceId: string,
  moyasarStatus: string
): Promise<SubscriptionPaymentResult> {
  const invoice = await prisma.subscriptionInvoice.findUnique({
    where: { id: invoiceId },
    include: {
      subscription: { include: { store: { select: { id: true, userId: true, nameAr: true } } } },
    },
  });
  if (!invoice) return { applied: false, changed: false, invoiceStatus: "", subscriptionStatus: "" };

  const sub = invoice.subscription;
  const wasFirstActivation = sub.status === "TRIAL" || (sub.plan === "FREE" && invoice.plan !== "FREE");
  const wasSuspended = sub.status === "SUSPENDED" || sub.status === "GRACE_PERIOD" || sub.status === "EXPIRED";

  if (moyasarStatus === "paid" || moyasarStatus === "captured") {
    if (invoice.status === "PAID") {
      return { applied: true, changed: false, invoiceStatus: invoice.status, subscriptionStatus: sub.status };
    }

    const invoiceUpdate = await prisma.subscriptionInvoice.updateMany({
      where: { id: invoice.id, status: { not: "PAID" } },
      data: { status: "PAID", paidAt: new Date() },
    });
    if (invoiceUpdate.count === 0) {
      // خسرنا سباق التزامن لصالح استدعاء آخر (webhook + verify-payment معاً)
      return { applied: true, changed: false, invoiceStatus: "PAID", subscriptionStatus: sub.status };
    }

    const cycleDays = CYCLE_DAYS[invoice.billingCycle] ?? 30;
    const base = sub.endDate && sub.endDate > new Date() ? sub.endDate : new Date();
    const newEndDate = new Date(base.getTime() + cycleDays * 24 * 60 * 60 * 1000);

    await prisma.storeSubscription.update({
      where: { id: sub.id },
      data: {
        plan: invoice.plan,
        billingCycle: invoice.billingCycle,
        status: "ACTIVE",
        endDate: newEndDate,
        pricePerMonth: invoice.billingCycle === "yearly" ? invoice.amount / 12 : invoice.amount,
        lastPaymentFailedAt: null,
        gracePeriodEndsAt: null,
        suspendedAt: null,
        reactivatedAt: wasSuspended ? new Date() : sub.reactivatedAt,
        cancelledAt: null,
        cancelReason: null,
      },
    });

    await notifyPaymentOutcome({
      userId: sub.store.userId,
      storeNameAr: sub.store.nameAr,
      plan: invoice.plan,
      kind: wasFirstActivation ? "activated" : wasSuspended ? "reactivated" : "renewed",
    });

    return { applied: true, changed: true, invoiceStatus: "PAID", subscriptionStatus: "ACTIVE" };
  }

  if (moyasarStatus === "failed" || moyasarStatus === "voided" || moyasarStatus === "abandoned" || moyasarStatus === "expired" || moyasarStatus === "canceled") {
    if (invoice.status === "FAILED") {
      return { applied: true, changed: false, invoiceStatus: invoice.status, subscriptionStatus: sub.status };
    }
    const result = await prisma.subscriptionInvoice.updateMany({
      where: { id: invoice.id, status: { not: "PAID" } }, // فاتورة مدفوعة مسبقاً لا تُنقَل لفاشلة أبداً
      data: { status: "FAILED" },
    });
    if (result.count === 0) {
      return { applied: true, changed: false, invoiceStatus: invoice.status, subscriptionStatus: sub.status };
    }

    createNotification({
      userId: sub.store.userId,
      type: "PAYMENT",
      titleAr: wasFirstActivation ? "تعذّر إتمام الاشتراك" : "فشلت عملية دفع الاشتراك",
      bodyAr: wasFirstActivation
        ? `لم تكتمل عملية دفع اشتراك متجرك "${sub.store.nameAr}" — يمكنك المحاولة مجدداً من صفحة الباقات`
        : `فشلت محاولة تجديد/ترقية اشتراك متجرك "${sub.store.nameAr}" — يمكنك المحاولة مجدداً في أي وقت`,
      data: { subscriptionInvoiceId: invoice.id },
    }).catch(() => {});

    return { applied: true, changed: true, invoiceStatus: "FAILED", subscriptionStatus: sub.status };
  }

  // initiated | authorized | verified وغيرها: لا تُغيّر شيئاً بعد
  return { applied: true, changed: false, invoiceStatus: invoice.status, subscriptionStatus: sub.status };
}

const PLAN_LABELS_AR: Record<SubscriptionPlan, string> = {
  FREE: "بسطة بداية",
  STARTER: "بسطة نمو",
  GROWTH: "بسطة انطلاق",
  PRO: "بسطة ازدهار",
};

async function notifyPaymentOutcome(params: {
  userId: string;
  storeNameAr: string;
  plan: SubscriptionPlan;
  kind: "activated" | "reactivated" | "renewed";
}) {
  const planLabel = PLAN_LABELS_AR[params.plan];
  const titles: Record<typeof params.kind, { title: string; body: string }> = {
    activated: { title: "تم تفعيل اشتراكك! 🎉", body: `متجرك "${params.storeNameAr}" الآن على باقة ${planLabel}` },
    reactivated: { title: "تم إعادة تفعيل متجرك ✓", body: `اشتراك "${params.storeNameAr}" نشط مجدداً على باقة ${planLabel} — متجرك ظاهر للعملاء الآن` },
    renewed: { title: "تم تجديد اشتراكك", body: `جُدِّد اشتراك "${params.storeNameAr}" بنجاح على باقة ${planLabel}` },
  };
  const { title, body } = titles[params.kind];
  await createNotification({
    userId: params.userId,
    type: "PAYMENT",
    titleAr: title,
    bodyAr: body,
    data: { plan: params.plan },
  }).catch(() => {});
}
