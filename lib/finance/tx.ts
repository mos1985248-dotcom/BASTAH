// lib/finance/tx.ts — معاملات متسلسلة (Serializable) مع إعادة المحاولة عند التعارض، وتدقيق داخل المعاملة نفسها.
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type Tx = Prisma.TransactionClient;

export async function serializable<T>(fn: (tx: Tx) => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await prisma.$transaction(fn, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 20_000 });
    } catch (e) {
      if (i < attempts && e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2034") continue;
      throw e;
    }
  }
}

export const isUniqueViolation = (e: unknown): boolean => e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

export class FinanceError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

/** سجل تدقيق ضمن المعاملة: يُحفظ أو يفشل مع العملية المالية معاً. */
export async function auditTx(
  tx: Tx,
  entry: { actorId: string; action: string; targetType: string; targetId: string; reason?: string | null; metadata?: Record<string, unknown> },
): Promise<void> {
  await tx.auditLog.create({
    data: {
      actorId: entry.actorId, action: entry.action as never, targetType: entry.targetType, targetId: entry.targetId,
      // AuditLog لا يملك عمود reason: السبب يُحفظ داخل metadata مع القيم القديمة/الجديدة
      metadata: { ...(entry.metadata ?? {}), ...(entry.reason ? { reason: entry.reason } : {}) } as Prisma.InputJsonValue,
    },
  });
}
