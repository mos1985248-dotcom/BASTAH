// POST — إلغاء ناعم لمصروف بسبب موثَّق (يبقى السجل مُلغى ولا يدخل الحسابات). لا حذف فعلي.
import { NextResponse } from "next/server";
import { z } from "zod";
import { voidExpense } from "@/lib/finance/expenses-service";
import { adminRoute, parseBody } from "@/lib/finance/http";

export const POST = adminRoute<{ id: string }>(async ({ user, req, params }) => {
  const { reason } = await parseBody(req, z.object({ reason: z.string().trim().min(3, "سبب الإلغاء مطلوب") }));
  return NextResponse.json({ expense: await voidExpense(user.id, params.id, reason) });
});
