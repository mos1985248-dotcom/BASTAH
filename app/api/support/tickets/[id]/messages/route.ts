// app/api/support/tickets/[id]/messages/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: "الرسالة فارغة" }, { status: 400 });

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true, status: true },
    });
    if (!ticket) return NextResponse.json({ error: "التذكرة غير موجودة" }, { status: 404 });
    if (ticket.userId !== user.id) return NextResponse.json({ error: "غير مصرّح" }, { status: 403 });
    if (ticket.status === "CLOSED") return NextResponse.json({ error: "هذه التذكرة مغلقة" }, { status: 409 });

    const message = await prisma.ticketMessage.create({
      data: { ticketId: ticket.id, userId: user.id, content: content.trim() },
      include: { user: { select: { name: true, role: true } } },
    });

    // Reopen if RESOLVED
    if (ticket.status === "RESOLVED") {
      await prisma.supportTicket.update({ where: { id: ticket.id }, data: { status: "IN_PROGRESS" } });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
