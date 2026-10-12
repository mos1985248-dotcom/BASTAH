// app/api/stores/marketing-links/[platform]/route.ts — إلغاء ربط منصة
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: { platform: string } }) {
  try {
    const { storeId } = await requireActiveStore();
    await prisma.storeMarketingLink.deleteMany({ where: { storeId, platform: params.platform } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[DELETE /api/stores/marketing-links/[platform]]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
