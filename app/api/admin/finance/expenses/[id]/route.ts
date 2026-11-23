// PATCH — تعديل موثَّق بسبب. (الإلغاء الناعم في ./void؛ لا حذف فعلي أبداً.)
import { NextResponse } from "next/server";
import { z } from "zod";
import { expensePatchSchema, updateExpense } from "@/lib/finance/expenses-service";
import { adminRoute, parseBody } from "@/lib/finance/http";

export const PATCH = adminRoute<{ id: string }>(async ({ user, req, params }) => {
  const { reason, ...patch } = await parseBody(req, expensePatchSchema.extend({ reason: z.string().trim().min(3, "سبب التعديل مطلوب") }));
  return NextResponse.json({ expense: await updateExpense(user.id, params.id, patch, reason) });
});
