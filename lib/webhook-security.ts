// lib/webhook-security.ts
// أمان الـ Webhooks — تحقق، وعدم التكرار (idempotency)
//
// طبقتا حماية منفصلتان ومتكاملتان:
// 1) Secret token verification: نتحقق أن الطلب جاء فعلاً من Moyasar عبر
//    مقارنة مباشرة لحقل `secret_token` الموجود داخل جسم الـwebhook نفسه
//    مع السر المسجَّل لحساب التاجر (وليس عبر أي هيدر توقيع HMAC — Moyasar
//    لا يستخدم هذه الآلية لهذا التكامل حسب توثيقهم الرسمي الحالي:
//    https://docs.moyasar.com/api/other/webhooks/webhook-reference — حقل
//    secret_token جزء من "The Webhook Object" ذاته).
// 2) Idempotency: حتى لو وصل نفس الحدث الصحيح مرتين (Moyasar نفسه يعيد
//    الإرسال حتى 5 مرات إضافية عند عدم إرجاعنا 2xx)، لا نعالجه مرتين —
//    جدول WebhookEvent بقيد @@unique([source, externalId]) يضمن ذلك على
//    مستوى DB مباشرة (externalId = معرّف الحدث الفريد `id` من الـpayload).

import crypto from "crypto";
import { prisma } from "./prisma";
import type { WebhookSource } from "@prisma/client";

/**
 * يقارن secret_token الوارد بجسم الـwebhook مع السر المخزَّن لحساب التاجر.
 * نستخدم crypto.timingSafeEqual وليس `===` لمنع timing attacks — مقارنة
 * السلاسل العادية تكشف معلومات توقيتية عن مدى تطابق الأحرف.
 */
export function verifyMoyasarSecretToken(receivedToken: string | undefined | null, expectedSecret: string): boolean {
  if (!receivedToken || !expectedSecret) return false;

  const receivedBuf = Buffer.from(receivedToken, "utf8");
  const expectedBuf = Buffer.from(expectedSecret, "utf8");

  // طول مختلف يعني تزوير/سر خاطئ فوراً — لازم نتحقق قبل timingSafeEqual
  // لأنه يرمي خطأ لو الأطوال غير متساوية بدل إرجاع false بأمان
  if (receivedBuf.length !== expectedBuf.length) return false;

  return crypto.timingSafeEqual(receivedBuf, expectedBuf);
}

/** SHA-256 hash لمحتوى الـ payload — يُستخدم لكشف تكرار حتى لو اختلف معرّف الحدث */
export function hashPayload(rawBody: string): string {
  return crypto.createHash("sha256").update(rawBody).digest("hex");
}

export type WebhookCheckResult =
  | { ok: true; eventRecordId: string }
  | { ok: false; reason: "duplicate" | "invalid_signature" | "replay" | "error"; message: string };

/**
 * الدالة الرئيسية: تُستخدم في بداية كل webhook handler *بعد* التحقق من
 * secret_token (verifyMoyasarSecretToken) من طرف المستدعي — تسجّل الحدث
 * في WebhookEvent (idempotency) فقط، ولم تعد هي المسؤولة عن التحقق نفسه.
 *
 * تصميم متعمد: نُسجّل الحدث (status: "received") *قبل* المعالجة الفعلية،
 * بحيث لو السيرفر انهار أثناء المعالجة، السجل موجود ويوضّح أنه لم يُكتمل —
 * هذا أفضل من عدم وجود أي أثر للحدث الوارد.
 */
export async function registerWebhookEvent(params: {
  source: WebhookSource;
  rawBody: string;
  externalId: string;
  storeId?: string | null;
}): Promise<WebhookCheckResult> {
  const { source, rawBody, externalId, storeId } = params;
  const payloadHash = hashPayload(rawBody);

  try {
    const record = await prisma.webhookEvent.create({
      data: {
        source,
        externalId,
        storeId: storeId ?? null,
        payloadHash,
        status: "received",
      },
    });
    return { ok: true, eventRecordId: record.id };
  } catch (err: any) {
    // P2002 = unique constraint violation على [source, externalId] → تكرار حقيقي
    if (err?.code === "P2002") {
      return { ok: false, reason: "duplicate", message: "هذا الحدث عُولج مسبقاً (idempotent skip)" };
    }
    console.error("[webhook-registration-error]", err);
    return { ok: false, reason: "error", message: "فشل تسجيل الحدث" };
  }
}

/** تُستدعى بعد نجاح المعالجة الفعلية لتحديث حالة السجل */
export async function markWebhookProcessed(eventRecordId: string) {
  await prisma.webhookEvent.update({
    where: { id: eventRecordId },
    data: { status: "processed", processedAt: new Date() },
  });
}

export async function markWebhookFailed(eventRecordId: string, errorMessage: string) {
  await prisma.webhookEvent.update({
    where: { id: eventRecordId },
    data: { status: "failed", errorMessage },
  });
}
