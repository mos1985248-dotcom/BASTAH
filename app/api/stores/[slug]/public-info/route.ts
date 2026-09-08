// app/api/stores/[slug]/public-info/route.ts
// ⚠️ Endpoint جديد بالكامل — الـ PATCH الموجود بـ [slug]/route.ts يعدّل
// موديل Store نفسه فقط ولا يلمس StorePublicInfo إطلاقاً. هذا يكمّله بدون
// أي تعديل عليه.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { updatePublicInfoSchema, formatZodError } from "@/lib/validation";

interface Params {
  params: { slug: string };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser();

    const store = await prisma.store.findUnique({
      where: { slug: params.slug },
      select: { id: true, userId: true },
    });
    if (!store) return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });
    if (store.userId !== user.id && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "لا تملكين صلاحية تعديل هذا المتجر" }, { status: 403 });
    }

    const parsed = updatePublicInfoSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }

    const { videoUrl, ...rest } = parsed.data;
    const data = { ...rest, ...(videoUrl !== undefined ? { videoUrl: videoUrl || null } : {}) };

    const publicInfo = await prisma.storePublicInfo.upsert({
      where: { storeId: store.id },
      create: { storeId: store.id, ...data },
      update: data,
    });

    return NextResponse.json({ publicInfo });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[PATCH /api/stores/:slug/public-info]", err);
    return NextResponse.json({ error: "تعذّر تحديث بيانات المتجر" }, { status: 500 });
  }
}
