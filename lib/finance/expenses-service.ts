// lib/finance/expenses-service.ts — مصروفات المنصة: إضافة وتعديل موثَّق وإلغاء ناعم (لا حذف). كل عملية بتدقيق داخل المعاملة.
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fromMinor, toMinor } from "./money";
import { auditTx, FinanceError, serializable } from "./tx";

const money = (max = 10_000_000) => z.coerce.number({ invalid_type_error: "المبلغ غير صالح" }).positive("المبلغ يجب أن يكون موجباً").max(max);

// ⚠️ الاختلاف الشهير: .refine() يُرجع ZodEffects فلا .partial() عليه — نستعمل الكائن الأساسي للتعديل.
export const expenseBase = z.object({
  category: z.enum(["ESTABLISHMENT", "OPERATIONS", "AI", "SALARIES"], { errorMap: () => ({ message: "تصنيف غير صالح" }) }),
  description: z.string().trim().min(2, "الوصف قصير").max(300),
  amount: money(),
  vatAmount: z.coerce.number().min(0).max(10_000_000).nullable().optional(),
  expenseDate: z.coerce.date({ errorMap: () => ({ message: "تاريخ المصروف غير صالح" }) }),
  paidAt: z.coerce.date().nullable().optional(),
  status: z.enum(["PAID", "UNPAID"]).default("UNPAID"),
  kind: z.enum(["FIXED", "VARIABLE"]).default("FIXED"),
  reference: z.string().trim().max(120).nullable().optional(),
  note: z.string().trim().max(1000).nullable().optional(),
});
type ExpenseFields = z.infer<typeof expenseBase>;
const paidNeedsDate = (v: { status?: string; paidAt?: Date | null }) => v.status !== "PAID" || !!v.paidAt;
export const expenseCreateSchema = expenseBase.refine(paidNeedsDate, { message: "تاريخ الدفع مطلوب للمصروف المدفوع", path: ["paidAt"] });
export const expensePatchSchema = expenseBase.partial();

const round2 = (n: number) => fromMinor(toMinor(n) ?? 0);

export async function createExpense(actorId: string, input: ExpenseFields) {
  return serializable(async (tx) => {
    const row = await tx.platformExpense.create({
      data: {
        category: input.category, description: input.description, amount: round2(input.amount), currency: "SAR",
        vatAmount: input.vatAmount != null ? round2(input.vatAmount) : null, expenseDate: input.expenseDate,
        paidAt: input.status === "PAID" ? input.paidAt ?? null : null, status: input.status, kind: input.kind,
        reference: input.reference ?? null, note: input.note ?? null, createdById: actorId,
      },
    });
    await auditTx(tx, { actorId, action: "FINANCE_EXPENSE_CREATED", targetType: "PlatformExpense", targetId: row.id, metadata: { category: row.category, amount: Number(row.amount), kind: row.kind, status: row.status } });
    return row;
  });
}

export async function updateExpense(actorId: string, id: string, patch: Partial<ExpenseFields>, reason: string) {
  if (reason.trim().length < 3) throw new FinanceError("سبب التعديل مطلوب (للتوثيق)");
  return serializable(async (tx) => {
    const current = await tx.platformExpense.findUnique({ where: { id } });
    if (!current) throw new FinanceError("المصروف غير موجود", 404);
    if (current.voidedAt) throw new FinanceError("المصروف مُلغى ولا يُعدَّل", 409);

    const merged = {
      status: patch.status ?? current.status,
      paidAt: patch.paidAt !== undefined ? patch.paidAt : current.paidAt,
    };
    if (!paidNeedsDate(merged)) throw new FinanceError("تاريخ الدفع مطلوب للمصروف المدفوع");

    const data: Record<string, unknown> = {};
    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};
    const set = (key: keyof ExpenseFields, value: unknown, was: unknown) => {
      if (value === undefined || String(value) === String(was)) return;
      data[key] = value; before[key] = was; after[key] = value;
    };
    set("category", patch.category, current.category);
    set("description", patch.description, current.description);
    set("amount", patch.amount !== undefined ? round2(patch.amount) : undefined, Number(current.amount));
    set("vatAmount", patch.vatAmount !== undefined ? (patch.vatAmount === null ? null : round2(patch.vatAmount)) : undefined, current.vatAmount === null ? null : Number(current.vatAmount));
    set("expenseDate", patch.expenseDate, current.expenseDate);
    set("kind", patch.kind, current.kind);
    set("reference", patch.reference, current.reference);
    set("note", patch.note, current.note);
    if (patch.status !== undefined || patch.paidAt !== undefined) {
      const nextStatus = merged.status;
      set("status", nextStatus, current.status);
      set("paidAt", nextStatus === "PAID" ? merged.paidAt ?? null : null, current.paidAt);
    }
    if (Object.keys(data).length === 0) return current;

    const row = await tx.platformExpense.update({ where: { id }, data });
    await auditTx(tx, { actorId, action: "FINANCE_EXPENSE_UPDATED", targetType: "PlatformExpense", targetId: id, reason, metadata: { before, after } });
    return row;
  });
}

export async function voidExpense(actorId: string, id: string, reason: string) {
  if (reason.trim().length < 3) throw new FinanceError("سبب الإلغاء مطلوب");
  return serializable(async (tx) => {
    const current = await tx.platformExpense.findUnique({ where: { id } });
    if (!current) throw new FinanceError("المصروف غير موجود", 404);
    if (current.voidedAt) return current;
    const row = await tx.platformExpense.update({ where: { id }, data: { voidedAt: new Date(), voidReason: reason.trim() } });
    await auditTx(tx, { actorId, action: "FINANCE_EXPENSE_VOIDED", targetType: "PlatformExpense", targetId: id, reason, metadata: { amount: Number(current.amount), category: current.category } });
    return row;
  });
}

export async function listExpenses(from: Date, to: Date) {
  return prisma.platformExpense.findMany({ where: { OR: [{ expenseDate: { gte: from, lt: to } }, { paidAt: { gte: from, lt: to } }] }, orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }] });
}
