// app/api/stores/shipping/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { connectShippingSchema, formatZodError } from "@/lib/validation";
import { encryptShippingCredentials } from "@/lib/shipping/credentials";
import { getShippingProvider, listSupportedCarriers } from "@/lib/shipping/registry";
import { SHIPPING_PROVIDER_METADATA } from "@/lib/shipping/metadata";
import { getBasitaShippingFee, getCodFee } from "@/lib/platform-settings";
import { ShippingService } from "@/lib/shipping/service";
import { ShippingProviderError } from "@/lib/shipping/types";

// GET — قائمة شركات الشحن المربوطة بالمتجر + المتاحة للربط + رسوم المنصة
// الحقيقية (مصدر واحد للتاجر — بدل endpoint منفصل، بطلب أحمد صراحة)
export async function GET() {
  try {
    const { storeId } = await requireActiveStore();
    const connected = await prisma.storeShipping.findMany({
      where: { storeId },
      select: { id: true, carrier: true, isActive: true, connectedAt: true, lastTestedAt: true, lastTestOk: true },
    });
    const supported = listSupportedCarriers();
    const [basitaShippingFee, codFee] = await Promise.all([getBasitaShippingFee(), getCodFee("CASH_ON_DELIVERY")]);

    return NextResponse.json({
      connected,
      supported: supported.map((carrier) => ({
        carrier,
        displayNameAr: SHIPPING_PROVIDER_METADATA[carrier]?.displayNameAr ?? carrier,
      })),
      platformFees: { basitaShippingFee, codFee },
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// POST — ربط شركة شحن جديدة أو تحديث بيانات اعتمادها
export async function POST(req: NextRequest) {
  try {
    const { storeId } = await requireActiveStore();
    const body = await req.json();
    const parsed = connectShippingSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

    const { carrier, credentials } = parsed.data;
    const provider = getShippingProvider(carrier as any);

    // تحقق من الحقول المطلوبة لهذه الشركة بالتحديد
    const missing = provider.requiredCredentialFields.filter((f) => !credentials[f]);
    if (missing.length > 0) {
      return NextResponse.json({ error: `بيانات ناقصة: ${missing.join(", ")}` }, { status: 400 });
    }

    // اختبار حقيقي لبيانات الاعتماد عند الشركة قبل حفظها — عبر ShippingService (retry + timeout موحّدان)
    const isValid = await ShippingService.testConnection(carrier as any, credentials);
    if (!isValid) {
      return NextResponse.json({ error: "بيانات الاعتماد غير صحيحة أو منتهية الصلاحية" }, { status: 422 });
    }

    const credentialsEnc = encryptShippingCredentials(credentials);

    const record = await prisma.storeShipping.upsert({
      where: { storeId_carrier: { storeId, carrier: carrier as any } },
      update: { credentialsEnc, isActive: true, lastTestedAt: new Date(), lastTestOk: true },
      create: { storeId, carrier: carrier as any, credentialsEnc, lastTestedAt: new Date(), lastTestOk: true },
      select: { id: true, carrier: true, isActive: true, connectedAt: true },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err instanceof ShippingProviderError) return NextResponse.json({ error: err.message }, { status: 502 });
    console.error("[POST /api/stores/shipping]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
