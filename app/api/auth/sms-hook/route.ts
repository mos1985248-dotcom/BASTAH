// app/api/auth/sms-hook/route.ts
// Supabase "Send SMS Hook": عند طلب رمز دخول بالجوال يستدعي Supabase هذا المسار بدل مزوّده المدمج،
// فنرسل الرمز عبر مزوّد سعودي (lib/sms). الحماية: توقيع Standard Webhooks (SEND_SMS_HOOK_SECRET)
// + أرقام جوال سعودية فقط + حد لكل رقم (5/دقيقة). مستثنى من حد الـIP العام بـmiddleware.ts عمداً.
// فشل الإرسال يرجع خطأ بصيغة hooks ({ error: { http_code, message } }) فيصل للمستخدم كفشل طلب الرمز.

import { NextRequest, NextResponse } from "next/server";
import { verifyStandardWebhook } from "@/lib/standard-webhooks";
import { normalizeSaudiMobile } from "@/lib/phone";
import { sendOtpSms, SmsNotConfiguredError } from "@/lib/sms";
import { authRateLimit, checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function hookError(status: number, message: string) {
  return NextResponse.json({ error: { http_code: status, message } }, { status });
}

export async function POST(req: NextRequest) {
  const secret = process.env.SEND_SMS_HOOK_SECRET;
  if (!secret) {
    console.error("[auth/sms-hook] SEND_SMS_HOOK_SECRET غير مضبوط");
    return hookError(500, "خدمة الرسائل غير مهيّأة");
  }

  const rawBody = await req.text();
  if (!verifyStandardWebhook(rawBody, req.headers, secret)) {
    return hookError(401, "توقيع غير صالح");
  }

  let payload: { user?: { phone?: string }; sms?: { otp?: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return hookError(400, "طلب غير صالح");
  }

  const phone = normalizeSaudiMobile(payload.user?.phone);
  const otp = payload.sms?.otp;
  if (!phone || !otp) {
    return hookError(400, "الدخول بالجوال متاح لأرقام الجوال السعودية فقط");
  }

  const { allowed } = await checkRateLimit(authRateLimit, `sms-otp:${phone}`);
  if (!allowed) return hookError(429, "طلبات كثيرة، حاول بعد قليل");

  try {
    await sendOtpSms(phone, otp);
    return NextResponse.json({});
  } catch (err) {
    console.error("[auth/sms-hook]", err instanceof SmsNotConfiguredError ? err.message : err);
    return hookError(502, "تعذّر إرسال رمز التحقق، حاول مجدداً");
  }
}
