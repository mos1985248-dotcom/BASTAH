// app/api/admin/stores/[id]/suspend/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit-log";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    const body = await req.json().catch(() => ({}));
    const action: "suspend" | "reactivate" = body.action ?? "suspend";
    const reason: string | undefined = body.reason;

    const store = await prisma.store.findUnique({
      where: { id: params.id },
      select: { id: true, nameAr: true, userId: true, status: true },
    });
    if (!store) return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });

    if (action === "suspend") {
      await prisma.store.update({
        where: { id: store.id },
        data: { status: "SUSPENDED" },
      });
      await createNotification({
        userId:  store.userId,
        type:    "STORE",
        titleAr: "متجرك موقوف مؤقتاً",
        bodyAr:  `تم تعليق متجرك "${store.nameAr}"${reason ? `: ${reason}` : " — تواصلي مع الدعم لمعرفة السبب"}`,
        data:    { storeId: store.id, reason },
      });
    } else {
      await prisma.store.update({
        where: { id: store.id },
        data: { status: "ACTIVE" },
      });
      await createNotification({
        userId:  store.userId,
        type:    "STORE",
        titleAr: "متجرك فعّال مجدداً! 🎉",
        bodyAr:  `تم رفع التعليق عن متجرك "${store.nameAr}" — مرحباً بك مجدداً`,
        data:    { storeId: store.id },
      });
    }

    await logAudit({
      actorId:    admin.id,
      action:     action === "suspend" ? "STORE_SUSPENDED" : "STORE_REACTIVATED",
      targetType: "Store",
      targetId:   store.id,
      metadata:   { reason, previousStatus: store.status },
      ipAddress:  getClientIp(req.headers),
    });

    return NextResponse.json({ success: true, action });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
