// app/api/admin/marketing-hub/test/route.ts — مسار قديم محفوظ للتوافق (ويب هوك فقط)
import { NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth";
import { testProvider } from "@/lib/integrations/admin-service";

export async function POST() {
  try {
    await requireRole("ADMIN", "SUPER_ADMIN");
    const result = await testProvider("webhook");
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ ok: result.passed });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/admin/marketing-hub/test]", err);
    return NextResponse.json({ error: "تعذّر الاختبار" }, { status: 500 });
  }
}
