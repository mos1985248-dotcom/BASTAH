// app/api/users/me/route.ts
// إعدادات الحساب الشخصي (منفصل عمداً عن /api/auth/me الخفيف المستخدَم
// بكل الموقع لفحص الجلسة/الدور — هذا فقط لصفحة الإعدادات).
// ⚠️ تعديل البريد الإلكتروني غير مدعوم هنا عمداً — يحتاج تدفق تحقق حقيقي
// عبر Supabase (تأكيد بريد جديد) قبل اعتماده، مؤجَّل لمرحلة لاحقة.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جداً").max(100).optional(),
  phone: z.string().trim().regex(/^\+?9665\d{8}$/, "رقم جوال سعودي غير صحيح").optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const full = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, phone: true, avatar: true },
    });
    if (!full) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    return NextResponse.json({ user: full });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("[GET /api/users/me]", err);
    return NextResponse.json({ error: "حدث خطأ في جلب بياناتك" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = updateProfileSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "بيانات غير صالحة" }, { status: 400 });
    }
    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: "لا يوجد شيء لتحديثه" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: parsed.data,
      select: { id: true, name: true, email: true, phone: true, avatar: true },
    });
    return NextResponse.json({ user: updated });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return NextResponse.json({ error: "رقم الجوال هذا مستخدَم بالفعل بحساب آخر" }, { status: 409 });
    }
    console.error("[PATCH /api/users/me]", err);
    return NextResponse.json({ error: "تعذّر حفظ التعديلات" }, { status: 500 });
  }
}
