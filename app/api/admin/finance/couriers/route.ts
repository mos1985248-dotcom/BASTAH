// GET — مستحقات المناديب (المسندة/المسلَّمة/المرتجعة، المستحق، المدفوع، المتبقي) حتى نهاية الشهر.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { summarizeRange } from "@/lib/finance/data";
import { adminRoute, monthFromUrl } from "@/lib/finance/http";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async ({ req }) => {
  const month = monthFromUrl(new URL(req.url));
  const [[summary], couriers, counts] = await Promise.all([
    summarizeRange(month, 1),
    prisma.cityCourier.findMany({ select: { id: true, name: true, city: true, phone: true, isActive: true, commissionPerShipment: true }, orderBy: { name: "asc" } }),
    prisma.shipment.groupBy({ by: ["courierId", "status"], where: { courierId: { not: null } }, _count: { _all: true } }),
  ]);
  const lineOf = new Map(summary.couriers.lines.map((l) => [l.courierId, l]));
  const countFor = (id: string, ...st: string[]) => counts.filter((c) => c.courierId === id && (st.length === 0 || st.includes(c.status))).reduce((a, c) => a + c._count._all, 0);
  return NextResponse.json({
    month,
    couriers: couriers.map((c) => {
      const l = lineOf.get(c.id);
      return {
        ...c, currentWageSar: c.commissionPerShipment, assignedCount: countFor(c.id), deliveredCount: countFor(c.id, "DELIVERED"), failedOrReturnedCount: countFor(c.id, "FAILED", "RETURNED"),
        accruedMinor: l?.accruedMinor ?? 0, paidMinor: l?.paidMinor ?? 0, balanceMinor: l?.balanceMinor ?? 0, undocumentedCount: l?.undocumentedCount ?? 0,
      };
    }),
    totals: { accruedMinor: summary.couriers.accruedMinor, paidMinor: summary.couriers.paidMinor, balanceMinor: summary.couriers.balanceMinor },
  });
});
