import { z } from "zod";
import { requireStoreFeature } from "@/lib/feature-access";
// app/api/marketing/campaigns/route.ts
// بنية فقط (القسم ٣) — status=DRAFT دائماً، لا تفعيل حقيقي، لا معالج دفع
// مربوط، لا استدعاء شبكي خارجي.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError } from "@/lib/auth";
import { createAdCampaignSchema, formatZodError } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const { storeId } = await requireStoreFeature("campaigns");

    const body = await req.json();
    const parsed = createAdCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }

    const campaign = await prisma.adCampaign.create({
      data: {
        storeId,
        name: parsed.data.name,
        objective: parsed.data.objective,
        content: parsed.data.content,
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
    const { storeId } = await requireStoreFeature("campaigns");

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

const archive = z.object({ id: z.string().min(1).max(100), archived: z.boolean() });

export async function PATCH(req: Request) {
  try {
    const { storeId } = await requireStoreFeature("campaigns");
    const parsed = archive.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "بيانات الحملة غير صالحة." }, { status: 400 });
    const updated = await prisma.adCampaign.updateMany({
      where: { storeId, id: parsed.data.id },
      data: { archivedAt: parsed.data.archived ? new Date() : null },
    });
    if (!updated.count) return Response.json({ error: "الحملة غير موجودة." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json({ error: "تعذّر تحديث الحملة." }, { status: 500 });
  }
}
