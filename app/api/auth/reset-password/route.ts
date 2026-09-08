// app/api/auth/reset-password/route.ts
// يُرسل بريد استعادة كلمة المرور عبر Supabase Auth.
// يُوجَّه المستخدم لـ /reset-password#access_token=... بعد الضغط على الرابط.

import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";
import { authRateLimit, checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email("بريد إلكتروني غير صحيح").toLowerCase().trim(),
});

export async function POST(req: NextRequest) {
  // Rate limiting صارم على مسار استعادة كلمة المرور (5/دقيقة per IP)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { allowed } = await checkRateLimit(authRateLimit, `reset:${ip}`);
  if (!allowed) {
    return NextResponse.json(
      { error: "طلبات كثيرة جداً، حاولي مجدداً بعد دقيقة" },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بريد إلكتروني غير صحيح" }, { status: 400 });
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

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  // عمداً لا نكشف إن كان الإيميل مسجّلاً أم لا (أمان: user enumeration prevention)
  if (error) {
    console.error("[reset-password-request]", error.message);
  }

  return NextResponse.json({
    message: "لو بريدك مسجّل لدينا، ستصلك رسالة خلال دقائق",
  });
}