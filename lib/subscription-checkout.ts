import type { SubscriptionPlan } from "@prisma/client";
import { createMoyasarInvoice, fetchMoyasarInvoice, MoyasarError, toHalalas, type MoyasarInvoice } from "./moyasar";
import { applyMoyasarSubscriptionPaymentStatus } from "./subscription-payment";
import { prisma } from "./prisma";
import { isMoyasarInvoiceReference, moyasarCreationPending, moyasarCreationRejected } from "./subscription-invoice-reference";

export class SubscriptionCheckoutError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

const pendingReview = () => new SubscriptionCheckoutError(
  "تجري مراجعة محاولة الدفع السابقة. حاولي لاحقًا أو تواصلي مع الدعم.",
  409,
);

function matchesInvoice(remote: MoyasarInvoice, amount: number) {
  return remote.currency === "SAR" && remote.amount === toHalalas(amount);
}

function paymentLink(remote: MoyasarInvoice) {
  if (!remote.url?.startsWith("https://")) {
    throw new SubscriptionCheckoutError("تعذّر التحقق من رابط الدفع.", 502);
  }
  return remote.url;
}

type Checkout = {
  subscriptionId: string;
  storeId: string;
  userId: string;
  targetPlan: SubscriptionPlan;
  billingCycle: string;
  amount: number;
  description: string;
  appUrl: string;
  secretKey: string;
  now: Date;
};

export async function startSubscriptionCheckout(input: Checkout) {
  const { subscriptionId, secretKey, now } = input;
  const period = {
    subscriptionId,
    periodYear: now.getFullYear(),
    periodMonth: now.getMonth() + 1,
  };
  const terms = { plan: input.targetPlan, billingCycle: input.billingCycle, amount: input.amount };
  const dueDate = new Date(now.getTime() + 86_400_000);

  const attempt = await prisma.$transaction(async tx => {
    // The committed claim survives a timeout or a restart during the provider call.
    await tx.$queryRaw`SELECT id FROM store_subscriptions WHERE id = ${subscriptionId} FOR UPDATE`;
    const invoice = await tx.subscriptionInvoice.findUnique({
      where: { subscriptionId_periodYear_periodMonth: period },
    });
    if (invoice?.status === "PAID") {
      throw new SubscriptionCheckoutError("تم دفع اشتراك هذا الشهر بالفعل.", 409);
    }
    if (invoice && isMoyasarInvoiceReference(invoice.moyasarTxnId)) return { invoice, create: false };
    if (invoice && (invoice.moyasarTxnId === moyasarCreationPending ||
      (invoice.moyasarTxnId !== moyasarCreationRejected && invoice.amount > 0))) throw pendingReview();

    const data = { ...terms, dueDate, status: "PENDING" as const, moyasarTxnId: moyasarCreationPending };
    const claimed = invoice
      ? await tx.subscriptionInvoice.update({ where: { id: invoice.id }, data })
      : await tx.subscriptionInvoice.create({ data: { ...period, ...data } });
    return { invoice: claimed, create: true };
  });

  let { invoice } = attempt;
  if (!attempt.create) {
    const reference = invoice.moyasarTxnId;
    if (!isMoyasarInvoiceReference(reference)) throw pendingReview();
    const remote = await fetchMoyasarInvoice(secretKey, reference, AbortSignal.timeout(10_000));
    if (remote.id !== reference || !matchesInvoice(remote, invoice.amount)) throw pendingReview();

    if (remote.status === "paid") {
      await applyMoyasarSubscriptionPaymentStatus(invoice.id, "paid", reference);
      throw new SubscriptionCheckoutError("تم دفع اشتراك هذا الشهر بالفعل.", 409);
    }

    if (remote.status === "initiated" && !remote.payments?.some(payment => ["paid", "captured", "authorized"].includes(payment.status))) {
      if (invoice.plan !== terms.plan || invoice.billingCycle !== terms.billingCycle) {
        throw new SubscriptionCheckoutError("توجد فاتورة دفع مفتوحة لخيار مختلف. أكمليها أو انتظري انتهاءها.", 409);
      }
      return { requiresPayment: true, invoiceId: invoice.id, paymentUrl: paymentLink(remote) };
    }

    const closed = ["canceled", "expired", "voided"].includes(remote.status);
    const paymentsClosed = remote.payments?.every(payment => ["failed", "expired", "voided"].includes(payment.status));
    if (!closed || !paymentsClosed) throw pendingReview();

    const claim = await prisma.subscriptionInvoice.updateMany({
      where: { id: invoice.id, moyasarTxnId: reference, status: { not: "PAID" } },
      data: { ...terms, dueDate, moyasarTxnId: moyasarCreationPending, status: "PENDING" },
    });
    if (claim.count !== 1) throw pendingReview();
    invoice = { ...invoice, ...terms };
  }

  let remote: MoyasarInvoice;
  try {
    remote = await createMoyasarInvoice({
      secretKey,
      amountHalalas: toHalalas(invoice.amount),
      description: input.description,
      successUrl: `${input.appUrl}/dashboard/subscription/return?invoiceId=${invoice.id}`,
      expiresAt: dueDate,
      metadata: { subscriptionInvoiceId: invoice.id, storeId: input.storeId, userId: input.userId },
    });
  } catch (err) {
    // Authentication errors are definitive rejections. Leave uncertain attempts claimed.
    if (err instanceof MoyasarError && (err.status === 401 || err.status === 403)) {
      await prisma.subscriptionInvoice.updateMany({
        where: { id: invoice.id, moyasarTxnId: moyasarCreationPending },
        data: { moyasarTxnId: moyasarCreationRejected },
      });
      throw err;
    }
    throw pendingReview();
  }

  if (!isMoyasarInvoiceReference(remote.id) || !matchesInvoice(remote, invoice.amount)) throw pendingReview();
  const bound = await prisma.subscriptionInvoice.updateMany({
    where: { id: invoice.id, moyasarTxnId: moyasarCreationPending },
    data: { moyasarTxnId: remote.id },
  });
  if (bound.count !== 1) throw pendingReview();
  if (remote.status !== "initiated") throw pendingReview();
  return { requiresPayment: true, invoiceId: invoice.id, paymentUrl: paymentLink(remote) };
}
