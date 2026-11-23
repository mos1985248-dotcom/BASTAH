// lib/finance/expenses.ts — مصروفات المنصة اليدوية. المُلغاة (voided) خارج كل المجاميع. غير المدفوع لا يدخل التدفق النقدي.
import { sum } from "./money";
import { inMonth, type MonthKey } from "./riyadh";
import type { ExpenseIn, MonthlySummary } from "./types";

export function computeExpenses(expenses: ExpenseIn[], month: MonthKey): MonthlySummary["expenses"] {
  const live = expenses.filter((e) => !e.voided);
  const incurred = live.filter((e) => inMonth(e.expenseDate, month));
  const paidNow = live.filter((e) => e.status === "PAID" && inMonth(e.paidAt, month));
  const operating = (e: ExpenseIn) => e.category !== "ESTABLISHMENT";

  const byCategory: Record<string, number> = {};
  for (const e of incurred) byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amountMinor;

  const opIncurred = incurred.filter(operating);
  return {
    operatingIncurredMinor: sum(opIncurred.map((e) => e.amountMinor)),
    operatingPaidMinor: sum(paidNow.filter(operating).map((e) => e.amountMinor)),
    operatingUnpaidMinor: sum(opIncurred.filter((e) => e.status === "UNPAID").map((e) => e.amountMinor)),
    fixedOperatingMinor: sum(opIncurred.filter((e) => e.kind === "FIXED").map((e) => e.amountMinor)),
    variableOperatingMinor: sum(opIncurred.filter((e) => e.kind === "VARIABLE").map((e) => e.amountMinor)),
    establishmentIncurredMinor: sum(incurred.filter((e) => e.category === "ESTABLISHMENT").map((e) => e.amountMinor)),
    establishmentPaidMinor: sum(paidNow.filter((e) => e.category === "ESTABLISHMENT").map((e) => e.amountMinor)),
    manualAiMinor: sum(incurred.filter((e) => e.category === "AI").map((e) => e.amountMinor)),
    byCategory,
  };
}
