// app/api/subscription/route.ts
// بيانات اشتراك المتجر الحالي + آخر فواتيره — للوحة التاجر.
// قراءة فقط — أي تغيير حالة/باقة يمر حصراً عبر checkout ثم webhook/verify-payment.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    const { storeId } = await requireActiveStore();

    const subscription = await prisma.storeSubscription.findUnique({
      where: { storeId },
      include: {
        invoices: { orderBy: { createdAt: "desc" }, take: 12 },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: "لا يوجد اشتراك مرتبط بمتجرك" }, { status: 404 });
    }

    const planConfig = await prisma.subscriptionPlanConfig.findUnique({ where: { plan: subscription.plan } });

    return NextResponse.json({
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        gracePeriodEndsAt: subscription.gracePeriodEndsAt,
        suspendedAt: subscription.suspendedAt,
        pricePerMonth: subscription.pricePerMonth,
      },
      planConfig,
      invoices: subscription.invoices,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/subscription]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
