import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isSubscriptionInGoodStanding } from "@/lib/subscription-limits";

export class MuniraRequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export function quotaWindow(monthly: number, trial: number, now: Date) {
  if (trial > 0) return { key: "trial", limit: trial };
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit" }).formatToParts(now);
  const year = parts.find(part => part.type === "year")?.value;
  const month = parts.find(part => part.type === "month")?.value;
  return { key: `${year}-${month}`, limit: monthly };
}

type Ticket = { scope: string; requestId: string };
type Reservation = Ticket & { inputHash: string; storeId?: string };
const duration = 180_000;

export function reserveMessage(ticket: Reservation) {
  return prisma.$transaction(async tx => {
    // Per-merchant lock serializes committed reservations across server instances.
    await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(hashtextextended(${ticket.scope}, 15527))`;
    const key = { scope: ticket.scope, requestId: ticket.requestId };
    const existing = await tx.muniraRequest.findUnique({ where: { scope_requestId: key } });
    const now = new Date();
    if (existing?.inputHash && existing.inputHash !== ticket.inputHash) throw new MuniraRequestError("معرّف الرسالة سبق استخدامه.", 409);
    if (existing?.state === "COMPLETE" && existing.response && existing.sessionId) {
      return { replay: { response: existing.response, sessionId: existing.sessionId } } as const;
    }
    if (existing?.state === "PENDING" && existing.expiresAt > now) {
      throw new MuniraRequestError("الرسالة قيد المعالجة. أعد المحاولة بعد قليل.", 409);
    }

    let window = "unmetered";
    if (ticket.storeId) {
      const subscription = await tx.storeSubscription.findUnique({ where: { storeId: ticket.storeId }, select: { plan: true, status: true, store: { select: { status: true } } } });
      if (!subscription || subscription.store.status !== "ACTIVE" || !isSubscriptionInGoodStanding(subscription.status)) {
        throw new MuniraRequestError("اشتراك المتجر غير متاح لاستخدام منيرة.", 403);
      }
      const plan = await tx.subscriptionPlanConfig.findUnique({
        where: { plan: subscription.plan },
        select: { muniraMonthlyMessages: true, muniraTrialMessages: true },
      });
      const quota = quotaWindow(plan?.muniraMonthlyMessages ?? 0, plan?.muniraTrialMessages ?? 0, now);
      if (quota.limit <= 0) throw new MuniraRequestError("باقتك الحالية لا تتضمن رسائل منيرة.", 403);
      window = quota.key;
      const used = await tx.muniraRequest.count({ where: {
        scope: key.scope, quotaWindow: window,
        OR: [{ state: "COMPLETE" }, { state: "PENDING", expiresAt: { gt: now } }],
      } });
      if (used >= quota.limit) throw new MuniraRequestError(window === "trial" ? "استهلكت رسائل منيرة التجريبية." : "استهلكت حصة منيرة لهذا الشهر.", 429);
    }

    const lease = randomUUID();
    const values = { quotaWindow: window, state: "PENDING", lease, expiresAt: new Date(now.getTime() + duration) };
    await tx.muniraRequest.upsert({
      where: { scope_requestId: key },
      create: { ...key, ...values, inputHash: ticket.inputHash },
      update: values,
    });
    return { lease } as const;
  });
}

export function releaseMessage(ticket: Ticket, lease: string) {
  return prisma.muniraRequest.updateMany({
    where: { ...ticket, lease, state: "PENDING" }, data: { state: "FAILED" },
  });
}

export function completeMessage(
  ticket: Ticket, lease: string, response: string,
  save: (tx: Prisma.TransactionClient) => Promise<string>,
) {
  return prisma.$transaction(async tx => {
    const claimed = await tx.muniraRequest.updateMany({
      where: { ...ticket, lease, state: "PENDING" }, data: { state: "COMPLETE", response },
    });
    if (!claimed.count) throw new MuniraRequestError("انتهت مهلة الرسالة. أعد المحاولة.", 409);
    const sessionId = await save(tx);
    await tx.muniraRequest.update({ where: { scope_requestId: ticket }, data: { sessionId } });
    return sessionId;
  });
}
