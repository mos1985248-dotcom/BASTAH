// app/api/subscription/checkout/route.ts
// يبدأ عملية دفع لتغيير/تجديد باقة المتجر. لا يُفعِّل أي شيء بنفسه —
// فقط يُنشئ SubscriptionInvoice(PENDING) + Moyasar Invoice، ويرجع رابط
// الدفع. التفعيل الفعلي يحدث حصراً عبر webhook أو verify-payment، بعد
// تأكيد Moyasar الفعلي — أبداً بمجرد نجاح هذا الطلب.
//
// downgrade (باقة أرخص من الحالية): فوري بلا دفع — تخفيض تكلفة لا يحتاج
// تحصيلاً. upgrade/renewal (باقة أغلى أو مساوية): يتطلب دفعاً فعلياً.
// هذا قرار تصميم اتخذته بغياب أي منطق proration مصمَّم مسبقاً — لا استرداد
// جزئي، ولا احتساب فرق تلقائي؛ التخفيض يُطبَّق مباشرة على السعر الحالي.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { createMoyasarInvoice, MoyasarError, toHalalas } from "@/lib/moyasar";
import { z } from "zod";
import type { SubscriptionPlan } from "@prisma/client";

const checkoutSchema = z.object({
  plan: z.enum(["FREE", "STARTER", "GROWTH", "PRO"]),
  billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
});

const PLAN_RANK: Record<SubscriptionPlan, number> = { FREE: 0, STARTER: 1, GROWTH: 2, PRO: 3 };

export async function POST(req: NextRequest) {
  try {
    const { user, storeId } = await requireActiveStore();

    const parsed = checkoutSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
    }
    const { plan: targetPlan, billingCycle } = parsed.data;

    const [planConfig, subscription] = await Promise.all([
      prisma.subscriptionPlanConfig.findUnique({ where: { plan: targetPlan } }),
      prisma.storeSubscription.findUnique({ where: { storeId }, include: { store: { select: { nameAr: true } } } }),
    ]);

    if (!planConfig || !planConfig.isActive) {
      return NextResponse.json({ error: "هذه الباقة غير متاحة حالياً" }, { status: 422 });
    }
    if (!subscription) {
      return NextResponse.json({ error: "لا يوجد اشتراك مرتبط بمتجرك" }, { status: 404 });
    }

    const currentRank = PLAN_RANK[subscription.plan];
    const targetRank = PLAN_RANK[targetPlan];
    const isDowngrade = targetRank < currentRank;
    const isSameActivePlan = targetPlan === subscription.plan && subscription.status === "ACTIVE" && billingCycle === subscription.billingCycle;

    if (isSameActivePlan) {
      return NextResponse.json({ error: "أنتِ مشتركة بالفعل بهذه الباقة" }, { status: 409 });
    }

    // ── تخفيض الباقة: فوري بلا دفع ─────────────────────────
    if (isDowngrade) {
      const updated = await prisma.storeSubscription.update({
        where: { id: subscription.id },
        data: {
          plan: targetPlan,
          billingCycle,
          pricePerMonth: billingCycle === "yearly" ? planConfig.priceYearly / 12 : planConfig.priceMonthly,
          status: "ACTIVE",
          lastPaymentFailedAt: null,
          gracePeriodEndsAt: null,
          suspendedAt: null,
        },
      });
      return NextResponse.json({ requiresPayment: false, subscription: { plan: updated.plan, status: updated.status } });
    }

    // ── ترقية/تجديد: يتطلب دفعاً فعلياً ─────────────────────
    if (!process.env.PLATFORM_MOYASAR_SECRET_KEY) {
      return NextResponse.json({ error: "بوابة دفع المنصة غير مُهيَّأة حالياً — تواصلي مع الدعم" }, { status: 503 });
    }

    const amount = billingCycle === "yearly" ? planConfig.priceYearly : planConfig.priceMonthly;
    const now = new Date();
    const periodYear = now.getFullYear();
    const periodMonth = now.getMonth() + 1;

    // فاتورة معلَّقة سابقة لنفس الفترة (نفس الشهر التقويمي)؟ أعيدي استخدامها
    // بدل فاتورة جديدة — يمنع تكرار الفواتير عند إعادة محاولة الدفع
    const existingPending = await prisma.subscriptionInvoice.findUnique({
      where: { subscriptionId_periodYear_periodMonth: { subscriptionId: subscription.id, periodYear, periodMonth } },
    });
    if (existingPending?.status === "PAID") {
      return NextResponse.json({ error: "تم دفع اشتراك هذا الشهر بالفعل — أي تغيير إضافي يصبح فعّالاً الشهر القادم" }, { status: 409 });
    }

    const dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // خلال 24 ساعة

    const invoice = existingPending
      ? await prisma.subscriptionInvoice.update({
          where: { id: existingPending.id },
          data: { plan: targetPlan, billingCycle, amount, dueDate },
        })
      : await prisma.subscriptionInvoice.create({
          data: {
            subscriptionId: subscription.id,
            plan: targetPlan,
            billingCycle,
            amount,
            periodYear,
            periodMonth,
            dueDate,
            status: "PENDING",
          },
        });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    try {
      const moyasarInvoice = await createMoyasarInvoice({
        secretKey: process.env.PLATFORM_MOYASAR_SECRET_KEY,
        amountHalalas: toHalalas(amount),
        description: `اشتراك بسطة — ${planConfig.nameAr} (${billingCycle === "yearly" ? "سنوي" : "شهري"}) — متجر ${subscription.store.nameAr}`,
        successUrl: `${appUrl}/dashboard/subscription/return?invoiceId=${invoice.id}`,
        metadata: { subscriptionInvoiceId: invoice.id, storeId, userId: user.id },
      });

      await prisma.subscriptionInvoice.update({
        where: { id: invoice.id },
        data: { moyasarTxnId: moyasarInvoice.id },
      });

      return NextResponse.json({ requiresPayment: true, invoiceId: invoice.id, paymentUrl: moyasarInvoice.url });
    } catch (err) {
      if (err instanceof MoyasarError) {
        return NextResponse.json({ error: "تعذّر إنشاء عملية الدفع الآن — حاولي مجدداً" }, { status: 502 });
      }
      throw err;
    }
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/subscription/checkout]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
