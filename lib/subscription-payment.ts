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
  moyasarStatus: string,
  providerInvoiceId: string
): Promise<SubscriptionPaymentResult> {
  const invoice = await prisma.subscriptionInvoice.findUnique({
    where: { id: invoiceId },
    include: {
      subscription: { include: { store: { select: { id: true, userId: true, nameAr: true } } } },
    },
  });
  if (!invoice || invoice.moyasarTxnId !== providerInvoiceId) return { applied: false, changed: false, invoiceStatus: "", subscriptionStatus: "" };

  const sub = invoice.subscription;
  const wasFirstActivation = sub.status === "TRIAL" || (sub.plan === "FREE" && invoice.plan !== "FREE");

  if (moyasarStatus === "paid" || moyasarStatus === "captured") {
    if (invoice.status === "PAID") {
      return { applied: true, changed: false, invoiceStatus: invoice.status, subscriptionStatus: sub.status };
    }

    const activation = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM store_subscriptions WHERE id = ${sub.id} FOR UPDATE`;
      const invoiceUpdate = await tx.subscriptionInvoice.updateMany({
        where: { id: invoice.id, moyasarTxnId: providerInvoiceId, status: { not: "PAID" } },
        data: { status: "PAID", paidAt: new Date() },
      });
      if (invoiceUpdate.count === 0) return null;

      const current = await tx.storeSubscription.findUniqueOrThrow({ where: { id: sub.id } });
      const first = current.status === "TRIAL" || (current.plan === "FREE" && invoice.plan !== "FREE");
      const suspended = current.status === "SUSPENDED" || current.status === "GRACE_PERIOD" || current.status === "EXPIRED";
      const now = new Date();
      const base = current.endDate && current.endDate > now ? current.endDate : now;
      const days = CYCLE_DAYS[invoice.billingCycle] ?? 30;
      await tx.storeSubscription.update({
        where: { id: sub.id },
        data: {
          plan: invoice.plan,
          billingCycle: invoice.billingCycle,
          status: "ACTIVE",
          endDate: new Date(base.getTime() + days * 24 * 60 * 60 * 1000),
          pricePerMonth: invoice.billingCycle === "yearly" ? invoice.amount / 12 : invoice.amount,
          lastPaymentFailedAt: null,
          gracePeriodEndsAt: null,
          suspendedAt: null,
          reactivatedAt: suspended ? now : current.reactivatedAt,
          cancelledAt: null,
          cancelReason: null,
        },
      });
      return { kind: first ? "activated" : suspended ? "reactivated" : "renewed" } as const;
    });
    if (!activation) {
      const fresh = await prisma.subscriptionInvoice.findUnique({
        where: { id: invoice.id },
        select: { status: true, moyasarTxnId: true, subscription: { select: { status: true } } },
      });
      return {
        applied: fresh?.moyasarTxnId === providerInvoiceId,
        changed: false,
        invoiceStatus: fresh?.status ?? "",
        subscriptionStatus: fresh?.subscription.status ?? "",
      };
    }

    await notifyPaymentOutcome({
      userId: sub.store.userId,
      storeNameAr: sub.store.nameAr,
      plan: invoice.plan,
      kind: activation.kind,
    });

    return { applied: true, changed: true, invoiceStatus: "PAID", subscriptionStatus: "ACTIVE" };
  }

  if (moyasarStatus === "failed" || moyasarStatus === "voided" || moyasarStatus === "abandoned" || moyasarStatus === "expired" || moyasarStatus === "canceled") {
    if (invoice.status === "FAILED") {
      return { applied: true, changed: false, invoiceStatus: invoice.status, subscriptionStatus: sub.status };
    }
    const result = await prisma.subscriptionInvoice.updateMany({
      where: { id: invoice.id, moyasarTxnId: providerInvoiceId, status: { notIn: ["PAID", "FAILED"] } },
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
  FREE: "بسطة مارت بداية",
  STARTER: "بسطة مارت نمو",
  GROWTH: "بسطة مارت انطلاق",
  PRO: "بسطة مارت ازدهار",
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
