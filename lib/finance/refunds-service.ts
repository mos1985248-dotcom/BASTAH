// lib/finance/refunds-service.ts — استرداد اشتراكات جزئي/كامل كحدث مالي موثَّق (لا يكفي تغيير حالة الفاتورة).
// سقف: لا يتجاوز المدفوع ناقص المسترد سابقاً. مفتاح منع تكرار. التصحيح بقيد عكسي. لا يغيّر حالة الفاتورة (لا آثار جانبية على دورة الاشتراك).
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fromMinor, sum, toMinor } from "./money";
import { validateRefund } from "./rules";
import { auditTx, FinanceError, isUniqueViolation, serializable } from "./tx";

export const refundSchema = z.object({
  invoiceId: z.string().trim().min(1, "الفاتورة مطلوبة"),
  amount: z.coerce.number({ invalid_type_error: "المبلغ غير صالح" }).positive("المبلغ يجب أن يكون موجباً").max(10_000_000),
  refundedAt: z.coerce.date({ errorMap: () => ({ message: "تاريخ الاسترداد غير صالح" }) }),
  reference: z.string().trim().max(120).nullable().optional(),
  note: z.string().trim().max(1000).nullable().optional(),
  idempotencyKey: z.string().trim().min(8, "مفتاح منع التكرار قصير").max(100),
});
export type RefundInput = z.infer<typeof refundSchema>;

export async function recordRefund(actorId: string, input: RefundInput) {
  const existing = await prisma.subscriptionRefund.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existing) return { refund: existing, duplicate: true };
  try {
    return await serializable(async (tx) => {
      const dup = await tx.subscriptionRefund.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
      if (dup) return { refund: dup, duplicate: true };
      const invoice = await tx.subscriptionInvoice.findUnique({ where: { id: input.invoiceId }, select: { id: true, amount: true, status: true, paidAt: true } });
      if (!invoice) throw new FinanceError("الفاتورة غير موجودة", 404);
      if (!invoice.paidAt || (invoice.status !== "PAID" && invoice.status !== "REFUNDED")) throw new FinanceError("لا يُسجَّل استرداد إلا لفاتورة دُفعت فعلاً", 409);
      const prior = await tx.subscriptionRefund.findMany({ where: { invoiceId: input.invoiceId }, select: { amount: true, isReversal: true } });
      const already = sum(prior.map((r) => (r.isReversal ? -1 : 1) * (toMinor(r.amount) ?? 0)));
      const amountMinor = toMinor(input.amount) as number;
      const check = validateRefund(toMinor(invoice.amount) ?? 0, already, amountMinor);
      if (!check.ok) throw new FinanceError(check.reason as string, 409);
      const row = await tx.subscriptionRefund.create({
        data: { invoiceId: input.invoiceId, amount: fromMinor(amountMinor), refundedAt: input.refundedAt, reference: input.reference ?? null, note: input.note ?? null, idempotencyKey: input.idempotencyKey, createdById: actorId },
      });
      await auditTx(tx, { actorId, action: "FINANCE_REFUND_RECORDED", targetType: "SubscriptionInvoice", targetId: input.invoiceId, metadata: { refundId: row.id, amount: input.amount, alreadyRefunded: fromMinor(already), invoiceAmount: Number(invoice.amount) } });
      return { refund: row, duplicate: false };
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      const again = await prisma.subscriptionRefund.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
      if (again) return { refund: again, duplicate: true };
    }
    throw err;
  }
}

export async function reverseRefund(actorId: string, id: string, reason: string) {
  if (reason.trim().length < 3) throw new FinanceError("سبب التصحيح مطلوب");
  try {
    return await serializable(async (tx) => {
      const original = await tx.subscriptionRefund.findUnique({ where: { id } });
      if (!original) throw new FinanceError("الاسترداد غير موجود", 404);
      if (original.isReversal) throw new FinanceError("هذا قيد عكسي ولا يُعكس", 409);
      if (await tx.subscriptionRefund.findUnique({ where: { reversalOfId: id } })) throw new FinanceError("سبق عكس هذا الاسترداد", 409);
      const row = await tx.subscriptionRefund.create({
        data: { invoiceId: original.invoiceId, amount: original.amount, refundedAt: new Date(), note: `عكس استرداد: ${reason.trim()}`, isReversal: true, reversalOfId: id, idempotencyKey: `rev:${id}`, createdById: actorId },
      });
      await auditTx(tx, { actorId, action: "FINANCE_REFUND_REVERSED", targetType: "SubscriptionInvoice", targetId: original.invoiceId, reason, metadata: { reversalId: row.id, refundId: id, amount: Number(original.amount) } });
      return row;
    });
  } catch (err) {
    if (isUniqueViolation(err)) throw new FinanceError("سبق عكس هذا الاسترداد", 409);
    throw err;
  }
}

export async function listRefunds(from: Date, to: Date) {
  return prisma.subscriptionRefund.findMany({ where: { refundedAt: { gte: from, lt: to } }, orderBy: { refundedAt: "desc" }, take: 500 });
}
