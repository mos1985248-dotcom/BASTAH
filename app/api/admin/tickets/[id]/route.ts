// app/api/admin/tickets/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, role: true } },
        messages: {
          include: { user: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) return NextResponse.json({ error: "التذكرة غير موجودة" }, { status: 404 });
    return NextResponse.json({ ticket });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// Admin reply to ticket
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    const { content, isInternal = false } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: "محتوى الرسالة مطلوب" }, { status: 400 });

    const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id }, select: { id: true, userId: true, status: true } });
    if (!ticket) return NextResponse.json({ error: "التذكرة غير موجودة" }, { status: 404 });

    const message = await prisma.ticketMessage.create({
      data: { ticketId: params.id, userId: admin.id, content: content.trim(), isInternal },
    });

    // Move to IN_PROGRESS if still OPEN
    if (ticket.status === "OPEN" && !isInternal) {
      await prisma.supportTicket.update({ where: { id: params.id }, data: { status: "IN_PROGRESS" } });
    }

    // Notify user (unless internal note)
    if (!isInternal) {
      const { createNotification } = await import("@/lib/notifications");
      await createNotification({
        userId: ticket.userId,
        type: "SYSTEM",
        titleAr: "ردّ جديد على تذكرتك",
        bodyAr: "فريق الدعم ردّ على تذكرتك — افتحيها لرؤية الرد",
        data: { ticketId: params.id },
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
