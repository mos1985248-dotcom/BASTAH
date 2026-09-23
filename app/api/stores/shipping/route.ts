// app/api/stores/shipping/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { connectShippingSchema, formatZodError } from "@/lib/validation";
import { encryptShippingCredentials } from "@/lib/shipping/credentials";
import { SHIPPING_PROVIDER_METADATA } from "@/lib/shipping/metadata";
import { getBasitaShippingFee, getCodFee } from "@/lib/platform-settings";
import { ShippingProviderError } from "@/lib/shipping/types";

// GET — قائمة شركات الشحن المربوطة بالمتجر + المتاحة للربط + رسوم المنصة
// الحقيقية (مصدر واحد للتاجر — بدل endpoint منفصل، بطلب أحمد صراحة)
export async function GET() {
  try {
    const { storeId } = await requireActiveStore();
    const connected = await prisma.storeShipping.findMany({
      where: { storeId },
      select: { id: true, carrier: true, isActive: true, connectedAt: true, lastTestedAt: true, lastTestOk: true, customProviderId: true },
    });
    const [basitaShippingFee, codFee] = await Promise.all([getBasitaShippingFee(), getCodFee("CASH_ON_DELIVERY")]);

    // ⚠️ ARAMEX/SPL تظهر للتاجر فقط لو الإدارة فعّلتها فعليًا (بيانات
    // اعتماد مشتركة نشطة) — مو كل شركة مسجَّلة بالكود بغض النظر عن التفعيل
    const activePlatformCreds: { carrier: string }[] = await prisma.platformCarrierCredential.findMany({
      where: { isActive: true },
      select: { carrier: true },
    });
    const supported = activePlatformCreds.map(({ carrier }) => ({
      carrier,
      displayNameAr: SHIPPING_PROVIDER_METADATA[carrier]?.displayNameAr ?? carrier,
    }));

    // الأسماء الحقيقية لشركات "بدون كود" (CUSTOM) — تُضاف/تُعطَّل من لوحة
    // الأدمن فتُجلَب حياً
    const customProviders = await prisma.shippingProviderConfig.findMany({
      where: { isActive: true },
      select: { id: true, carrierKey: true, displayNameAr: true },
    });

    return NextResponse.json({
      connected,
      supported,
      customProviders,
      platformFees: { basitaShippingFee, codFee },
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// POST — تفعيل/ربط شركة شحن لمتجر التاجر (بدون أي بيانات اعتماد منه —
// كل الشركات (ARAMEX/SPL/CUSTOM) صار مصدر بياناتها إداري مشترك)
export async function POST(req: NextRequest) {
  try {
    const { storeId } = await requireActiveStore();
    const body = await req.json();
    const parsed = connectShippingSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

    const { carrier, customProviderId } = parsed.data;

    // ⚠️ تحكّم مركزي (تغيير معماري): التاجر هنا فقط يتحقق إن الشركة
    // مفعّلة من الإدارة، ثم يفعّل/يلغي ربط متجره بها. لا بيانات اعتماد منه إطلاقاً.
    if (carrier === "CUSTOM") {
      if (!customProviderId) {
        return NextResponse.json({ error: "لازم تحددي أي شركة شحن مخصَّصة تبين تربطيها" }, { status: 400 });
      }
      const config = await prisma.shippingProviderConfig.findUnique({ where: { id: customProviderId } });
      if (!config || !config.isActive) {
        return NextResponse.json({ error: "شركة الشحن هذي غير متاحة حالياً" }, { status: 404 });
      }
    } else {
      const platformCred = await prisma.platformCarrierCredential.findUnique({ where: { carrier: carrier as any } });
      if (!platformCred || !platformCred.isActive) {
        return NextResponse.json({ error: "هذي الشركة غير مفعّلة حالياً من الإدارة — تواصلي مع الدعم" }, { status: 422 });
      }
    }

    const record = await prisma.storeShipping.upsert({
      where: { storeId_carrier: { storeId, carrier: carrier as any } },
      update: { customProviderId: customProviderId ?? null, isActive: true },
      create: {
        storeId,
        carrier: carrier as any,
        customProviderId: customProviderId ?? null,
        credentialsEnc: encryptShippingCredentials({}), // placeholder غير مستخدَم فعلياً بعد الآن — راجع service.ts
      },
      select: { id: true, carrier: true, isActive: true, connectedAt: true, customProviderId: true },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof ShippingProviderError) return NextResponse.json({ error: err.message }, { status: 502 });
    console.error("[POST /api/stores/shipping]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
