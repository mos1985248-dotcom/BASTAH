// lib/audit-log.ts
// سجل العمليات الإدارية — كل عملية حساسة من لوحة الإدارة تُسجَّل ولا تُحذف.
//
// قاعدة: هذا السجل append-only. لا توجد دالة update أو delete هنا عمداً —
// لو احتجنا "تصحيح" قيد، نُضيف قيداً جديداً يوضّح ذلك بدل تعديل القديم.

import { prisma } from "./prisma";
import type { AuditAction, Prisma } from "@prisma/client";

interface LogAuditParams {
  actorId: string;
  action: AuditAction;
  targetType: string; // "Store" | "User" | "Order" | "SubscriptionInvoice" ...
  targetId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

export async function logAudit({
  actorId,
  action,
  targetType,
  targetId,
  metadata,
  ipAddress,
}: LogAuditParams) {
  return prisma.auditLog.create({
    data: {
      actorId,
      action,
      targetType,
      targetId,
      metadata: (metadata ?? {}) as Prisma.InputJsonValue,
      ipAddress: ipAddress ?? null,
    },
  });
}

/** يستخرج IP العميل من الهيدرز خلف Vercel/Proxy بشكل صحيح */
export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip");
}

/** عرض سجل عمليات هدف معيّن (مثلاً: كل ما حدث لمتجر معيّن) */
export async function getAuditTrail(targetType: string, targetId: string) {
  return prisma.auditLog.findMany({
    where: { targetType, targetId },
    include: { actor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
