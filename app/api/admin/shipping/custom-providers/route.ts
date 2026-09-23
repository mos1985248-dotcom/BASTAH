// app/api/admin/shipping/custom-providers/route.ts
// إدارة شركات الشحن "بدون كود" (ShippingProviderConfig) — الإدارة فقط.
// بعكس ARAMEX/SPL (مسجَّلتين بالكود)، هذي الشركات تُضاف من هنا مباشرة:
// اسم + رابط API + مسار التسعير + مفتاح. راجع lib/shipping/providers/generic.ts
// للعقد المتوقَّع من endpoint الشركة (POST {baseUrl}{ratePath} → {rate}).

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { createShippingProviderConfigSchema, formatZodError } from "@/lib/validation";
import { encryptSecret } from "@/lib/crypto";
import { GenericRestProvider } from "@/lib/shipping/providers/generic";
import { logAudit, getClientIp } from "@/lib/audit-log";

// ── POST — إضافة شركة شحن جديدة (يختبر الاتصال فعلياً قبل الحفظ) ──
export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");

    const body = await req.json();
    const parsed = createShippingProviderConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { carrierKey, displayNameAr, providerType } = parsed.data;

    const existing = await prisma.shippingProviderConfig.findUnique({ where: { carrierKey } });
    if (existing) {
      return NextResponse.json({ error: "المعرّف مستخدَم مسبقاً — اختاري معرّفاً آخر" }, { status: 409 });
    }

    const provider = new GenericRestProvider();

    if (parsed.data.providerType === "MANUAL") {
      // ⚠️ شركة بدون أي نظام تقني — صفر اتصال شبكي، فقط تحقق الأرقام
      // (getRate بنفسه يرمي خطأ واضح لو flatFee/perKgFee غير صالحة)
      const { flatFee, perKgFee, agentName, agentPhone, vehicleType, vehiclePlate, licenseNumber, serviceCity } = parsed.data;
      const config = await prisma.shippingProviderConfig.create({
        data: {
          carrierKey, displayNameAr, providerType: "MANUAL", flatFee, perKgFee,
          agentName, agentPhone, vehicleType, vehiclePlate, licenseNumber, serviceCity,
        },
        select: {
          id: true, carrierKey: true, displayNameAr: true, providerType: true, flatFee: true, perKgFee: true,
          agentName: true, agentPhone: true, vehicleType: true, vehiclePlate: true, licenseNumber: true, serviceCity: true,
          isActive: true, createdAt: true,
        },
      });

      await logAudit({
        actorId: admin.id, action: "SHIPPING_PROVIDER_ADDED", targetType: "ShippingProviderConfig", targetId: config.id,
        metadata: { event: "custom_shipping_provider_created", carrierKey, providerType: "MANUAL" },
        ipAddress: getClientIp(req.headers),
      });
      return NextResponse.json({ provider: config }, { status: 201 });
    }

    // ── REST: اختبار اتصال حقيقي قبل الحفظ — لا نخزّن شركة "بدون كود"
    // لم نتأكد إنها ترد فعلياً بالشكل المتوقَّع (نفس فلسفة "لا بيانات
    // وهمية" بكل المشروع) ──
    const { baseUrl, ratePath, apiKey } = parsed.data;
    const connectionOk = await provider.testCredentials({ baseUrl, ratePath, apiKey });
    if (!connectionOk) {
      return NextResponse.json(
        { error: "تعذّر الاتصال بالشركة بهذي البيانات — تأكدي من الرابط والمفتاح، ومن إن الرد يطابق العقد المطلوب ({ rate: number })" },
        { status: 422 }
      );
    }

    const config = await prisma.shippingProviderConfig.create({
      data: { carrierKey, displayNameAr, providerType: "REST", baseUrl, ratePath, apiKeyEnc: encryptSecret(apiKey) },
      select: { id: true, carrierKey: true, displayNameAr: true, providerType: true, baseUrl: true, ratePath: true, isActive: true, createdAt: true },
    });

    await logAudit({
      actorId: admin.id, action: "SHIPPING_PROVIDER_ADDED", targetType: "ShippingProviderConfig", targetId: config.id,
      metadata: { event: "custom_shipping_provider_created", carrierKey, providerType: "REST" },
      ipAddress: getClientIp(req.headers),
    });

    return NextResponse.json({ provider: config }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/admin/shipping/custom-providers]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// ── GET — قائمة الشركات المخصَّصة (بدون كشف المفتاح المشفَّر) ──
export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");

    const providers = await prisma.shippingProviderConfig.findMany({
      select: {
        id: true, carrierKey: true, displayNameAr: true, providerType: true,
        baseUrl: true, ratePath: true, flatFee: true, perKgFee: true,
        agentName: true, agentPhone: true, vehicleType: true, vehiclePlate: true, licenseNumber: true, serviceCity: true,
        isActive: true, createdAt: true,
        _count: { select: { storeLinks: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    interface ProviderRow {
      id: string; carrierKey: string; displayNameAr: string; providerType: string;
      baseUrl: string | null; ratePath: string | null; flatFee: number | null; perKgFee: number | null;
      agentName: string | null; agentPhone: string | null; vehicleType: string | null; vehiclePlate: string | null;
      licenseNumber: string | null; serviceCity: string | null;
      isActive: boolean; createdAt: Date; _count: { storeLinks: number };
    }

    return NextResponse.json({
      providers: (providers as ProviderRow[]).map((p) => ({ ...p, connectedStores: p._count.storeLinks, _count: undefined })),
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/admin/shipping/custom-providers]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// ── PATCH — تفعيل/تعطيل شركة مخصَّصة (كل المتاجر المربوطة بها تتوقف/تعود فورًا) ──
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    const { id, isActive } = await req.json();
    if (typeof isActive !== "boolean" || !id) {
      return NextResponse.json({ error: "id وisActive مطلوبان" }, { status: 400 });
    }

    const record = await prisma.shippingProviderConfig.update({
      where: { id },
      data: { isActive },
      select: { id: true, carrierKey: true, isActive: true },
    });

    await logAudit({
      actorId: admin.id, action: "SHIPPING_PROVIDER_ADDED", targetType: "ShippingProviderConfig", targetId: record.id,
      metadata: { event: isActive ? "custom_provider_enabled" : "custom_provider_disabled", carrierKey: record.carrierKey },
      ipAddress: getClientIp(req.headers),
    });

    return NextResponse.json({ record });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[PATCH /api/admin/shipping/custom-providers]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
