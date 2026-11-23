import { requireStoreFeature, assertStoreFeature } from "@/lib/feature-access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError } from "@/lib/auth";
import { emitIntegrationEvent } from "@/lib/integrations/engine";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { storeId } = await requireStoreFeature("marketing_content");

    await assertStoreFeature(storeId, "social");
    const content = await prisma.marketingContent.findFirst({ where: { id: params.id, storeId } });
    if (!content) return NextResponse.json({ error: "المحتوى غير موجود" }, { status: 404 });
    if (content.status === "PUBLISHED" || content.status === "PENDING_CONNECTION") return NextResponse.json({ error: "هذا المحتوى أُرسل مسبقاً" }, { status: 409 });

    const outcome = await emitIntegrationEvent({
      type: "content.publish", source: "marketing-content", storeId,
      data: { contentId: content.id, title: content.title, body: content.body, kind: content.kind, videoUrl: content.videoUrl ?? null },
    });

    if (outcome.status === "skipped") {
      const messages = {
        unknown_event: "حدث غير مسموح",
        event_disabled: "خدمة النشر غير مفعّلة من إدارة بسطة مارت",
        payload_too_large: "المحتوى كبير جداً",
        no_provider: "الربط المركزي غير مفعّل من إدارة بسطة مارت بعد",
        no_accounts: "أضيفي حساباً خارجياً واحداً على الأقل أولاً",
      } as const;
      const status = outcome.reason === "no_accounts" || outcome.reason === "payload_too_large" ? 400 : 503;
      return NextResponse.json({ error: messages[outcome.reason!] }, { status });
    }
    const delivered = outcome.status === "delivered" || outcome.status === "partial";

    const updated = await prisma.marketingContent.update({
      where: { id: content.id },
      data: { status: delivered ? "PENDING_CONNECTION" : "FAILED", providerName: outcome.results.filter((r) => r.ok).map((r) => r.provider).join(",") || null },
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
