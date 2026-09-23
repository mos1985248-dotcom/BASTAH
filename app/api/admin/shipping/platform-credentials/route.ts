// app/api/admin/shipping/platform-credentials/route.ts
// إدارة بيانات اعتماد أرامكس/SPL المشتركة (PlatformCarrierCredential) —
// الإدارة فقط. حقول الاعتماد المطلوبة تختلف حسب الشركة (تُقرأ ديناميكياً
// من provider.requiredCredentialFields، لا حقول ثابتة هنا) — نفس الحقول
// اللي كان كل تاجر يدخلها بنفسه سابقاً بـ/api/stores/shipping.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { encryptSecret } from "@/lib/crypto";
import { getShippingProvider, listSupportedCarriers } from "@/lib/shipping/registry";
import { logAudit, getClientIp } from "@/lib/audit-log";
import { z } from "zod";

const bodySchema = z.object({
  carrier: z.enum(listSupportedCarriers() as [string, ...string[]]),
  credentials: z.record(z.string().trim().min(1)),
});

// ── POST — حفظ/تحديث بيانات اعتماد شركة (يختبر الاتصال فعلياً قبل الحفظ) ──
export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
    }
    const { carrier, credentials } = parsed.data;

    if (carrier === "CUSTOM") {
      return NextResponse.json(
        { error: "الشركات المخصَّصة (بدون كود) تُدار من /api/admin/shipping/custom-providers، مو من هنا" },
        { status: 422 }
      );
    }

    const provider = getShippingProvider(carrier as any);
    const missing = provider.requiredCredentialFields.filter((f) => !credentials[f]);
    if (missing.length > 0) {
      return NextResponse.json({ error: `بيانات ناقصة: ${missing.join(", ")}` }, { status: 400 });
    }

    // ⚠️ اختبار اتصال حقيقي قبل الحفظ — نفس مبدأ "لا بيانات وهمية" بكل المشروع
    const connectionOk = await provider.testCredentials(credentials);

    const record = await prisma.platformCarrierCredential.upsert({
      where: { carrier: carrier as any },
      update: { credentialsEnc: encryptSecret(JSON.stringify(credentials)), lastTestedAt: new Date(), lastTestOk: connectionOk },
      create: { carrier: carrier as any, credentialsEnc: encryptSecret(JSON.stringify(credentials)), lastTestedAt: new Date(), lastTestOk: connectionOk },
      select: { id: true, carrier: true, isActive: true, lastTestedAt: true, lastTestOk: true },
    });

    await logAudit({
      actorId: admin.id,
      action: "SHIPPING_PROVIDER_ADDED",
      targetType: "PlatformCarrierCredential",
      targetId: record.id,
      metadata: { event: "platform_carrier_credential_saved", carrier, connectionOk },
      ipAddress: getClientIp(req.headers),
    });

    if (!connectionOk) {
      return NextResponse.json(
        { record, warning: "تم الحفظ لكن تعذّر التحقق من صحة البيانات بالاتصال الفعلي — راجعيها" },
        { status: 201 }
      );
    }
    return NextResponse.json({ record }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/admin/shipping/platform-credentials]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// ── GET — حالة كل شركة (بدون كشف بيانات الاعتماد الفعلية) ──
export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");

    const records = await prisma.platformCarrierCredential.findMany({
      select: { carrier: true, isActive: true, lastTestedAt: true, lastTestOk: true, updatedAt: true },
    });

    interface CredRow {
      carrier: string; isActive: boolean; lastTestedAt: Date | null; lastTestOk: boolean | null; updatedAt: Date;
    }
    const byCarrier = new Map((records as CredRow[]).map((r) => [r.carrier, r]));
    const carriers = listSupportedCarriers()
      .filter((c) => c !== "CUSTOM")
      .map((carrier) => {
        const r = byCarrier.get(carrier);
        return {
          carrier,
          configured: !!r,
          isActive: r?.isActive ?? false,
          lastTestedAt: r?.lastTestedAt ?? null,
          lastTestOk: r?.lastTestOk ?? null,
          requiredCredentialFields: getShippingProvider(carrier).requiredCredentialFields,
        };
      });

    return NextResponse.json({ carriers });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/admin/shipping/platform-credentials]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// ── PATCH — تفعيل/تعطيل بدون لمس بيانات الاعتماد المحفوظة ──
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    const { carrier, isActive } = await req.json();
    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "isActive مطلوب (true/false)" }, { status: 400 });
    }

    const record = await prisma.platformCarrierCredential.update({
      where: { carrier },
      data: { isActive },
      select: { id: true, carrier: true, isActive: true },
    });

    await logAudit({
      actorId: admin.id, action: "SHIPPING_PROVIDER_ADDED", targetType: "PlatformCarrierCredential", targetId: record.id,
      metadata: { event: isActive ? "platform_carrier_enabled" : "platform_carrier_disabled", carrier },
      ipAddress: getClientIp(req.headers),
    });

    return NextResponse.json({ record });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[PATCH /api/admin/shipping/platform-credentials]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// ⚠️ لا يوجد DELETE — مكرَّر وظيفياً مع PATCH {isActive: false}.
// استخدمي PATCH لكل من التفعيل والتعطيل.
