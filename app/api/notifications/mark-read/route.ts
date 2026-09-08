// app/api/notifications/mark-read/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    // ids: string[] → علِّم محددة. غير موجود → علِّم الكل
    const ids: string[] | undefined = Array.isArray(body?.ids) ? body.ids : undefined;

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
        ...(ids ? { id: { in: ids } } : {}),
      },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
