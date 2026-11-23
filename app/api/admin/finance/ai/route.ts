// GET (فواتير المزوّد الموثقة) / POST (تسجيل فاتورة أو شحن رصيد موثَّق للمطابقة مع AIUsage).
import { NextResponse } from "next/server";
import { addAiInvoice, aiInvoiceSchema, listAiInvoices } from "@/lib/finance/cod-ai-service";
import { adminRoute, parseBody } from "@/lib/finance/http";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async () => NextResponse.json({ invoices: await listAiInvoices() }));

export const POST = adminRoute(async ({ user, req }) => {
  const input = await parseBody(req, aiInvoiceSchema);
  return NextResponse.json({ invoice: await addAiInvoice(user.id, input) }, { status: 201 });
});
