// app/api/stores/payment-gateway/route.ts
// ربط حساب Moyasar الخاص بالتاجر — كل تاجر يملك مفاتيحه (قرار أحمد).
// لا نخزّن المفتاح السري نصاً صريحاً أبداً، ونتحقق من صلاحيته فعلياً عند
// Moyasar قبل القبول (لمنع حفظ مفتاح خاطئ يكتشفه التاجر بعد أول طلب فاشل).

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { validateMoyasarKey } from "@/lib/moyasar";
import { encryptSecret, maskSecret } from "@/lib/crypto";
import { connectGatewaySchema, formatZodError } from "@/lib/validation";
import { logAudit, getClientIp } from "@/lib/audit-log";

export async function POST(req: NextRequest) {
  try {
    const { user, storeId } = await requireActiveStore();

    const body = await req.json();
    const parsed = connectGatewaySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { publishableKey, secretKey, webhookSecret } = parsed.data;

    const isValid = await validateMoyasarKey(secretKey);
    if (!isValid) {
      return NextResponse.json(
        { error: "المفتاح السري غير صحيح أو منتهي — تحققي منه في حساب Moyasar" },
        { status: 422 }
      );
    }

    const encryptedSecret = encryptSecret(secretKey);
    // ⚠️ أمني: هذا السر يوثّق كل إشعارات الدفع الواردة من Moyasar لهذا
    // المتجر — لو تسرّبت قاعدة البيانات نص صريح، يقدر أي حد يزوّر
    // webhook ويعلّم طلبات كأنها مدفوعة بدون دفع فعلي. نشفّره بنفس
    // طريقة secretKey بدل تخزينه نصاً صريحاً.
    const encryptedWebhookSecret = encryptSecret(webhookSecret);

    await prisma.storeSubscription.update({
      where: { storeId },
      data: {
        merchantMoyasarPublishableKey: publishableKey,
        merchantMoyasarSecretKeyEnc: encryptedSecret,
        merchantGatewayWebhookSecret: encryptedWebhookSecret,
        merchantGatewayConnectedAt: new Date(),
      },
    });

    await logAudit({
      actorId: user.id,
      action: "SUBSCRIPTION_CHANGED",
      targetType: "Store",
      targetId: storeId,
      metadata: { event: "payment_gateway_connected" },
      ipAddress: getClientIp(req.headers),
    });

    return NextResponse.json({
      connected: true,
      publishableKey,
      secretKeyPreview: maskSecret(secretKey),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[POST /api/stores/payment-gateway]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// ── GET — حالة الربط الحالية (بدون كشف أي مفتاح حقيقي) ──
export async function GET() {
  try {
    const { storeId } = await requireActiveStore();

    const sub = await prisma.storeSubscription.findUnique({
      where: { storeId },
      select: { merchantMoyasarPublishableKey: true, merchantGatewayConnectedAt: true },
    });

    return NextResponse.json({
      connected: !!sub?.merchantGatewayConnectedAt,
      publishableKey: sub?.merchantMoyasarPublishableKey ?? null,
      connectedAt: sub?.merchantGatewayConnectedAt ?? null,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[GET /api/stores/payment-gateway]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
