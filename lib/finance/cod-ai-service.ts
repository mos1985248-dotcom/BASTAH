// lib/finance/cod-ai-service.ts — شروط حصة COD لكل ناقل (بنسخ زمنية) وفواتير مزوّد الذكاء الاصطناعي الموثقة.
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auditTx, serializable } from "./tx";

const optNum = (min: number, max: number) => z.coerce.number().min(min).max(max).nullable().optional();

export const codTermsBase = z.object({
  carrierKey: z.string().trim().min(2, "الناقل مطلوب").max(80),
  fixedShare: optNum(0, 1000),
  percentShare: optNum(0, 100),
  percentBasis: z.enum(["ORDER_TOTAL", "COD_FEE"]).nullable().optional(),
  effectiveFrom: z.coerce.date().optional(),
});
export const codTermsSchema = codTermsBase
  .refine((v) => v.fixedShare != null || v.percentShare != null, { message: "حدّد مبلغاً ثابتاً أو نسبة (أو الاثنين)", path: ["fixedShare"] })
  .refine((v) => v.percentShare == null || !!v.percentBasis, { message: "أساس النسبة مطلوب: إجمالي الطلب أو رسم COD (لا نفترضه)", path: ["percentBasis"] });

export async function addCodTerms(actorId: string, input: z.infer<typeof codTermsBase>) {
  return serializable(async (tx) => {
    const row = await tx.carrierCodTerms.create({
      data: {
        carrierKey: input.carrierKey, fixedShare: input.fixedShare ?? null, percentShare: input.percentShare ?? null,
        percentBasis: input.percentShare != null ? input.percentBasis ?? null : null, effectiveFrom: input.effectiveFrom ?? new Date(), createdById: actorId,
      },
    });
    await auditTx(tx, { actorId, action: "FINANCE_COD_TERMS_UPDATED", targetType: "CarrierCodTerms", targetId: row.id, metadata: { carrierKey: row.carrierKey, fixedShare: input.fixedShare ?? null, percentShare: input.percentShare ?? null, percentBasis: row.percentBasis, effectiveFrom: row.effectiveFrom } });
    return row;
  });
}

export const listCodTerms = () => prisma.carrierCodTerms.findMany({ orderBy: [{ carrierKey: "asc" }, { effectiveFrom: "desc" }] });

export const aiInvoiceBase = z.object({
  provider: z.string().trim().min(2).max(60),
  kind: z.enum(["USAGE_INVOICE", "PREPAID_TOPUP"], { errorMap: () => ({ message: "نوع الفاتورة غير صالح" }) }),
  periodStart: z.coerce.date().nullable().optional(),
  periodEnd: z.coerce.date().nullable().optional(),
  amountUsd: z.coerce.number({ invalid_type_error: "المبلغ غير صالح" }).positive("المبلغ يجب أن يكون موجباً").max(10_000_000),
  fxRateSarPerUsd: z.coerce.number().positive().max(100).nullable().optional(),
  fxRateDate: z.coerce.date().nullable().optional(),
  fxSource: z.string().trim().max(120).nullable().optional(),
  paidAt: z.coerce.date().nullable().optional(),
  reference: z.string().trim().max(120).nullable().optional(),
  note: z.string().trim().max(1000).nullable().optional(),
});
export const aiInvoiceSchema = aiInvoiceBase
  .refine((v) => v.kind !== "USAGE_INVOICE" || (!!v.periodStart && !!v.periodEnd && v.periodEnd > v.periodStart), { message: "فاتورة الاستهلاك تتطلب فترة صحيحة (البداية قبل النهاية)", path: ["periodStart"] })
  .refine((v) => v.kind !== "PREPAID_TOPUP" || !!v.paidAt, { message: "شحن الرصيد يتطلب تاريخ الدفع", path: ["paidAt"] })
  .refine((v) => (v.fxRateSarPerUsd == null) === (v.fxRateDate == null), { message: "سعر الصرف وتاريخه يُسجَّلان معاً (سعر موثَّق)", path: ["fxRateSarPerUsd"] });

export async function addAiInvoice(actorId: string, input: z.infer<typeof aiInvoiceBase>) {
  return serializable(async (tx) => {
    const row = await tx.aiProviderInvoice.create({
      data: {
        provider: input.provider, kind: input.kind, periodStart: input.periodStart ?? null, periodEnd: input.periodEnd ?? null, amountUsd: input.amountUsd,
        fxRateSarPerUsd: input.fxRateSarPerUsd ?? null, fxRateDate: input.fxRateDate ?? null, fxSource: input.fxSource ?? null,
        paidAt: input.paidAt ?? null, reference: input.reference ?? null, note: input.note ?? null, createdById: actorId,
      },
    });
    await auditTx(tx, { actorId, action: "FINANCE_AI_INVOICE_RECORDED", targetType: "AiProviderInvoice", targetId: row.id, metadata: { provider: row.provider, kind: row.kind, amountUsd: input.amountUsd } });
    return row;
  });
}

export const listAiInvoices = () => prisma.aiProviderInvoice.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
