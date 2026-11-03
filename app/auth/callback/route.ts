// app/auth/callback/route.ts
// نقطة عودة الدخول عبر Google (OAuth PKCE): يبدّل code الراجع من Supabase بجلسة (كوكيز)،
// ثم يوجّه حسب دور المستخدم كما تفعل صفحة الدخول بالبريد. صف جدول users يُنشأ/يُشفى تلقائياً
// عند أول طلب مُصادَق (lib/auth.ts)، والدور الافتراضي BUYER ويمكنه التبديل لتاجر من حسابه.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { prisma } from "@/lib/prisma";

/** لا نقبل إلا مسارات داخلية — يمنع إعادة التوجيه المفتوحة (open redirect). */
function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? origin;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
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
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          },
        },
      },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const profile = await prisma.user.findUnique({
        where: { supabaseId: data.user.id },
        select: { role: true },
      });

      // الدور المختار بصفحة التسجيل (كوكي قصير العمر) يُطبَّق على الحساب الجديد فقط؛ الحساب الموجود يُتجاهل.
      let role = profile?.role;
      if (!profile && request.cookies.get("basita_signup_role")?.value === "SELLER") {
        await supabase.auth.updateUser({ data: { role: "SELLER" } });
        role = "SELLER";
      }

      const target = next ?? (role === "ADMIN" || role === "SUPER_ADMIN" ? "/admin" : role === "SELLER" ? "/dashboard" : "/marketplace");
      const response = NextResponse.redirect(`${base}${target}`);
      response.cookies.set("basita_signup_role", "", { path: "/", maxAge: 0 });
      return response;
    }
  }

  return NextResponse.redirect(`${base}/login?error=oauth`);
}
