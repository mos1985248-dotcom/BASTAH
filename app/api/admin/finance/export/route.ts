// GET ?type=summary|expenses|settlements — تصدير CSV (UTF-8 مع BOM، محمي من حقن المعادلات).
import { breakEven } from "@/lib/finance/breakeven";
import { toCsv } from "@/lib/finance/csv";
import { summarizeRange } from "@/lib/finance/data";
import { monthFile, summaryCsv } from "@/lib/finance/exports";
import { listExpenses } from "@/lib/finance/expenses-service";
import { adminRoute, csvResponse, monthFromUrl } from "@/lib/finance/http";
import { monthRangeUtc } from "@/lib/finance/riyadh";
import { getShipmentGapSharePct } from "@/lib/finance/settings";
import { listSettlements } from "@/lib/finance/settlements-service";
import { FinanceError } from "@/lib/finance/tx";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async ({ req }) => {
  const url = new URL(req.url);
  const month = monthFromUrl(url);
  const { start, end } = monthRangeUtc(month);
  const type = url.searchParams.get("type");

  if (type === "summary") {
    const all = await summarizeRange(month, 6);
    return csvResponse(summaryCsv(all[all.length - 1], breakEven(all[all.length - 1], all.slice(0, -1), { shipmentGapSharePct: await getShipmentGapSharePct() })), monthFile("finance-summary", month));
  }
  if (type === "expenses") {
    const rows = await listExpenses(start, end);
    const cat = { ESTABLISHMENT: "تأسيس", OPERATIONS: "تشغيل", AI: "ذكاء اصطناعي", SALARIES: "رواتب" } as const;
    return csvResponse(toCsv(["التاريخ", "التصنيف", "الوصف", "المبلغ", "النوع", "الحالة", "تاريخ الدفع", "المرجع", "مُلغى"],
      rows.map((e) => [e.expenseDate.toISOString().slice(0, 10), cat[e.category], e.description, Number(e.amount), e.kind === "FIXED" ? "ثابت" : "متغير", e.status === "PAID" ? "مدفوع" : "غير مدفوع", e.paidAt?.toISOString().slice(0, 10) ?? "", e.reference ?? "", e.voidedAt ? "نعم" : ""])), monthFile("expenses", month));
  }
  if (type === "settlements") {
    const rows = await listSettlements({ from: start, to: end });
    return csvResponse(toCsv(["التاريخ", "النوع", "الطرف", "المبلغ", "عكسي", "الوسيلة", "المرجع", "ملاحظة"],
      rows.map((s) => [s.settledAt.toISOString().slice(0, 10), s.kind, `${s.partyType}:${s.partyRef}`, { sar: (s.isReversal ? -1 : 1) * s.amountMinor }, s.isReversal ? "نعم" : "", s.method ?? "", s.reference ?? "", s.note ?? ""])), monthFile("settlements", month));
  }
  throw new FinanceError("نوع التصدير غير صالح");
});
