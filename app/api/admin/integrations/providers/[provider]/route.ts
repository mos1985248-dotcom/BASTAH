// app/api/admin/integrations/providers/[provider]/route.ts — حفظ/استبدال/إزالة بيانات مزوّد (الإدارة فقط)
// السرّ لا يُعاد في أي استجابة.
import { NextRequest, NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit-log";
import { removeProvider, saveProvider } from "@/lib/integrations/admin-service";

function fail(err: unknown, tag: string) {
  if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
  console.error(tag, err);
  return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
}

export async function POST(req: NextRequest, { params }: { params: { provider: string } }) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    const result = await saveProvider(params.provider, await req.json().catch(() => null));
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    await logAudit({
      actorId: admin.id, action: "MARKETING_HUB_CONFIGURED", targetType: "PlatformSetting", targetId: `provider:${params.provider}`,
      metadata: { event: "provider_saved", provider: params.provider, summary: result.summary }, ipAddress: getClientIp(req.headers),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return fail(err, "[POST /api/admin/integrations/providers/[provider]]");
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { provider: string } }) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    const result = await removeProvider(params.provider);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    await logAudit({
      actorId: admin.id, action: "MARKETING_HUB_CONFIGURED", targetType: "PlatformSetting", targetId: `provider:${params.provider}`,
      metadata: { event: "provider_removed", provider: params.provider }, ipAddress: getClientIp(req.headers),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err, "[DELETE /api/admin/integrations/providers/[provider]]");
  }
}
