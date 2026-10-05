// app/api/marketing/overview/route.ts
// ملخص "التسويق والتحليلات" الحقيقي لمتجر التاجر — بلا أي رقم وهمي: كل شيء
// هنا مُجمَّع فعلياً من AnalyticsEvent. مقياس بلا أحداث مسجَّلة = صفر حقيقي
// (وليس رقماً ملفَّقاً)، والفرونت يعرض "لا بيانات بعد" بدل اختلاق قيمة.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";

// ⚠️ كان today:1 يُنتج نطاقاً بالخطأ يشمل أمس واليوم معاً (طرح يوم ثم تصفير
// الساعة = منتصف ليلة أمس لا اليوم). today:0 يعني "بلا طرح أيام" فيصبح
// since = اليوم 00:00 فعلاً.
const RANGE_DAYS: Record<string, number> = { today: 0, "7d": 7, "30d": 30 };

export async function GET(req: NextRequest) {
  try {
    const { storeId } = await requireActiveStore();
    const range = req.nextUrl.searchParams.get("range") ?? "7d";
    const days = RANGE_DAYS[range] ?? 7;
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const events = await prisma.analyticsEvent.findMany({
      where: { storeId, createdAt: { gte: since } },
      select: { type: true, utmSource: true, amount: true },
    });

    const counts: Record<string, number> = {};
    let revenue = 0;
    const bySource = new Map<string, { visits: number; orders: number; revenue: number }>();

    for (const e of events) {
      counts[e.type] = (counts[e.type] ?? 0) + 1;
      if (e.type === "ORDER_PAID") revenue += e.amount ?? 0;

      const key = e.utmSource?.trim().toLowerCase() || "مباشر";
      const row = bySource.get(key) ?? { visits: 0, orders: 0, revenue: 0 };
      if (e.type === "STORE_VIEW" || e.type === "PRODUCT_VIEW") row.visits += 1;
      if (e.type === "ORDER_CREATED") row.orders += 1;
      if (e.type === "ORDER_PAID") row.revenue += e.amount ?? 0;
      bySource.set(key, row);
    }

    const views = (counts.STORE_VIEW ?? 0) + (counts.PRODUCT_VIEW ?? 0);
    const orders = counts.ORDER_CREATED ?? 0;

    return NextResponse.json({
      range,
      since: since.toISOString(),
      overview: {
        views,
        productClicks: counts.PRODUCT_CLICK ?? 0,
        addToCart: counts.ADD_TO_CART ?? 0,
        checkoutStarted: counts.CHECKOUT_STARTED ?? 0,
        orders,
        revenue,
        conversionRate: views > 0 ? Number(((orders / views) * 100).toFixed(1)) : 0,
      },
      sources: [...bySource.entries()]
        .map(([source, v]) => ({ source, ...v }))
        .sort((a, b) => b.visits - a.visits),
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/marketing/overview]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
