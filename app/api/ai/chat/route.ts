// app/api/ai/chat/route.ts
// منيرة — chat endpoint محدَّث بـ:
// 1) Security: input sanitization + injection protection (lib/munira/security.ts)
// 2) Provider abstraction: يُستدعى عبر lib/ai/provider.ts لا Anthropic مباشرة
// 3) Conversation persistence: يكتب في ChatSession + ChatMessage (schema موجود)
// 4) AIUsage tracking: تلقائي داخل provider.ts
// 5) Role-aware rate limiting: guest/buyer/seller/admin بحدود يومية مختلفة

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { assertHasMuniraAccess } from "@/lib/subscription-limits";
import { checkAiRateLimit } from "@/lib/rate-limit";
import { detectLanguageFromText, detectLanguageFromHeader } from "@/lib/munira/language";
import { buildMuniraSystemPrompt, type UserRole } from "@/lib/munira/prompt";
import { sanitizeUserInput, INJECTION_ERROR_MESSAGES } from "@/lib/munira/security";
import { createChatStream } from "@/lib/ai/provider";
import { prisma } from "@/lib/prisma";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  // ⚠️ أمني: userType كان يُقرأ سابقاً من هيدر x-user-type (يتحكم فيه
  // العميل بالكامل)، ويُستخدم لتحديد بوابة اشتراك منيرة (GROWTH/PRO) —
  // بائع بخطة FREE يقدر يرسل x-user-type: buyer ويتجاوز البوابة. الحين
  // نشتقّه من currentUser (مصدر موثوق من الجلسة + DB) لا من أي هيدر.
  const userType: UserRole =
    currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN" ? "admin"
    : currentUser?.store ? "seller"
    : currentUser ? "buyer"
    : "guest";
  const rateLimitKey = currentUser?.id ?? ip;

  // Role-aware rate limiting
  const { allowed } = await checkAiRateLimit(userType, rateLimitKey);
  if (!allowed) {
    return NextResponse.json(
      { error: "وصلتِ للحد اليومي من رسائل منيرة — جرّبي مجدداً غداً" },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body?.messages || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: "messages مطلوب" }, { status: 400 });
  }

  const messages: IncomingMessage[] = body.messages.slice(-20);
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // ── Sanitize every user message (not assistant turns)
  for (const msg of messages) {
    if (msg.role !== "user") continue;
    const check = sanitizeUserInput(msg.content);
    if (!check.safe) {
      const lang = detectLanguageFromText(msg.content).primary;
      const errorMsg =
        INJECTION_ERROR_MESSAGES[check.reason!]?.[lang] ??
        INJECTION_ERROR_MESSAGES[check.reason!]?.["ar"] ??
        "طلب غير مدعوم";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }
    // Replace content with sanitized version
    msg.content = check.sanitizedContent ?? msg.content;
  }

  // ── Language detection
  const preferredLang = body.preferredLanguage ?? null;
  const textDetection = detectLanguageFromText(lastUserMsg);
  const headerLang = detectLanguageFromHeader(req.headers.get("accept-language"));
  const language = preferredLang ?? textDetection.primary ?? headerLang ?? "ar";

  // ── Seller Munira gating (GROWTH/PRO only)
  if (userType === "seller" && currentUser?.store) {
    try {
      await assertHasMuniraAccess(currentUser.store.id);
    } catch (err: any) {
      return NextResponse.json({ error: err.message, upgradeRequired: true }, { status: 403 });
    }
  }

  // ── Store context for seller prompts
  let storeName: string | undefined;
  let planName: string | undefined;
  if (userType === "seller" && currentUser?.store) {
    const sub = await prisma.storeSubscription.findUnique({
      where: { storeId: currentUser.store.id },
      include: { store: { select: { nameAr: true } } },
    });
    storeName = sub?.store?.nameAr ?? undefined;
    const planConfig = sub?.plan
      ? await prisma.subscriptionPlanConfig.findUnique({
          where: { plan: sub.plan },
          select: { nameAr: true },
        })
      : null;
    planName = planConfig?.nameAr ?? undefined;
  }

  // ── Conversation persistence (ChatSession + ChatMessage)
  const sessionId: string | null = body.sessionId ?? null;
  let resolvedSessionId: string | null = sessionId;

  if (!sessionId) {
    // إنشاء جلسة جديدة — للزوّار نحفظ guestToken من الـ body لو وُجد
    const session = await prisma.chatSession.create({
      data: {
        userId: currentUser?.id ?? null,
        storeId: currentUser?.store?.id ?? null,
        language,
        isGuest: !currentUser,
        guestToken: !currentUser ? (body.guestToken ?? null) : null,
        sessionType: body.sessionType ?? "general",
      },
    });
    resolvedSessionId = session.id;
  }

  // حفظ رسالة المستخدم الأخيرة
  if (resolvedSessionId && lastUserMsg) {
    await prisma.chatMessage.create({
      data: {
        sessionId: resolvedSessionId,
        role: "USER",
        content: lastUserMsg,
        metadata: { language, isMixed: textDetection.isMixed },
      },
    }).catch((err) => console.error("[chat-message-save-failed]", err));
  }

  const systemPrompt = buildMuniraSystemPrompt({
    role: userType,
    language: language as any,
    storeName,
    planName,
    isMixed: textDetection.isMixed,
  });

  // ── Streaming via provider abstraction (security + usage tracking built-in)
  const stream = createChatStream({
    systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    userId: currentUser?.id,
    storeId: currentUser?.store?.id,
    sessionId: resolvedSessionId ?? undefined,
    route: "/api/ai/chat",
    feature: "chat",
  });

  // بعد انتهاء الـ stream: حفظ رد منيرة (background — لا نُبطئ الـ stream)
  // نستخدم TransformStream لاعتراض البيانات وحفظها
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let fullAssistantResponse = "";

  const { readable, writable } = new TransformStream({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true });
      // استخرج النص من SSE data lines
      for (const line of text.split("\n")) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          try {
            const delta = JSON.parse(line.slice(6))?.delta?.text;
            if (delta) fullAssistantResponse += delta;
          } catch {}
        }
      }
      controller.enqueue(chunk);
    },
    flush() {
      // حفظ رد منيرة بعد انتهاء الـ stream
      if (resolvedSessionId && fullAssistantResponse) {
        prisma.chatMessage.create({
          data: {
            sessionId: resolvedSessionId,
            role: "ASSISTANT",
            content: fullAssistantResponse,
          },
        }).catch((err) => console.error("[assistant-message-save-failed]", err));
      }
    },
  });

  stream.pipeTo(writable).catch(() => {});

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      // إعادة sessionId للعميل حتى يستمر في نفس المحادثة
      "X-Session-Id": resolvedSessionId ?? "",
    },
  });
}
