// app/api/addresses/route.ts
// عناوين الشحن للمشتري — متطلب أساسي لإتمام أي عملية شراء (addressId
// مطلوب في /api/checkout). بدون هذا الـ endpoint، الواجهة لا تملك طريقة
// لإنشاء أو عرض عنوان لإكمال الطلب.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { createAddressSchema, formatZodError } from "@/lib/validation";

export async function GET() {
  try {
    const user = await requireUser();
    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ addresses });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[GET /api/addresses]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = createAddressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const data = parsed.data;

    const address = await prisma.$transaction(async (tx) => {
      // عنوان افتراضي جديد يلغي افتراضية أي عنوان آخر — عنوان افتراضي واحد فقط
      if (data.isDefault) {
        await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
      }
      return tx.address.create({ data: { ...data, userId: user.id } });
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[POST /api/addresses]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}
