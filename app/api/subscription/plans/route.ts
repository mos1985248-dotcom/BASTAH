// app/api/subscription/plans/route.ts
// عام (بلا مصادقة) — يستبدل components/pricing/plans-data.ts الثابت
// بمصدر حقيقة واحد من قاعدة البيانات. هذا يمنع بالضبط ما طُلب تفاديه:
// "خطة تظهر للمستخدم ولا يستطيع النظام تنفيذها" أو "سعر ثابت غير مرتبط
// بالخطة الفعلية".

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const plans = await prisma.subscriptionPlanConfig.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: "asc" },
  });
  return NextResponse.json({ plans });
}
