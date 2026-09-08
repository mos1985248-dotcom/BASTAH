// app/api/support/tickets/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  subject:  z.string().trim().min(5, "الموضوع قصير جداً").max(150),
  category: z.enum(["technical", "billing", "order", "other"]),
  message:  z.string().trim().min(10, "الرسالة قصيرة جداً").max(2000),
});

function generateTicketNumber(): string {
  return `TKT-${Date.now().toString().slice(-6)}`;
}

export async function GET() {
  try {
    const user = await requireUser();
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: user.id },
      include: { _count: { select: { messages: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ tickets });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ?? "بيانات غير صحيحة";
      return NextResponse.json({ error: first }, { status: 400 });
    }
    const { subject, category, message } = parsed.data;

    const ticket = await prisma.$transaction(async (tx) => {
      const t = await tx.supportTicket.create({
        data: { ticketNumber: generateTicketNumber(), userId: user.id, subject, category },
      });
      await tx.ticketMessage.create({
        data: { ticketId: t.id, userId: user.id, content: message },
      });
      return t;
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
