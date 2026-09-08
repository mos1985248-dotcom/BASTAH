// app/api/daftari/entries/route.ts
// ⚠️ Endpoint جديد بالكامل — يفعّل موديل DaftariEntry الموجود أصلاً بدون
// أي كود يكتب فيه سابقاً. مقصود بسيط عمداً: تسجيل يدوي فقط (SALE تلقائي
// من الطلبات لاحقاً إذا احتجناه — خارج نطاق هذي المرحلة).

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { z } from "zod";

const createEntrySchema = z.object({
  type: z.enum(["SALE", "EXPENSE", "REFUND", "WITHDRAWAL", "ADJUSTMENT"]),
  amount: z.coerce.number().positive(),
  expenseCategory: z.enum(["RAW_MATERIALS", "SHIPPING", "PACKAGING", "MARKETING", "PLATFORM_FEE", "OTHER"]).optional(),
  description: z.string().trim().max(300).optional(),
  note: z.string().trim().max(300).optional(),
});

async function requireStarterOrAbove(storeId: string) {
  const sub = await prisma.storeSubscription.findUnique({ where: { storeId }, select: { plan: true } });
  if (!sub || sub.plan === "FREE") {
    throw new AuthError("دفاتري متاحة من باقة بسطة نمو فما فوق — رقّي باقتك لاستخدامها", 403);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user.store) return NextResponse.json({ error: "لا يوجد متجر مرتبط بحسابك" }, { status: 403 });
    await requireStarterOrAbove(user.store.id);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Number(searchParams.get("limit") ?? 20));

    const [entries, total] = await Promise.all([
      prisma.daftariEntry.findMany({
        where: { storeId: user.store.id },
        orderBy: { entryDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.daftariEntry.count({ where: { storeId: user.store.id } }),
    ]);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEntries = await prisma.daftariEntry.findMany({ where: { storeId: user.store.id, entryDate: { gte: monthStart } } });

    const income = monthEntries.filter((e) => e.type === "SALE").reduce((s, e) => s + e.amount, 0);
    const expenses = monthEntries.filter((e) => e.type === "EXPENSE").reduce((s, e) => s + e.amount, 0);
    const refunds = monthEntries.filter((e) => e.type === "REFUND").reduce((s, e) => s + e.amount, 0);

    return NextResponse.json({
      entries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      monthSummary: { income, expenses, refunds, netProfit: income - expenses - refunds },
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/daftari/entries]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب دفاتري" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user.store) return NextResponse.json({ error: "لا يوجد متجر مرتبط بحسابك" }, { status: 403 });
    await requireStarterOrAbove(user.store.id);

    const parsed = createEntrySchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

    const entry = await prisma.daftariEntry.create({
      data: { storeId: user.store.id, isManual: true, ...parsed.data },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/daftari/entries]", err);
    return NextResponse.json({ error: "تعذّرت إضافة القيد" }, { status: 500 });
  }
}
