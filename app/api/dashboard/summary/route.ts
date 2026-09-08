// app/api/dashboard/summary/route.ts
// ⚠️ Endpoint جديد بالكامل، إضافي فقط — يُجمِّع بيانات حقيقية من Order،
// Product، وStoreAnalytics (المُفعَّل حديثاً). نفس نمط
// /api/admin/analytics تماماً لكن بنطاق متجر التاجر الحالي فقط.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET() {
  try {
    const user = await requireUser();
    if (!user.store) {
      return NextResponse.json({ error: "لا يوجد متجر مرتبط بحسابك" }, { status: 403 });
    }
    const storeId = user.store.id;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const days30Ago = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const days60Ago = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      salesThisMonth,
      salesLastMonth,
      ordersThisMonth,
      ordersLastMonth,
      totalProductsNow,
      productsBefore30d,
      visitsLast30d,
      visitsPrev30d,
      store,
      recentOrdersRaw,
      last7DaysOrders,
    ] = await Promise.all([
      prisma.order.aggregate({ where: { storeId, paymentStatus: "PAID", createdAt: { gte: monthStart } }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { storeId, paymentStatus: "PAID", createdAt: { gte: lastMonthStart, lt: monthStart } }, _sum: { total: true } }),
      prisma.order.count({ where: { storeId, createdAt: { gte: monthStart } } }),
      prisma.order.count({ where: { storeId, createdAt: { gte: lastMonthStart, lt: monthStart } } }),
      prisma.product.count({ where: { storeId, status: "ACTIVE" } }),
      prisma.product.count({ where: { storeId, status: "ACTIVE", createdAt: { lt: days30Ago } } }),
      prisma.storeAnalytics.aggregate({ where: { storeId, date: { gte: days30Ago } }, _sum: { visits: true } }),
      prisma.storeAnalytics.aggregate({ where: { storeId, date: { gte: days60Ago, lt: days30Ago } }, _sum: { visits: true } }),
      prisma.store.findUnique({ where: { id: storeId }, select: { avgRating: true, totalReviews: true } }),
      prisma.order.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true, orderNumber: true, status: true, paymentStatus: true, total: true, createdAt: true,
          buyer: { select: { name: true } },
          items: { select: { nameAr: true }, take: 1 },
        },
      }),
      prisma.order.findMany({
        where: { storeId, paymentStatus: "PAID", createdAt: { gte: sevenDaysAgo } },
        select: { total: true, createdAt: true },
      }),
    ]);

    // تجميع مبيعات آخر 7 أيام يومياً — للرسم البياني
    const dailySales: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      dailySales[d.toISOString().slice(0, 10)] = 0;
    }
    for (const o of last7DaysOrders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (key in dailySales) dailySales[key] += o.total;
    }

    return NextResponse.json({
      totalSales: { value: salesThisMonth._sum.total ?? 0, changePct: pctChange(salesThisMonth._sum.total ?? 0, salesLastMonth._sum.total ?? 0) },
      totalOrders: { value: ordersThisMonth, changePct: pctChange(ordersThisMonth, ordersLastMonth) },
      totalProducts: { value: totalProductsNow, changePct: pctChange(totalProductsNow, productsBefore30d) },
      totalVisitors: { value: visitsLast30d._sum.visits ?? 0, changePct: pctChange(visitsLast30d._sum.visits ?? 0, visitsPrev30d._sum.visits ?? 0) },
      rating: { avg: store?.avgRating ?? 0, count: store?.totalReviews ?? 0 },
      salesTrend: Object.entries(dailySales).map(([date, total]) => ({ date, total })),
      recentOrders: recentOrdersRaw,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/dashboard/summary]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب ملخص لوحة التحكم" }, { status: 500 });
  }
}
