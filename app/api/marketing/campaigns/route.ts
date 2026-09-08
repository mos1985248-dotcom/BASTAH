// app/api/marketing/campaigns/route.ts
// بنية فقط (القسم ٣) — status=DRAFT دائماً، لا تفعيل حقيقي، لا معالج دفع
// مربوط، لا استدعاء شبكي خارجي.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { createAdCampaignSchema, formatZodError } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const { storeId } = await requireActiveStore();

    const body = await req.json();
    const parsed = createAdCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }

    const campaign = await prisma.adCampaign.create({
      data: {
        storeId,
        name: parsed.data.name,
        budget: parsed.data.budget,
        status: "DRAFT", // القيمة الوحيدة الممكنة بهذه المرحلة
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/marketing/campaigns]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { storeId } = await requireActiveStore();

    const campaigns = await prisma.adCampaign.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/marketing/campaigns]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
