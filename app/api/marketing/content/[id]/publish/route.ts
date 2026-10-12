// app/api/marketing/content/[id]/publish/route.ts
// إرسال محتوى للنشر عبر نظام التكاملات المركزي (إجراء صريح من التاجر). هذا المسار
// أحد مصادر الحدث content.publish وليس شرطاً له: أي مصدر محتوى آخر يستطيع إطلاقه.
// PUBLISHED = استلمته منظومة الإدارة (2xx) — النشر الفعلي تتولاه أتمتة الإدارة.
// FAILED عند الرفض/الفشل ويمكن إعادة المحاولة.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { emitIntegrationEvent } from "@/lib/integrations/engine";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { storeId } = await requireActiveStore();

    const content = await prisma.marketingContent.findFirst({ where: { id: params.id, storeId } });
    if (!content) return NextResponse.json({ error: "المحتوى غير موجود" }, { status: 404 });
    if (content.status === "PUBLISHED") return NextResponse.json({ error: "هذا المحتوى أُرسل مسبقاً" }, { status: 409 });

    const outcome = await emitIntegrationEvent({
      type: "content.publish", source: "marketing-content", storeId,
      data: { contentId: content.id, title: content.title, videoUrl: content.videoUrl ?? null },
    });

    if (outcome.status === "skipped") {
      const messages = {
        unknown_event: "حدث غير مسموح",
        event_disabled: "خدمة النشر غير مفعّلة من إدارة بسطة",
        payload_too_large: "المحتوى كبير جداً",
        no_provider: "الربط المركزي غير مفعّل من إدارة بسطة بعد",
        no_accounts: "أضيفي حساباً خارجياً واحداً على الأقل أولاً",
      } as const;
      const status = outcome.reason === "no_accounts" || outcome.reason === "payload_too_large" ? 400 : 503;
      return NextResponse.json({ error: messages[outcome.reason!] }, { status });
    }
    const delivered = outcome.status === "delivered" || outcome.status === "partial";

    const updated = await prisma.marketingContent.update({
      where: { id: content.id },
      data: { status: delivered ? "PUBLISHED" : "FAILED", providerName: outcome.results.filter((r) => r.ok).map((r) => r.provider).join(",") || null },
      include: { metric: true },
    });
    if (!delivered) return NextResponse.json({ error: "تعذّر الإرسال، حاولي لاحقاً", content: updated }, { status: 502 });
    return NextResponse.json({ content: updated });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/marketing/content/[id]/publish]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
