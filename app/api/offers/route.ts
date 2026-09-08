// app/api/offers/route.ts
// ⚠️ إضافي فقط — يقرأ من موديل Coupon الموجود أصلاً (لم يكن له أي route
// عام لعرضه للمشترين). يُرجع فقط الكوبونات الفعّالة وغير المنتهية، وبدون
// أي حقول حساسة (لا storeId داخلي، لا usedCount تفصيلي لغير صاحب المتجر).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
        minOrderAmt: true,
        expiresAt: true,
        store: { select: { nameAr: true, slug: true, logo: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    });

    return NextResponse.json({ coupons });
  } catch (err) {
    console.error("[GET /api/offers]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب العروض" }, { status: 500 });
  }
}
