// app/api/stores/shipping-zones/route.ts
// CRUD مناطق الشحن — مقصورة على متجر التاجر الحالي فقط (requireActiveStore
// لا تقبل storeId من الطلب إطلاقاً، فلا مجال لإدارة تاجر لمنطقة متجر آخر).

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { createShippingZoneSchema, formatZodError } from "@/lib/validation";

export async function GET() {
  try {
    const { storeId } = await requireActiveStore();
    const zones = await prisma.shippingZone.findMany({ where: { storeId }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ zones });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/stores/shipping-zones]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { storeId } = await requireActiveStore();
    const parsed = createShippingZoneSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

    const zone = await prisma.shippingZone.create({ data: { storeId, ...parsed.data } });
    return NextResponse.json({ zone }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/stores/shipping-zones]", err);
    return NextResponse.json({ error: "تعذّر إنشاء المنطقة" }, { status: 500 });
  }
}
