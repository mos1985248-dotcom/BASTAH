// app/api/shipping/rates/route.ts
// يجلب سعر شحن حقيقي من شركة الشحن المربوطة بالمتجر، يضيف رسوم بسطة
// الثابتة، يسجّل العرض في ShippingRate، ويرجع السعر النهائي للواجهة.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { shippingRateRequestSchema, formatZodError } from "@/lib/validation";
import { decryptShippingCredentials } from "@/lib/shipping/credentials";
import { ShippingService } from "@/lib/shipping/service";
import { ShippingProviderError } from "@/lib/shipping/types";
import { getBasitaShippingFee } from "@/lib/platform-settings";

export async function POST(req: NextRequest) {
  try {
    // 🔴 كان هذا المسار بلا أي مصادقة — storeId يأتي من جسم الطلب مباشرة
    // ويُستخدم لفك تشفير بيانات اعتماد شركة الشحن الحقيقية لأي متجر
    // واستدعاء API الشركة باسمه. أي زائر مجهول كان يقدر يستنزف حصة أي
    // متجر عند شركة الشحن (وربما يوقف حسابه) ويكشف carrier/totalRate.
    // الإصلاح: تحقق هوية إلزامي + تجاهل أي storeId من العميل نهائياً،
    // ونستخدم دائماً متجر التاجر المسجّل دخوله فقط (نفس نمط بقية مسارات
    // الشحن الأخرى بالضبط — requireActiveStore).
    const { storeId } = await requireActiveStore();

    const body = await req.json();
    const parsed = shippingRateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { destCity, weightKg } = parsed.data;

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { city: true },
    });
    if (!store) {
      return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });
    }

    // أول شركة شحن نشطة مربوطة بالمتجر — لو عندها أكثر من شركة، نأخذ الأقدم ربطاً
    const link = await prisma.storeShipping.findFirst({
      where: { storeId, isActive: true },
      orderBy: { connectedAt: "asc" },
    });
    if (!link) {
      return NextResponse.json(
        { error: "هذا المتجر لم يربط أي شركة شحن بعد" },
        { status: 422 }
      );
    }

    const credentials = decryptShippingCredentials(link.credentialsEnc);
const basitaFee = await getBasitaShippingFee();

if (!store.city) {
  return NextResponse.json(
    { error: "يجب تحديد مدينة المتجر قبل حساب تكلفة الشحن" },
    { status: 400 }
  );
}

const result = await ShippingService.calculateRate(link.carrier, credentials, {
  originCity: store.city,
  destCity,
  weightKg,
});

    const totalRate = result.carrierRate + basitaFee;

    const logged = await prisma.shippingRate.create({
      data: {
        storeId,
        carrier: link.carrier,
        destCity,
        weightKg,
        carrierRate: result.carrierRate,
        basitaFee,
        totalRate,
        currency: result.currency,
        estimatedDays: result.estimatedDays ?? null,
      },
    });

    return NextResponse.json({
      carrier: link.carrier,
      carrierRate: result.carrierRate,
      basitaFee,
      totalRate,
      currency: result.currency,
      estimatedDays: result.estimatedDays ?? null,
      rateId: logged.id,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof ShippingProviderError) {
      // خطأ من شركة الشحن نفسها (بيانات اعتماد منتهية، مدينة غير مدعومة...) — لا تسعير وهمي بديل
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error("[POST /api/shipping/rates]", err);
    return NextResponse.json({ error: "تعذّر جلب سعر الشحن" }, { status: 500 });
  }
}
