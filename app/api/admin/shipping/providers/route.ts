// app/api/admin/shipping/providers/route.ts
// ⚠️ Endpoint جديد بالكامل (إضافي، قراءة فقط) — الموافَق عليه صراحةً.
// يعرض للإدارة الشركات المسجَّلة فعلياً بـregistry.ts + عدد المتاجر
// المرتبطة بكل واحدة (StoreShipping الحقيقي). لا "تفعيل/تعطيل على مستوى
// المنصة" هنا لأن هذا الحقل غير موجود بالسكيما أصلاً — platformActive
// تُعرض دائماً true لأي شركة مسجَّلة بالـRegistry (لا آلية تعليق موجودة
// حالياً، موثَّق بالتقرير المرفق مع هذا التعديل).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { listSupportedCarriers } from "@/lib/shipping/registry";
import { SHIPPING_PROVIDER_METADATA } from "@/lib/shipping/metadata";

export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");

    const carriers = listSupportedCarriers();
    const counts = await prisma.storeShipping.groupBy({
      by: ["carrier"],
      where: { carrier: { in: carriers } },
      _count: { _all: true },
    });
    const countMap = new Map(counts.map((c: { carrier: string; _count: { _all: number } }) => [c.carrier, c._count._all]));

    const providers = carriers.map((carrier) => ({
      carrier,
      displayNameAr: SHIPPING_PROVIDER_METADATA[carrier]?.displayNameAr ?? carrier,
      logoUrl: SHIPPING_PROVIDER_METADATA[carrier]?.logoUrl ?? null,
      capability: SHIPPING_PROVIDER_METADATA[carrier]?.capability ?? "rate_only",
      supported: true, // مسجَّلة فعلياً بالـregistry — بالتعريف
      platformActive: true, // ⚠️ لا آلية تعليق على مستوى المنصة موجودة بعد
      connectedStores: countMap.get(carrier) ?? 0,
    }));

    return NextResponse.json({ providers });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/admin/shipping/providers]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
