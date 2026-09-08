// app/api/marketing/content/[id]/metrics/route.ts
// يرجع المقاييس الحقيقية المخزَّنة بقاعدة البيانات — كلها صفر حالياً لعدم
// وجود Provider مربوط بعد، وهذا متوقع وصحيح (ليس عطلاً). لا مزامنة هنا
// ولا أي استدعاء شبكي خارجي.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { storeId } = await requireActiveStore();

    const content = await prisma.marketingContent.findUnique({
      where: { id: params.id },
      include: { metric: true },
    });

    if (!content || content.storeId !== storeId) {
      return NextResponse.json({ error: "المحتوى غير موجود" }, { status: 404 });
    }

    // متوقع ألا يوجد metric بعد لو أُنشئ المحتوى قبل هذا التحديث — نرجع
    // أصفاراً حقيقية بنفس الشكل، لا قيماً وهمية
    const metric = content.metric ?? {
      views: 0,
      clicksToProduct: 0,
      purchasesAttributed: 0,
      lastSyncedAt: null,
    };

    return NextResponse.json({ metrics: metric });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/marketing/content/[id]/metrics]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
