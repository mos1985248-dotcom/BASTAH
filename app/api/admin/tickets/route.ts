// app/api/admin/tickets/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const { searchParams } = new URL(req.url);
    const page   = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit  = Math.min(50, Number(searchParams.get("limit") ?? 20));
    const status = searchParams.get("status") ?? "";

    const where: any = {};
    if (status) where.status = status;

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { messages: true } },
        },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return NextResponse.json({ tickets, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Single requireRole call — admin context used for both update + internal note
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    const body = await req.json();
    const { ticketId, status, adminNote } = body;
    if (!ticketId || !status) {
      return NextResponse.json({ error: "ticketId و status مطلوبان" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
        ...(status === "CLOSED"   ? { closedAt:   new Date() } : {}),
      },
      select: { id: true, status: true },
    });

    if (adminNote?.trim()) {
      await prisma.ticketMessage.create({
        data: {
          ticketId,
          userId: admin.id,
          content: adminNote.trim(),
          isInternal: true,
        },
      });
    }

    return NextResponse.json({ ticket });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[admin/tickets PATCH]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
