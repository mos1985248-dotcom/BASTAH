// GET (استردادات الشهر) / POST (تسجيل استرداد جزئي أو كامل لفاتورة اشتراك).
import { NextResponse } from "next/server";
import { adminRoute, monthFromUrl, parseBody } from "@/lib/finance/http";
import { listRefunds, recordRefund, refundSchema } from "@/lib/finance/refunds-service";
import { monthRangeUtc } from "@/lib/finance/riyadh";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async ({ req }) => {
  const { start, end } = monthRangeUtc(monthFromUrl(new URL(req.url)));
  return NextResponse.json({ refunds: await listRefunds(start, end) });
});

export const POST = adminRoute(async ({ user, req }) => {
  const input = await parseBody(req, refundSchema);
  const { refund, duplicate } = await recordRefund(user.id, input);
  return NextResponse.json({ refund, duplicate }, { status: duplicate ? 200 : 201 });
});
