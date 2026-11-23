// GET — فواتير الاشتراك المدفوعة في الشهر مع المسترد منها (لاختيار فاتورة عند تسجيل استرداد).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminRoute, monthFromUrl } from "@/lib/finance/http";
import { toMinor } from "@/lib/finance/money";
import { monthRangeUtc } from "@/lib/finance/riyadh";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async ({ req }) => {
  const { start, end } = monthRangeUtc(monthFromUrl(new URL(req.url)));
  const invoices = await prisma.subscriptionInvoice.findMany({
    where: { status: { in: ["PAID", "REFUNDED"] }, paidAt: { gte: start, lt: end } },
    select: { id: true, plan: true, billingCycle: true, amount: true, vatAmount: true, paidAt: true, subscription: { select: { store: { select: { nameAr: true } } } } },
    orderBy: { paidAt: "desc" }, take: 300,
  });
  const refunds = await prisma.subscriptionRefund.findMany({ where: { invoiceId: { in: invoices.map((i) => i.id) } }, select: { invoiceId: true, amount: true, isReversal: true } });
  const refunded = new Map<string, number>();
  for (const r of refunds) refunded.set(r.invoiceId, (refunded.get(r.invoiceId) ?? 0) + (r.isReversal ? -1 : 1) * (toMinor(r.amount) ?? 0));
  return NextResponse.json({
    invoices: invoices.map((i) => ({ id: i.id, store: i.subscription.store.nameAr, plan: i.plan, cycle: i.billingCycle, amountMinor: toMinor(i.amount) ?? 0, vatMinor: toMinor(i.vatAmount), paidAt: i.paidAt, refundedMinor: refunded.get(i.id) ?? 0 })),
  });
});
