// app/api/marketing/content/route.ts
// بنية فقط (القسم ٣) — لا يوجد أي استدعاء شبكي خارجي بهذا الملف. كل
// محتوى يُنشأ بحالة DRAFT دائماً (لا نقبل status من العميل إطلاقاً)،
// وينشئ سجل ConversionMetric مرتبط بأصفار حقيقية فوراً — لا قيم وهمية.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { createMarketingContentSchema, formatZodError } from "@/lib/validation";

// ── POST — إنشاء مسودة محتوى (DRAFT دائماً) ──
export async function POST(req: NextRequest) {
  try {
    const { storeId } = await requireActiveStore();

    const body = await req.json();
    const parsed = createMarketingContentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }

    const content = await prisma.marketingContent.create({
      data: {
        storeId,
        title: parsed.data.title,
        videoUrl: parsed.data.videoUrl ?? null,
        status: "DRAFT", // لا نقبل حالة من العميل — DRAFT دائماً بهذه المرحلة
        providerName: null, // "غير محدد" حتى يُربط Provider فعلي لاحقاً
        metric: { create: {} }, // صفوف صفرية حقيقية فوراً — لا قيم وهمية بالواجهة
      },
      include: { metric: true },
    });

    return NextResponse.json({ content }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/marketing/content]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

// ── GET — قائمة محتوى المتجر ──
export async function GET() {
  try {
    const { storeId } = await requireActiveStore();

    const content = await prisma.marketingContent.findMany({
      where: { storeId },
      include: { metric: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ content });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/marketing/content]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
