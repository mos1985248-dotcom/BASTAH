// app/api/admin/stores/[id]/verify/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit-log";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    const body  = await req.json().catch(() => ({}));
    const action: "approve" | "reject" = body.action ?? "approve";
    const reason: string | undefined   = body.reason;

    const store = await prisma.store.findUnique({
      where: { id: params.id },
      select: { id: true, nameAr: true, userId: true },
    });
    if (!store) return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });

    if (action === "approve") {
      await prisma.store.update({
        where: { id: store.id },
        data: {
          isVerified:         true,
          verificationStatus: "VERIFIED",
          verifiedAt:         new Date(),
          verifiedByAdminId:  admin.id,
          rejectionReason:    null,
        },
      });
      await createNotification({
        userId:  store.userId,
        type:    "STORE",
        titleAr: "متجرك موثَّق الآن! ✅",
        bodyAr:  `تهانينا! حصل متجرك "${store.nameAr}" على شارة التوثيق — ستظهر الآن في نتائج البحث بشكل مميّز`,
        data:    { storeId: store.id },
      });
    } else {
      await prisma.store.update({
        where: { id: store.id },
        data: {
          verificationStatus: "REJECTED",
          rejectionReason:    reason ?? "مستندات غير كافية",
        },
      });
      await createNotification({
        userId:  store.userId,
        type:    "STORE",
        titleAr: "طلب التوثيق مرفوض",
        bodyAr:  `طلب توثيق متجرك "${store.nameAr}" مرفوض${reason ? `: ${reason}` : " — راجعي المستندات المطلوبة"}`,
        data:    { storeId: store.id },
      });
    }

    await logAudit({
      actorId:    admin.id,
      action:     action === "approve" ? "STORE_VERIFIED" : "STORE_REJECTED",
      targetType: "Store",
      targetId:   store.id,
      metadata:   { reason },
      ipAddress:  getClientIp(req.headers),
    });

    return NextResponse.json({ success: true, action });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
