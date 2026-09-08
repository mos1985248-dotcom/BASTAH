// app/api/auth/sync/route.ts
// تُستدعى مرة واحدة فوراً بعد signup الناجح من Supabase Auth (من الـ client).
// Supabase يدير الهوية والتوكن، لكن جدول `users` في قاعدتنا هو مصدر الحقيقة
// للملف الشخصي والدور (role) — هذا الـ route يربط الاثنين.
//
// Idempotent عمداً: لو استُدعيت مرتين لنفس المستخدم (مثلاً تكرار الطلب
// بسبب انقطاع شبكة)، لا تُنشئ صفّاً مكرراً — تُرجع الموجود.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { syncUserSchema, formatZodError } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Route Handler — يعمل بلا مشاكل عادةً؛ يُتجاهل بأمان لو حدث
          }
        },
      },
    }
  );

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: "جلسة غير صالحة" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = syncUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  const { name, phone, role } = parsed.data;
  const supabaseUser = authData.user;

  try {
    const user = await prisma.user.upsert({
      where: { supabaseId: supabaseUser.id },
      update: {
        // عند تكرار النداء: لا نعيد كتابة الاسم/الدور حتى لا نُفقد تعديلات لاحقة
        lastLoginAt: new Date(),
      },
      create: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email!,
        phone: phone ?? null,
        name,
        role,
        isVerified: !!supabaseUser.email_confirmed_at,
      },
      select: { id: true, name: true, email: true, role: true, isVerified: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err: any) {
    // P2002 = تعارض على email أو phone فريد — يحدث لو الحساب موجود من قبل بطريقة أخرى
    if (err?.code === "P2002") {
      const conflictField = err?.meta?.target?.[0] ?? "email";
      return NextResponse.json(
        { error: `${conflictField === "email" ? "البريد الإلكتروني" : "رقم الجوال"} مستخدم من قبل` },
        { status: 409 }
      );
    }
    console.error("[auth/sync]", err);
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}