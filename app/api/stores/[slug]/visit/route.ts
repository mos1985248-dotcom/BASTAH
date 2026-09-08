// app/api/stores/[slug]/visit/route.ts
// ⚠️ Endpoint جديد بالكامل — يفعّل موديل StoreAnalytics الموجود أصلاً
// بالـ schema بدون أي كود يكتب فيه سابقاً. عام (بدون مصادقة، أي زائر
// يُحتسب)، بسيط عمداً حسب الطلب: عدّاد + كوكي منع تكرار لمدة 24 ساعة،
// بدون أي نظام Analytics معقّد.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { slug: string };
}

function todayDateOnly(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const store = await prisma.store.findUnique({ where: { slug: params.slug }, select: { id: true } });
    if (!store) return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });

    const cookieName = `basita_v_${store.id}`;
    const alreadyVisitedToday = Boolean(req.cookies.get(cookieName));
    const date = todayDateOnly();

    await prisma.storeAnalytics.upsert({
      where: { storeId_date: { storeId: store.id, date } },
      create: { storeId: store.id, date, visits: 1, uniqueVisits: alreadyVisitedToday ? 0 : 1 },
      update: {
        visits: { increment: 1 },
        ...(alreadyVisitedToday ? {} : { uniqueVisits: { increment: 1 } }),
      },
    });

    const res = NextResponse.json({ success: true });
    if (!alreadyVisitedToday) {
      res.cookies.set(cookieName, "1", { maxAge: 60 * 60 * 24, path: "/", sameSite: "lax" });
    }
    return res;
  } catch (err) {
    // فشل تسجيل الزيارة ما يجب يكسر تجربة تصفّح المتجر — نتجاهل بصمت
    console.error("[POST /api/stores/:slug/visit]", err);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
