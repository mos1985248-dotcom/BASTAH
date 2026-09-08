// middleware.ts
// يعمل على كل طلب قبل الوصول لأي route. ثلاث مسؤوليات فقط حالياً:
// 1) تحديث جلسة Supabase (مطلوب من مكتبة @supabase/ssr نفسها)
// 2) حماية المسارات الخاصة (/dashboard, /admin) من غير المسجّلين
// 3) Rate limiting على كل /api/* + هيدرز أمان أساسية على كل استجابة
//
// مؤجّل لمرحلة لاحقة (مذكور بوضوح حتى لا يُفهم أنه نُسي):
// توجيه الدومينات المخصصة لكل متجر، ودعم next-intl للترجمة.

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { apiRateLimit, checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];
const ADMIN_ONLY_PREFIXES = ["/admin"];

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1) Rate limiting على كل API ────────────────────────
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    const { allowed, remaining, resetAt } = await checkRateLimit(apiRateLimit, ip);
    if (!allowed) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: "طلبات كثيرة جداً، حاولي بعد قليل" },
          { status: 429, headers: rateLimitHeaders({ allowed, remaining, resetAt }) }
        )
      );
    }
  }

  // ── 2) تحديث جلسة Supabase + جلب المستخدم الحالي ──────
  // نمط getAll/setAll الحديث (بدل get/set/remove القديم): نعيد بناء
  // response داخل setAll نفسها حتى تحمل أي كوكيز محدَّثة (توكن مجدَّد)
  // فعلياً لكل من الطلب الحالي (request.cookies) واستجابة المتصفح
  // (response.cookies) معاً — هذا هو النمط الرسمي الموصى به من Supabase
  // لبيئة middleware تحديداً.
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const isLoggedIn = !!data.user;

  // ── 3) حماية المسارات الخاصة ───────────────────────────
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (needsAuth && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // ملاحظة: التحقق من دور ADMIN فعلياً (وليس فقط تسجيل الدخول) يحدث
  // داخل كل admin route نفسه عبر requireRole() في lib/auth.ts، لأن
  // الدور مخزَّن في جدول users بقاعدتنا وليس في جلسة Supabase —
  // middleware لا يملك اتصال Prisma هنا (Edge runtime محدود).
  const needsAdmin = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (needsAdmin && !isLoggedIn) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
  }

  return withSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * يطبَّق على كل المسارات إلا:
     * - ملفات Next.js الداخلية (_next/static, _next/image)
     * - favicon
     * - ملفات الصور/الخطوط الثابتة
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|woff2?)$).*)",
  ],
};