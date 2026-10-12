// app/api/stores/marketing-links/route.ts — مسار قديم الاسم محفوظ للتوافق؛ هو واجهة
// «التكاملات» للتاجر: يربط حساباته الخارجية بأنواع فعّلتها الإدارة فقط. لا مفاتيح
// ولا ويب هوك — التوجيه والمزوّدون من اختصاص الإدارة (lib/integrations).
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { validateAccountUrl } from "@/lib/integrations/account-types";
import { getDisabledAccountTypes } from "@/lib/integrations/config";
import { getMerchantView } from "@/lib/integrations/merchant-view";

const bodySchema = z.object({ platform: z.string().trim().min(2).max(20), url: z.string().trim().min(10).max(400) });

export async function GET() {
  try {
    const { storeId } = await requireActiveStore();
    return NextResponse.json(await getMerchantView(storeId));
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/stores/marketing-links]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { storeId } = await requireActiveStore();
    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "أدخلي نوع الحساب والرابط" }, { status: 400 });

    // التحقق من الخادم: النوع المعطَّل من الإدارة مرفوض حتى لو أُرسل يدوياً
    if ((await getDisabledAccountTypes()).includes(parsed.data.platform)) {
      return NextResponse.json({ error: "هذا النوع من الحسابات غير متاح حالياً" }, { status: 403 });
    }

    let url: string;
    try {
      url = validateAccountUrl(parsed.data.platform, parsed.data.url);
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "الرابط غير صحيح" }, { status: 400 });
    }

    const link = await prisma.storeMarketingLink.upsert({
      where: { storeId_platform: { storeId, platform: parsed.data.platform } },
      create: { storeId, platform: parsed.data.platform, url },
      update: { url },
      select: { platform: true, url: true },
    });
    return NextResponse.json({ link }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/stores/marketing-links]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
