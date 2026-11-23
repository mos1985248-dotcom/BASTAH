// POST — تصحيح استرداد بقيد عكسي موثَّق.
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminRoute, parseBody } from "@/lib/finance/http";
import { reverseRefund } from "@/lib/finance/refunds-service";

export const POST = adminRoute<{ id: string }>(async ({ user, req, params }) => {
  const { reason } = await parseBody(req, z.object({ reason: z.string().trim().min(3, "سبب التصحيح مطلوب") }));
  return NextResponse.json({ reversal: await reverseRefund(user.id, params.id, reason) }, { status: 201 });
});
