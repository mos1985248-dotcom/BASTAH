import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, publicTicketLimit } from "@/lib/rate-limit";
import { getCurrentUser } from "@/lib/auth";
import { redactPrompt } from "@/lib/munira/context";

const input = z.object({
  email: z.string().trim().email().max(254).optional(),
  message: z.string().trim().min(10).max(1800),
  confirm: z.literal(true),
}).strict();

export async function POST(req: NextRequest) {
  const body = input.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "راجع البريد ووصف المشكلة وأكّد الإرسال." }, { status: 400 });
  try {
    const user = await getCurrentUser();
    const email = user ? null : body.data.email?.toLowerCase();
    if (!user && !email) return NextResponse.json({ error: "أدخل بريدًا للتواصل معك." }, { status: 400 });
    if (!publicTicketLimit && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "إرسال التذاكر من هنا غير متاح مؤقتًا." }, { status: 503 });
    }
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (!(await checkRateLimit(publicTicketLimit, user?.id ?? ip)).allowed) {
      return NextResponse.json({ error: "بلغت حد التذاكر اليوم. حاول لاحقًا." }, { status: 429 });
    }
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber: `TKT-${randomUUID().slice(0, 12).replace("-", "").toUpperCase()}`,
        userId: user?.id ?? null, guestEmail: email ?? null,
        subject: "طلب دعم من منيرة", category: "other",
        messages: { create: { userId: user?.id ?? null, content: redactPrompt(body.data.message) } },
      },
      select: { ticketNumber: true },
    });
    return NextResponse.json(ticket, { status: 201 });
  } catch {
    return NextResponse.json({ error: "تعذّر إرسال التذكرة. حاول مجددًا." }, { status: 503 });
  }
}
