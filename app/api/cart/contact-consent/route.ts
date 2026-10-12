// app/api/cart/contact-consent/route.ts
// موافقة المشتري على مشاركة اسمه وجواله مع متجر محدد لتذكيره بسلته.
// GET ?storeId= → { granted }. POST { storeId, granted } → منح/سحب. الافتراضي: لا موافقة.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

const bodySchema = z.object({ storeId: z.string().min(1), granted: z.boolean() });

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const storeId = req.nextUrl.searchParams.get("storeId");
    if (!storeId) return NextResponse.json({ error: "المتجر مطلوب" }, { status: 400 });
    const row = await prisma.cartContactConsent.findUnique({ where: { userId_storeId: { userId: user.id, storeId } } });
    return NextResponse.json({ granted: !!row && row.revokedAt === null });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/cart/contact-consent]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    const { storeId, granted } = parsed.data;

    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { id: true } });
    if (!store) return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });

    const now = new Date();
    if (granted) {
      await prisma.cartContactConsent.upsert({
        where: { userId_storeId: { userId: user.id, storeId } },
        create: { userId: user.id, storeId, grantedAt: now },
        update: { grantedAt: now, revokedAt: null },
      });
    } else {
      await prisma.cartContactConsent.updateMany({ where: { userId: user.id, storeId, revokedAt: null }, data: { revokedAt: now } });
    }
    return NextResponse.json({ granted });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/cart/contact-consent]", err);
    return NextResponse.json({ error: "تعذّر حفظ اختيارك" }, { status: 500 });
  }
}
