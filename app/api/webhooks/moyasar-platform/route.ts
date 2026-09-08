// app/api/webhooks/moyasar-platform/route.ts
// webhook حساب Moyasar الخاص بالمنصة نفسها (اشتراكات التجار) — منفصل
// تماماً عن app/api/payments/moyasar/webhook/route.ts (حسابات التجار
// الخاصة بمدفوعات عملائهم). نفس بنية التحقق والـidempotency حرفياً،
// لكن السرّ من env واحد بدل سرّ لكل تاجر.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMoyasarSecretToken, registerWebhookEvent, markWebhookProcessed, markWebhookFailed } from "@/lib/webhook-security";
import { applyMoyasarSubscriptionPaymentStatus } from "@/lib/subscription-payment";

interface MoyasarWebhookPayload {
  id: string;
  type?: string;
  secret_token?: string;
  live?: boolean;
  data: {
    id: string;
    status: string;
    amount: number;
    invoice_id?: string | null;
    metadata?: { subscriptionInvoiceId?: string; storeId?: string } | null;
  };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  let payload: MoyasarWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON غير صالح" }, { status: 400 });
  }

  if (!payload.data?.id) {
    return NextResponse.json({ error: "بيانات الدفع غير مكتملة" }, { status: 400 });
  }

  const platformSecret = process.env.PLATFORM_MOYASAR_WEBHOOK_SECRET;
  if (!platformSecret) {
    console.error("[moyasar-platform-webhook] PLATFORM_MOYASAR_WEBHOOK_SECRET غير مضبوط");
    return NextResponse.json({ error: "الخادم غير مُهيَّأ" }, { status: 500 });
  }

  const isValidSecret = verifyMoyasarSecretToken(payload.secret_token, platformSecret);
  if (!isValidSecret) {
    console.warn("[moyasar-platform-webhook-invalid-secret]");
    return NextResponse.json({ error: "secret_token غير صحيح" }, { status: 401 });
  }

  // نعتمد invoice_id (موثَّق ومضمون على كائن الدفع) مع metadata كخط دفاع احتياطي
  const invoiceMoyasarId = payload.data.invoice_id ?? null;
  const metadataInvoiceId = payload.data.metadata?.subscriptionInvoiceId ?? null;

  const invoice = await prisma.subscriptionInvoice.findFirst({
    where: invoiceMoyasarId ? { moyasarTxnId: invoiceMoyasarId } : metadataInvoiceId ? { id: metadataInvoiceId } : undefined,
    select: { id: true, subscription: { select: { storeId: true } } },
  });

  if (!invoice) {
    console.warn("[moyasar-platform-webhook-unmatched]", { invoiceMoyasarId, metadataInvoiceId, type: payload.type });
    return NextResponse.json({ error: "لا توجد فاتورة اشتراك مطابقة لهذا الحدث" }, { status: 404 });
  }

  const registration = await registerWebhookEvent({
    source: "MOYASAR",
    rawBody,
    externalId: payload.id,
    storeId: invoice.subscription.storeId,
  });

  if (!registration.ok) {
    if (registration.reason === "duplicate") {
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }
    return NextResponse.json({ error: registration.message }, { status: 500 });
  }

  try {
    const result = await applyMoyasarSubscriptionPaymentStatus(invoice.id, payload.data.status);
    if (!result.applied) {
      await markWebhookFailed(registration.eventRecordId, "الفاتورة اختفت أثناء المعالجة");
      return NextResponse.json({ error: "الفاتورة غير موجودة" }, { status: 404 });
    }
    await markWebhookProcessed(registration.eventRecordId);
    return NextResponse.json({ received: true, changed: result.changed }, { status: 200 });
  } catch (err) {
    console.error("[moyasar-platform-webhook-processing-error]", err);
    await markWebhookFailed(registration.eventRecordId, String(err));
    return NextResponse.json({ error: "فشلت المعالجة الداخلية" }, { status: 500 });
  }
}
