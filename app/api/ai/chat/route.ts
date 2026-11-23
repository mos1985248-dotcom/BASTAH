import { createHash, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { checkAiRateLimit } from "@/lib/rate-limit";
import { detectLanguageFromText, PRIORITY_LANGUAGES, type SupportedLanguage } from "@/lib/munira/language";
import { sanitizeUserInput, INJECTION_ERROR_MESSAGES } from "@/lib/munira/security";
import { freeAnswer, freeUnavailable } from "@/lib/munira/free-router";
import { localPricingAnswer, muniraPrompt, redactPrompt } from "@/lib/munira/context";
import { completeMessage, MuniraRequestError, releaseMessage, reserveMessage } from "@/lib/munira/quota";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

const requestBody = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(5000) })).min(1).max(21),
  sessionId: z.string().cuid().nullish(),
  requestId: z.string().uuid().optional(),
  guestToken: z.string().uuid().optional(),
  preferredLanguage: z.string().max(8).optional(),
  sessionType: z.enum(["general", "store_setup", "product", "analysis"]).optional(),
});

function reply(text: string, sessionId: string) {
  return new Response(`data: ${JSON.stringify({ delta: { text } })}\n\ndata: [DONE]\n\n`, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "private, no-store", "X-Session-Id": sessionId },
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const role = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? "admin" :
      user?.role === "SELLER" ? "seller" : user ? "buyer" : "guest";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (!(await checkAiRateLimit(role, user?.id ?? ip)).allowed) {
      return NextResponse.json({ error: "وصلت إلى الحد اليومي من رسائل منيرة." }, { status: 429 });
    }
    const parsed = requestBody.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "بيانات الرسالة غير صالحة." }, { status: 400 });
    const body = parsed.data;
    const last = body.messages.at(-1);
    if (last?.role !== "user" || !last.content.trim()) return NextResponse.json({ error: "اكتب رسالة أولًا." }, { status: 400 });

    const detection = detectLanguageFromText(last.content);
    const preferred = body.preferredLanguage as SupportedLanguage | undefined;
    const language = preferred && PRIORITY_LANGUAGES.includes(preferred) ? preferred : detection.primary;
    const checked = sanitizeUserInput(last.content);
    if (!checked.safe) {
      return NextResponse.json({ error: INJECTION_ERROR_MESSAGES[checked.reason!]?.[language] ?? "رسالة غير مدعومة." }, { status: 400 });
    }

    const guestToken = body.guestToken ?? randomUUID();
    const storeId = role === "seller" ? user?.store?.id : undefined;
    if (role === "seller" && !storeId) throw new MuniraRequestError("لم يُربط الحساب بمتجر.", 403);
    const session = body.sessionId ? await prisma.chatSession.findFirst({
      where: {
        id: body.sessionId, isArchived: false, isGuest: !user,
        userId: user?.id ?? null, storeId: storeId ?? null,
        ...(user ? {} : { guestToken }),
      },
      select: { id: true },
    }) : null;
    if (body.sessionId && !session) throw new MuniraRequestError("المحادثة غير موجودة.", 404);

    const content = redactPrompt(checked.sanitizedContent ?? last.content);
    const ticket = { scope: storeId ? `store:${storeId}` : user ? `user:${user.id}` : `guest:${guestToken}`, requestId: body.requestId ?? randomUUID() };
    const inputHash = createHash("sha256").update(content).digest("hex");
    const reservation = await reserveMessage({ ...ticket, storeId, inputHash });
    if (reservation.replay) return reply(reservation.replay.response, reservation.replay.sessionId);
    const { lease } = reservation;

    try {
      const history = session ? await prisma.chatMessage.findMany({
        where: { sessionId: session.id }, select: { role: true, content: true },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 7,
      }) : [];
      const recent = history.slice(0, 4).reverse().map(message => ({
        role: message.role === "USER" ? "user" as const : "assistant" as const,
        content: redactPrompt(message.content).slice(0, 450),
      }));
      const older = history.slice(4).filter(message => message.role === "USER").map(message => message.content);
      const local = localPricingAnswer(content);
      const answer = local ? { text: local } : await freeAnswer({
        system: muniraPrompt(language, role, older),
        messages: [...recent, { role: "user", content }], maxTokens: 450,
      }, { feature: "chat", route: "/api/ai/chat", userId: user?.id, storeId, sessionId: session?.id });

      const sessionId = await completeMessage(ticket, lease, answer.text, async tx => {
        const id = session?.id ?? (await tx.chatSession.create({
          data: { userId: user?.id, storeId, isGuest: !user, guestToken: user ? null : guestToken, language, sessionType: body.sessionType },
          select: { id: true },
        })).id;
        const createdAt = new Date();
        await tx.chatMessage.createMany({ data: [
          { sessionId: id, role: "USER", content, createdAt },
          { sessionId: id, role: "ASSISTANT", content: answer.text, createdAt: new Date(createdAt.getTime() + 1) },
        ] });
        return id;
      });
      return reply(answer.text, sessionId);
    } catch (error) {
      await releaseMessage(ticket, lease);
      if (error instanceof MuniraRequestError) throw error;
      return NextResponse.json({ error: freeUnavailable }, { status: 503 });
    }
  } catch (error) {
    if (error instanceof MuniraRequestError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[munira-chat] request failed");
    return NextResponse.json({ error: "تعذّرت معالجة الرسالة." }, { status: 500 });
  }
}
