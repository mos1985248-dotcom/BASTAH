// GET — كشف حساب مندوب لفترة (from/to) أو لشهر؛ ?format=csv للتصدير.
import { NextResponse } from "next/server";
import { adminRoute, csvResponse, monthFromUrl } from "@/lib/finance/http";
import { courierStatementCsv } from "@/lib/finance/exports";
import { monthRangeUtc } from "@/lib/finance/riyadh";
import { courierStatement } from "@/lib/finance/statement";
import { FinanceError } from "@/lib/finance/tx";

export const dynamic = "force-dynamic";

export const GET = adminRoute<{ id: string }>(async ({ req, params }) => {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const range = from && to ? { start: new Date(from), end: new Date(to) } : monthRangeUtc(monthFromUrl(url));
  if (Number.isNaN(range.start.getTime()) || Number.isNaN(range.end.getTime()) || range.end <= range.start) throw new FinanceError("الفترة غير صالحة");
  const statement = await courierStatement(params.id, range.start, range.end);
  if (!statement) throw new FinanceError("المندوب غير موجود", 404);
  if (url.searchParams.get("format") === "csv") return csvResponse(courierStatementCsv(statement.lines), `courier-statement-${params.id}.csv`);
  return NextResponse.json(statement);
});
