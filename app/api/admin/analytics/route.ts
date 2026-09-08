// app/api/admin/analytics/route.ts
// GMV / MRR / ARR / churn / active sellers / failed payments — كلها من قاعدة البيانات الحقيقية.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");

    const now     = new Date();
    const month1  = new Date(now.getFullYear(), now.getMonth(), 1);          // بداية الشهر الحالي
    const month3  = new Date(now.getFullYear(), now.getMonth() - 3, 1);      // 3 أشهر
    const month12 = new Date(now.getFullYear() - 1, now.getMonth(), 1);      // سنة

    // ── GMV (Gross Merchandise Value) ────────────────────
    const [gmvThisMonth, gmvAllTime] = await Promise.all([
      prisma.order.aggregate({
        where: { paymentStatus: "PAID", createdAt: { gte: month1 } },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      }),
    ]);

    // ── MRR (Monthly Recurring Revenue) = اشتراكات شهر الحالي ──
    // نجمع رسوم الباقات المدفوعة هذا الشهر فقط
    const paidInvoicesThisMonth = await prisma.subscriptionInvoice.aggregate({
      where: { status: "PAID", paidAt: { gte: month1 } },
      _sum: { amount: true },
    });
    const mrr = paidInvoicesThisMonth._sum.amount ?? 0;
    const arr = mrr * 12;

    // ── Active Sellers (متاجر نشطة + اشتراك سليم) ────────
    const activeSellers = await prisma.store.count({
      where: {
        status: "ACTIVE",
        subscription: { status: { in: ["ACTIVE", "TRIAL", "GRACE_PERIOD"] } },
      },
    });

    // ── Churn: متاجر ألغت أو انتهت اشتراكاتها آخر 30 يوم ──
    const month30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const churnedThisMonth = await prisma.storeSubscription.count({
      where: {
        status: { in: ["CANCELLED", "EXPIRED"] },
        updatedAt: { gte: month30 },
      },
    });

    // ── Failed Payments (فواتير متأخرة/فاشلة) ────────────
    const failedPayments = await prisma.subscriptionInvoice.count({
      where: { status: { in: ["PENDING"] }, dueDate: { lt: now } },
    });
    const failedPaymentsAmount = await prisma.subscriptionInvoice.aggregate({
      where: { status: { in: ["PENDING"] }, dueDate: { lt: now } },
      _sum: { amount: true },
    });

    // ── Orders stats ──────────────────────────────────────
    const [ordersThisMonth, ordersTotal, pendingOrders] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: month1 } } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } } }),
    ]);

    // ── AI Usage cost estimate (last 30 days) ────────────
    const aiCost = await prisma.aIUsage.aggregate({
      where: { createdAt: { gte: month30 } },
      _sum: { estimatedCostUsd: true },
    });

    // ── Plan distribution ─────────────────────────────────
    const planDistribution = await prisma.storeSubscription.groupBy({
      by: ["plan"],
      _count: true,
      where: { status: { in: ["ACTIVE", "TRIAL", "GRACE_PERIOD"] } },
    });

    return NextResponse.json({
      gmv: {
        thisMonth: gmvThisMonth._sum.total ?? 0,
        allTime:   gmvAllTime._sum.total ?? 0,
      },
      mrr,
      arr,
      activeSellers,
      churnedThisMonth,
      failedPayments: {
        count:  failedPayments,
        amount: failedPaymentsAmount._sum.amount ?? 0,
      },
      orders: {
        thisMonth: ordersThisMonth,
        total:     ordersTotal,
        pending:   pendingOrders,
      },
      aiCostUsd30d: aiCost._sum.estimatedCostUsd ?? 0,
      planDistribution: planDistribution.map((p) => ({
        plan: p.plan,
        count: p._count,
      })),
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[admin/analytics]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب الإحصاءات" }, { status: 500 });
  }
}
