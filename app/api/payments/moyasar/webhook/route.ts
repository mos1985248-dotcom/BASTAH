// app/api/payments/moyasar/webhook/route.ts
//
// ⚠️ تصحيح كامل حسب توثيق Moyasar الرسمي الحالي
// (https://docs.moyasar.com/api/other/webhooks/webhook-reference):
// - لا يوجد أي هيدر توقيع HMAC لهذا التكامل. الحماية تتم عبر حقل
//   `secret_token` الموجود مباشرة داخل جسم الـwebhook (JSON body)، نقارنه
//   مباشرة (timing-safe) مع السر المسجَّل لحساب التاجر صاحب الطلب.
// - نعتمد على `data.invoice_id` (وليس metadata) لأنه حقل مضمون التوثيق
//   على كائن الدفع، بينما انتشار الـmetadata من مستوى Invoice لمستوى
//   Payment الناتج غير موثَّق بشكل قاطع.
// - نتحقق من الطلب أولاً (قراءة فقط، بدون أي تعديل) لمعرفة أي متجر يخصّه
//   *قبل* نتحقق من secret_token — لأن كل تاجر له سرّ مختلف.
// - idempotent بالكامل: WebhookEvent.externalId = payload.id (معرّف الحدث
//   الفريد من Moyasar نفسه) + قيد @@unique([source, externalId])، بالإضافة
//   لحارس على مستوى حالة الطلب نفسه (lib/order-payment.ts) كطبقة حماية
//   ثانية مستقلة.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMoyasarSecretToken, registerWebhookEvent, markWebhookProcessed, markWebhookFailed } from "@/lib/webhook-security";
import { applyMoyasarPaymentStatus } from "@/lib/order-payment";
import { decryptIfEncrypted } from "@/lib/crypto";

interface MoyasarWebhookPayload {
  id: string; // معرّف الحدث الفريد
  type?: string;
  secret_token?: string;
  account_name?: string;
  live?: boolean;
  data: {
    id: string;
    status: string; // paid | failed | authorized | captured | voided | refunded | verified | initiated
    amount: number;
    invoice_id?: string | null;
    metadata?: { orderId?: string; storeId?: string } | null;
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

  // ── تحديد الطلب المرتبط: نعتمد على invoice_id (موثَّق ومضمون) مع
  // metadata.orderId كخط دفاع احتياطي فقط لو كانت موجودة ─────────────
  const invoiceId = payload.data.invoice_id ?? null;
  const metadataOrderId = payload.data.metadata?.orderId ?? null;

  const order = await prisma.order.findFirst({
    where: invoiceId ? { moyasarTxnId: invoiceId } : metadataOrderId ? { id: metadataOrderId } : undefined,
    select: { id: true, storeId: true },
  });

  if (!order) {
    // لا يمكن ربط هذا الحدث بأي طلب لدينا — قد يكون حدثاً لا يخصّنا إطلاقاً
    console.warn("[moyasar-webhook-unmatched]", { invoiceId, metadataOrderId, type: payload.type });
    return NextResponse.json({ error: "لا يوجد طلب مطابق لهذا الحدث" }, { status: 404 });
  }

  const subscription = await prisma.storeSubscription.findUnique({
    where: { storeId: order.storeId },
    select: { merchantGatewayWebhookSecret: true },
  });
  if (!subscription?.merchantGatewayWebhookSecret) {
    return NextResponse.json({ error: "لا يوجد سرّ webhook مسجَّل لهذا المتجر" }, { status: 404 });
  }

  // ⚠️ أمني: merchantGatewayWebhookSecret أصبح يُخزَّن مشفّراً بـAES —
  // decryptIfEncrypted تدعم القيم القديمة (نص صريح) أثناء فترة الترحيل
  const webhookSecret = decryptIfEncrypted(subscription.merchantGatewayWebhookSecret);
  const isValidSecret = verifyMoyasarSecretToken(payload.secret_token, webhookSecret);
  if (!isValidSecret) {
    console.warn("[webhook-invalid-secret-token]", { storeId: order.storeId, orderId: order.id });
    return NextResponse.json({ error: "secret_token غير صحيح" }, { status: 401 });
  }

  const registration = await registerWebhookEvent({
    source: "MOYASAR_MERCHANT",
    rawBody,
    externalId: payload.id,
    storeId: order.storeId,
  });

  if (!registration.ok) {
    if (registration.reason === "duplicate") {
      // ✅ ليست حالة خطأ من منظور Moyasar — تم استلامها مسبقاً، لا نعالجها مرتين
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }
    return NextResponse.json({ error: registration.message }, { status: 500 });
  }

  try {
    const result = await applyMoyasarPaymentStatus(order.id, payload.data.status);
    if (!result.applied) {
      await markWebhookFailed(registration.eventRecordId, "الطلب اختفى أثناء المعالجة");
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }
    await markWebhookProcessed(registration.eventRecordId);
    return NextResponse.json({ received: true, changed: result.changed }, { status: 200 });
  } catch (err) {
    console.error("[moyasar-webhook-processing-error]", err);
    await markWebhookFailed(registration.eventRecordId, String(err));
    // 500 يجعل Moyasar يعيد المحاولة لاحقاً (سلوك صحيح — خطأنا الداخلي، لا خطأ بالحدث نفسه)
    return NextResponse.json({ error: "فشلت المعالجة الداخلية" }, { status: 500 });
  }
}
