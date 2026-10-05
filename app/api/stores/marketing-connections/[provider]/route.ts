// app/api/stores/marketing-connections/[provider]/route.ts — فصل منصة عن المتجر

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: { provider: string } }) {
  try {
    const { storeId } = await requireActiveStore();
    await prisma.marketingProviderConnection.deleteMany({
      where: { storeId, provider: params.provider.toLowerCase() },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[DELETE /api/stores/marketing-connections/[provider]]", err);
    return NextResponse.json({ error: "تعذّر إلغاء الربط" }, { status: 500 });
  }
}
