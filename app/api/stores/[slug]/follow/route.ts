// app/api/stores/[slug]/follow/route.ts
// ⚠️ Endpoint جديد بالكامل (إضافي فقط) — يستخدم موديل StoreFollower
// الموجود أصلاً بالـ schema (storeId+userId unique) بدون أي route سابق.
// POST يعمل toggle: إن كانت متابعة موجودة يحذفها، وإلا ينشئها — ويحدّث
// Store.totalFollowers المُخزّن (denormalized) داخل نفس المعاملة.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

interface Params {
  params: { slug: string };
}

export async function POST(_req: Request, { params }: Params) {
  try {
    const user = await requireUser();

    const store = await prisma.store.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });
    if (!store) return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });

    const existing = await prisma.storeFollower.findUnique({
      where: { storeId_userId: { storeId: store.id, userId: user.id } },
    });

    const [, updatedStore] = existing
      ? await prisma.$transaction([
          prisma.storeFollower.delete({ where: { id: existing.id } }),
          prisma.store.update({ where: { id: store.id }, data: { totalFollowers: { decrement: 1 } }, select: { totalFollowers: true } }),
        ])
      : await prisma.$transaction([
          prisma.storeFollower.create({ data: { storeId: store.id, userId: user.id } }),
          prisma.store.update({ where: { id: store.id }, data: { totalFollowers: { increment: 1 } }, select: { totalFollowers: true } }),
        ]);

    return NextResponse.json({ following: !existing, totalFollowers: Math.max(0, updatedStore.totalFollowers) });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[POST /api/stores/:slug/follow]", err);
    return NextResponse.json({ error: "تعذّرت العملية" }, { status: 500 });
  }
}
