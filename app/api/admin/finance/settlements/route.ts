// GET (سجل التسويات) / POST (تسجيل تسوية: دفعة مندوب أو تحصيل بسطة). تسجيل ومتابعة فقط.
import { NextResponse } from "next/server";
import { adminRoute, monthFromUrl, parseBody } from "@/lib/finance/http";
import { monthRangeUtc } from "@/lib/finance/riyadh";
import { listSettlements, recordSettlement, settlementSchema } from "@/lib/finance/settlements-service";
import type { SettlementKind } from "@/lib/finance/types";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async ({ req }) => {
  const url = new URL(req.url);
  const { start, end } = monthRangeUtc(monthFromUrl(url));
  const kind = url.searchParams.get("kind") as SettlementKind | null;
  const partyRef = url.searchParams.get("partyRef");
  return NextResponse.json({ settlements: await listSettlements({ kind: kind ?? undefined, partyRef: partyRef ?? undefined, from: start, to: end }) });
});

export const POST = adminRoute(async ({ user, req }) => {
  const input = await parseBody(req, settlementSchema);
  const { settlement, duplicate } = await recordSettlement(user.id, input);
  return NextResponse.json({ settlement, duplicate }, { status: duplicate ? 200 : 201 });
});
