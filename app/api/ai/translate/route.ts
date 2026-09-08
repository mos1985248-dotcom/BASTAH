// app/api/ai/translate/route.ts
// ترجمة تجارية — لا يستورد Anthropic مباشرة، يمرّ عبر lib/ai/provider.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, AuthError } from "@/lib/auth";
import { assertHasMuniraAccess } from "@/lib/subscription-limits";
import { checkAiRateLimit } from "@/lib/rate-limit";
import { sanitizeUserInput } from "@/lib/munira/security";
import { callAI } from "@/lib/ai/provider";
import { formatZodError } from "@/lib/validation";

const translateSchema = z.object({
  title:       z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  tags:        z.array(z.string().trim().max(50)).max(20).optional(),
  from:        z.enum(["ar", "en"]),
  to:          z.enum(["ar", "en"]),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user.store) return NextResponse.json({ error: "هذه الخدمة للبائعين فقط" }, { status: 403 });

    await assertHasMuniraAccess(user.store.id);

    const { allowed } = await checkAiRateLimit("seller", `translate:${user.id}`);
    if (!allowed) return NextResponse.json({ error: "وصلتِ للحد اليومي من طلبات الترجمة" }, { status: 429 });

    const body = await req.json();
    const parsed = translateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

    const { title, description, tags, from, to } = parsed.data;
    if (from === to) return NextResponse.json({ title, description, tags });

    // Sanitize translation input
    const check = sanitizeUserInput(`${title} ${description ?? ""}`);
    if (!check.safe) return NextResponse.json({ error: "محتوى غير مدعوم للترجمة" }, { status: 400 });

    const directionLabel = from === "ar"
      ? "من العربية إلى الإنجليزية للسوق الدولي"
      : "من الإنجليزية إلى العربية للسوق السعودي والخليجي";

    const prompt = `أنتِ خبيرة ترجمة تجارية متخصصة في منتجات الحرف اليدوية العربية والسعودية.
ترجمة ${directionLabel}.

قواعد: احفظي المعنى الثقافي لا الحرفي. للتراثيات→الإنجليزي: اشرحي الموروث. للعربي: مصطلحات خليجية طبيعية. احفظي الأرقام والمكونات.

أرجعي JSON فقط (بلا نص إضافي):
{"title":"...","description":"...","tags":["..."]}

العنوان: ${title}
${description ? `الوصف: ${description}` : ""}
${tags?.length ? `الوسوم: ${tags.join(", ")}` : ""}`;

    const text = await callAI({
      prompt,
      userId: user.id,
      storeId: user.store.id,
      route: "/api/ai/translate",
      feature: "translate",
      maxTokens: 1024,
    });

    let result: { title?: string; description?: string; tags?: string[] };
    try {
      result = JSON.parse(text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim());
    } catch {
      return NextResponse.json({ error: "تعذّر معالجة استجابة الترجمة" }, { status: 502 });
    }

    return NextResponse.json({
      title:       result.title       ?? title,
      description: result.description ?? description,
      tags:        result.tags        ?? tags,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[translate-error]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
