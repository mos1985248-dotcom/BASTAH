// app/api/auth/update-password/route.ts
// يُحدِّث كلمة المرور بعد التحقق من الـ token في الجلسة.
// يُستدعى من صفحة /reset-password بعد أن يُعالج Supabase الـ token من الرابط.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";

const schema = z.object({
  password: z
    .string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .max(72),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "كلمة مرور غير صالحة";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

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

  // تحقق أن الجلسة الحالية صالحة (Supabase عيَّنها تلقائياً من الـ token في URL)
  const { data: { user }, error: sessionErr } = await supabase.auth.getUser();
  if (sessionErr || !user) {
    return NextResponse.json(
      { error: "رابط الاستعادة منتهي الصلاحية أو غير صحيح — اطلبي رابطاً جديداً" },
      { status: 401 }
    );
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return NextResponse.json(
      { error: "تعذّر تحديث كلمة المرور — حاولي مجدداً" },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: "تم تغيير كلمة المرور بنجاح" });
}