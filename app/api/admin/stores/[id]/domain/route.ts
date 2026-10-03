// app/api/admin/stores/[id]/domain/route.ts
// فتح/إغلاق ميزة الدومين المخصص لمتجر بعينه — قرار يدوي من الإدارة بعد
// التحقق من أن اشتراك التاجر (99/199) يستحقها فعلاً. لا يوجد فحص تلقائي
// للباقة هنا عمداً — التحقق مسؤولية الإدارة، والواجهة تعرض الباقة الحالية
// بجانب الزر ليقرر عليها.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { setStoreDomainGateSchema, formatZodError } from "@/lib/validation";
import { logAudit, getClientIp } from "@/lib/audit-log";
import { isVercelDomainsConfigured, addDomainToProject, removeDomainFromProject } from "@/lib/vercel-domains";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    const parsed = setStoreDomainGateSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

    const store = await prisma.store.findUnique({ where: { id: params.id }, select: { id: true, customDomain: true } });
    if (!store) return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });

    // ⚠️ مزامنة Vercel مع قرار الإدارة: إيقاف الميزة (مثلاً انتهاء اشتراك) يفصل الدومين
    // من المشروع كي لا يبقى يعرض صفحة المنصة الرئيسية بدل متجر التاجر، وإعادة التفعيل
    // تعيد إضافته. القيمة المحفوظة (customDomain) لا تُمسح أبداً. الفشل هنا لا يمنع
    // قرار الإدارة نفسه — يُسجَّل ويبقى مسار التاجر ("تحقق الآن") يُظهر الحالة الفعلية.
    if (isVercelDomainsConfigured() && store.customDomain) {
      try {
        if (parsed.data.customDomainEnabled) await addDomainToProject(store.customDomain);
        else await removeDomainFromProject(store.customDomain);
      } catch (err) {
        console.error("[POST /api/admin/stores/[id]/domain] vercel sync", err);
      }
    }

    const updated = await prisma.store.update({
      where: { id: params.id },
      data: { customDomainEnabled: parsed.data.customDomainEnabled },
      select: { id: true, customDomainEnabled: true, customDomain: true },
    });

    await logAudit({
      actorId: admin.id, action: "SUBSCRIPTION_CHANGED", targetType: "Store", targetId: store.id,
      metadata: { event: updated.customDomainEnabled ? "custom_domain_enabled" : "custom_domain_disabled" },
      ipAddress: getClientIp(req.headers),
    });

    return NextResponse.json({ store: updated });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[PATCH /api/admin/stores/[id]/domain]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
