// app/api/stores/marketing-connections/route.ts
// ربط منصة تسويق خارجية بمتجر التاجر (لينز/فيسبوك/تيك توك/سناب/أي منصة
// لاحقة) — صف واحد لكل (متجر، منصة)، نفس نمط StoreShipping تماماً.
// ⚠️ بيانات الاعتماد لا تُعاد أبداً بعد الحفظ، فقط اسم المنصة وحالتها.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { upsertMarketingConnectionSchema, formatZodError } from "@/lib/validation";
import { encryptSecret } from "@/lib/crypto";

export async function GET() {
  try {
    const { storeId } = await requireActiveStore();
    const connections = await prisma.marketingProviderConnection.findMany({
      where: { storeId },
      select: { id: true, provider: true, isActive: true, connectedAt: true, lastTestedAt: true, lastTestOk: true },
      orderBy: { connectedAt: "asc" },
    });
    return NextResponse.json({ connections });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/stores/marketing-connections]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { storeId } = await requireActiveStore();
    const parsed = upsertMarketingConnectionSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

    const provider = parsed.data.provider.toLowerCase();
    const credentialsEnc = encryptSecret(JSON.stringify(parsed.data.credentials));

    const connection = await prisma.marketingProviderConnection.upsert({
      where: { storeId_provider: { storeId, provider } },
      create: { storeId, provider, credentialsEnc },
      update: { credentialsEnc, isActive: true },
      select: { id: true, provider: true, isActive: true, connectedAt: true },
    });

    return NextResponse.json({ connection }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/stores/marketing-connections]", err);
    return NextResponse.json({ error: "تعذّر حفظ بيانات الربط" }, { status: 500 });
  }
}
