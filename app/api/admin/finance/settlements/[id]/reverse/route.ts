// POST — تصحيح تسوية بقيد عكسي موثَّق (لا حذف).
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminRoute, parseBody } from "@/lib/finance/http";
import { reverseSettlement } from "@/lib/finance/settlements-service";

export const POST = adminRoute<{ id: string }>(async ({ user, req, params }) => {
  const { reason } = await parseBody(req, z.object({ reason: z.string().trim().min(3, "سبب التصحيح مطلوب") }));
  return NextResponse.json({ reversal: await reverseSettlement(user.id, params.id, reason) }, { status: 201 });
});
