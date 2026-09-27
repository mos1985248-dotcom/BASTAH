// app/api/stores/[slug]/domain/route.ts
// دومين مخصص (مرحلة يدوية) — التاجر يحفظ دومينه هنا فقط إذا فتحت له
// الإدارة الميزة مسبقاً (customDomainEnabled). حفظ القيمة وحده لا يجعل
// الدومين يعمل فوراً: الربط الفعلي (DNS + إضافته في Vercel) خطوة يدوية
// خارج الكود حالياً — يقوم بها الدعم بعد تأكيد التاجر لملكية الدومين.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireActiveStore, AuthError } from "@/lib/auth";
import { updateCustomDomainSchema, formatZodError } from "@/lib/validation";

export async function PATCH(req: NextRequest) {
  try {
    const { storeId } = await requireActiveStore();

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { customDomainEnabled: true },
    });
    if (!store?.customDomainEnabled) {
      return NextResponse.json({ error: "ميزة الدومين المخصص غير مفعّلة لمتجرك — تواصلي مع الدعم" }, { status: 403 });
    }

    const parsed = updateCustomDomainSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });

    const { customDomain } = parsed.data;

    if (customDomain) {
      const taken = await prisma.store.findFirst({
        where: { customDomain, id: { not: storeId } },
        select: { id: true },
      });
      if (taken) return NextResponse.json({ error: "هذا الدومين مُستخدَم لمتجر آخر بالفعل" }, { status: 409 });
    }

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: { customDomain },
      select: { customDomain: true },
    });

    return NextResponse.json({ store: updated });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[PATCH /api/stores/[slug]/domain]", err);
    return NextResponse.json({ error: "تعذّر حفظ الدومين" }, { status: 500 });
  }
}
