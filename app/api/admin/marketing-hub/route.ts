// app/api/admin/marketing-hub/route.ts — مسار قديم محفوظ للتوافق (ويب هوك فقط).
// المنطق كله في lib/integrations/admin-service؛ المسار الجديد: /api/admin/integrations.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit-log";
import { removeProvider, saveProvider } from "@/lib/integrations/admin-service";
import { getProviderStatus } from "@/lib/integrations/config";
import { webhookDefinition } from "@/lib/integrations/providers/webhook";

function fail(err: unknown, tag: string) {
  if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
  console.error(tag, err);
  return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
}

export async function GET() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const [status, links, stores] = await Promise.all([
      getProviderStatus(webhookDefinition),
      prisma.storeMarketingLink.count(),
      prisma.storeMarketingLink.groupBy({ by: ["storeId"] }),
    ]);
    return NextResponse.json({
      configured: status.configured, host: status.summary, lastTestedAt: status.lastTestedAt, lastTestOk: status.lastTestOk,
      linksCount: links, linkedStores: stores.length,
    });
  } catch (err) {
    return fail(err, "[GET /api/admin/marketing-hub]");
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    const result = await saveProvider("webhook", await req.json().catch(() => null));
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    await logAudit({
      actorId: admin.id, action: "MARKETING_HUB_CONFIGURED", targetType: "PlatformSetting", targetId: "marketing_hub",
      metadata: { event: "hub_saved", host: result.summary }, ipAddress: getClientIp(req.headers),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return fail(err, "[POST /api/admin/marketing-hub]");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireRole("ADMIN", "SUPER_ADMIN");
    await removeProvider("webhook");
    await logAudit({
      actorId: admin.id, action: "MARKETING_HUB_CONFIGURED", targetType: "PlatformSetting", targetId: "marketing_hub",
      metadata: { event: "hub_removed" }, ipAddress: getClientIp(req.headers),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fail(err, "[DELETE /api/admin/marketing-hub]");
  }
}
