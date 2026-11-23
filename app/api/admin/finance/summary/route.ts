// GET /api/admin/finance/summary?year=&month= — ملخص المركز المالي لشهر + نقطة التعادل + آخر 6 أشهر. للإدارة فقط.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { breakEven } from "@/lib/finance/breakeven";
import { allTimeTotals, summarizeRange } from "@/lib/finance/data";
import { adminRoute, monthFromUrl } from "@/lib/finance/http";
import { getLocalDirectCostSar, getShipmentGapSharePct, getVatMode } from "@/lib/finance/settings";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async ({ req }) => {
  const month = monthFromUrl(new URL(req.url));
  const gapShare = await getShipmentGapSharePct();
  const all = await summarizeRange(month, 6);
  const current = all[all.length - 1];
  const [vatMode, directCost, plans, allTime] = await Promise.all([getVatMode(), getLocalDirectCostSar(), prisma.subscriptionPlanConfig.findMany({ select: { plan: true, nameAr: true } }), allTimeTotals()]);
  const storeIds = current.ai.byStore.map((x) => x.storeId).filter((x): x is string => !!x);
  const stores = storeIds.length ? await prisma.store.findMany({ where: { id: { in: storeIds } }, select: { id: true, nameAr: true } }) : [];
  return NextResponse.json({
    month, summary: current,
    breakEven: breakEven(current, all.slice(0, -1), { shipmentGapSharePct: gapShare }),
    history: all.map((s) => ({ month: s.month, cashReceiptsMinor: s.result.cashReceiptsMinor, operatingResultCashMinor: s.result.operatingResultCashMinor, expensesMinor: s.expenses.operatingPaidMinor + s.expenses.establishmentPaidMinor })),
    settings: { vatMode, localDirectCostSar: directCost, shipmentGapSharePct: gapShare },
    planNames: Object.fromEntries(plans.map((p) => [p.plan, p.nameAr])),
    allTime,
    storeNames: Object.fromEntries(stores.map((st) => [st.id, st.nameAr])),
  });
});
