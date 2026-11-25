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

import { formatPlatformCopy } from "@/lib/brand";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { MoyasarError } from "@/lib/moyasar";
import { startSubscriptionCheckout, SubscriptionCheckoutError } from "@/lib/subscription-checkout";
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
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
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

    const secretKey = process.env.PLATFORM_MOYASAR_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "بوابة دفع المنصة غير مُهيَّأة حالياً — تواصلي مع الدعم" }, { status: 503 });
    }

    const amount = billingCycle === "yearly" ? planConfig.priceYearly : planConfig.priceMonthly;
    const checkout = await startSubscriptionCheckout({
      subscriptionId: subscription.id,
      storeId,
      userId: user.id,
      targetPlan,
      billingCycle,
      amount,
      description: `اشتراك بسطة مارت — ${formatPlatformCopy(planConfig.nameAr)} (${billingCycle === "yearly" ? "سنوي" : "شهري"}) — متجر ${subscription.store.nameAr}`,
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      secretKey,
      now: new Date(),
    });
    return NextResponse.json(checkout);
  } catch (err) {
    if (err instanceof SubscriptionCheckoutError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof MoyasarError) {
      return NextResponse.json({ error: "تعذّر الوصول إلى بوابة الدفع الآن." }, { status: 502 });
    }
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status }
      );
    }

    console.error("[POST /api/subscription/checkout]", err);

    return NextResponse.json(
      { error: "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}
