// GET (قائمة الشهر) / POST (إضافة) مصروفات المنصة.
import { NextResponse } from "next/server";
import { createExpense, expenseCreateSchema, listExpenses } from "@/lib/finance/expenses-service";
import { adminRoute, monthFromUrl, parseBody } from "@/lib/finance/http";
import { monthRangeUtc } from "@/lib/finance/riyadh";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async ({ req }) => {
  const { start, end } = monthRangeUtc(monthFromUrl(new URL(req.url)));
  return NextResponse.json({ expenses: await listExpenses(start, end) });
});

export const POST = adminRoute(async ({ user, req }) => {
  const input = await parseBody(req, expenseCreateSchema);
  return NextResponse.json({ expense: await createExpense(user.id, input) }, { status: 201 });
});
