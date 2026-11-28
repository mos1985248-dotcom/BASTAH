import { getFeature } from "@/lib/entitlements";
import { readPlatformSales } from "@/lib/daftari/platform-sales";
import { monthRangeUtc, riyadhMonthOf } from "@/lib/finance/riyadh";
import { toMinor, fromMinor } from "@/lib/finance/money";
import { assertStoreFeature } from "@/lib/feature-access";
// Manual ledger and separate, order-derived sales summary.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { z } from "zod";

const createEntrySchema = z.object({
  type: z.enum(["SALE", "EXPENSE", "REFUND", "WITHDRAWAL", "ADJUSTMENT"]),
  amount: z.number().finite().positive().max(100000000).refine(n => Math.abs(n * 100 - Math.round(n * 100)) < 0.00001, "خانتان عشريتان كحد أقصى"),
  expenseCategory: z.enum(["RAW_MATERIALS", "SHIPPING", "PACKAGING", "MARKETING", "PLATFORM_FEE", "OTHER"]).optional(),
  description: z.string().trim().max(300).optional(),
  note: z.string().trim().max(300).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole("SELLER");
    if (!user.store) return NextResponse.json({ error: "لا يوجد متجر مرتبط بحسابك" }, { status: 403 });
    await assertStoreFeature(user.store.id, "daftari");

    const { searchParams } = new URL(req.url);
    const paginationInput = z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), limit: z.coerce.number().int().min(1).max(50).default(20) }).safeParse(Object.fromEntries(searchParams));
    if (!paginationInput.success) return NextResponse.json({ error: "بيانات الصفحة غير صالحة" }, { status: 400 });
    const { page, limit } = paginationInput.data;

    const [entries, total] = await Promise.all([
      prisma.daftariEntry.findMany({
        where: { storeId: user.store.id, orderId: null, isManual: true },
        orderBy: { entryDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.daftariEntry.count({ where: { storeId: user.store.id, orderId: null, isManual: true } }),
    ]);

    const period = riyadhMonthOf(new Date());
    const { start: monthStart, end: monthEnd } = monthRangeUtc(period);
    const [monthEntries, platform, reports, advanced] = await Promise.all([
      prisma.daftariEntry.findMany({ where: { storeId: user.store.id, entryDate: { gte: monthStart, lt: monthEnd }, orderId: null, isManual: true } }),
      readPlatformSales(prisma, user.store.id, monthStart, monthEnd),
      getFeature(user.store.id, "daftari_reports"),
      getFeature(user.store.id, "daftari_advanced"),
    ]);
    const sumType = (type: string) => fromMinor(monthEntries.filter(e=>e.type===type).reduce((s,e)=>s+(toMinor(e.amount)??0),0));
    const income = sumType("SALE"), expenses = sumType("EXPENSE"), refunds = sumType("REFUND");
    return NextResponse.json({
      platform,
      capabilities: { reports: reports.allowed, advanced: advanced.allowed && reports.allowed },
      entries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      monthSummary: { income, expenses, refunds, netProfit: fromMinor((toMinor(income)??0)-(toMinor(expenses)??0)-(toMinor(refunds)??0)) },
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/daftari/entries]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب دفاتري" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole("SELLER");
    if (!user.store) return NextResponse.json({ error: "لا يوجد متجر مرتبط بحسابك" }, { status: 403 });
    await assertStoreFeature(user.store.id, "daftari");

    const parsed = createEntrySchema.safeParse(await req.json().catch(() => null));
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
