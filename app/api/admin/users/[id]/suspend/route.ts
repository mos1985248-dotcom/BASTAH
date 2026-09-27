// app/api/admin/users/[id]/suspend/route.ts
// إيقاف/تفعيل مستخدم — يعكس isActive الموجود أصلاً بالقاعدة، بنفس نمط
// تعليق المتاجر تماماً. لا يمنع الإدمن من إيقاف نفسه أو إدمن آخر بالخطأ.

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

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, role: true, isActive: true },
    });
    if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });

    // حماية: لا يجوز للإدمن إيقاف نفسه، ولا إيقاف مدير أعلى (SUPER_ADMIN) إلا من مدير أعلى مثله
    if (user.id === admin.id) {
      return NextResponse.json({ error: "لا يمكنك إيقاف حسابك أنت" }, { status: 400 });
    }
    if (user.role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "لا تملكين صلاحية إيقاف مدير عام" }, { status: 403 });
    }

    if (action === "suspend") {
      await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });
      await createNotification({
        userId: user.id,
        type: "SYSTEM",
        titleAr: "تم إيقاف حسابك",
        bodyAr: `تم إيقاف حسابك${reason ? `: ${reason}` : " — تواصل مع الدعم لمعرفة السبب"}`,
        data: { reason },
      });
    } else {
      await prisma.user.update({ where: { id: user.id }, data: { isActive: true } });
      await createNotification({
        userId: user.id,
        type: "SYSTEM",
        titleAr: "تم تفعيل حسابك مجدداً",
        bodyAr: "حسابك فعّال الآن، مرحباً بعودتك",
        data: {},
      });
    }

    await logAudit({
      actorId: admin.id,
      action: action === "suspend" ? "USER_SUSPENDED" : "USER_REACTIVATED",
      targetType: "User",
      targetId: user.id,
      metadata: { reason, previousIsActive: user.isActive },
      ipAddress: getClientIp(req.headers),
    });

    return NextResponse.json({ success: true, action });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/admin/users/[id]/suspend]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
