// app/api/admin/integrations/route.ts — نظرة الإدارة على التكاملات + تعديل التوجيه وأنواع الحسابات
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, AuthError } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit-log";
import { applySettings, getAdminOverview } from "@/lib/integrations/admin-service";

const patchSchema = z.object({
  routing: z.record(z.object({ enabled: z.boolean(), providers: z.array(z.string().max(40)).max(10) })).optional(),
  disabledAccountTypes: z.array(z.string().max(40)).max(50).optional(),
}).refine((v) => v.routing !== undefined || v.disabledAccountTypes !== undefined, { message: "لا تغيير مطلوب" });

function fail(err: unknown, tag: string) {
  if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
  console.error(tag, err);
  return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
}

export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    return NextResponse.json(await getAdminOverview());
  } catch (err) {
    return fail(err, "[GET /api/admin/integrations]");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    const parsed = patchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });

    const result = await applySettings(parsed.data);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

    await logAudit({
      actorId: admin.id, action: "MARKETING_HUB_CONFIGURED", targetType: "PlatformSetting", targetId: "integrations",
      metadata: { event: "settings_updated", routing: parsed.data.routing ?? null, disabledAccountTypes: parsed.data.disabledAccountTypes ?? null },
      ipAddress: getClientIp(req.headers),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err, "[PATCH /api/admin/integrations]");
  }
}
