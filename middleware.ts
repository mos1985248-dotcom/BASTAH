// middleware.ts
// يعمل على كل طلب قبل الوصول لأي route. أربع مسؤوليات حالياً:
// 0) توجيه الدومينات المخصصة (مرحلة يدوية) إلى صفحة المتجر الصحيحة
// 1) تحديث جلسة Supabase (مطلوب من مكتبة @supabase/ssr نفسها)
// 2) حماية المسارات الخاصة (/dashboard, /admin) من غير المسجّلين
// 3) Rate limiting على كل /api/* + هيدرز أمان أساسية على كل استجابة
//
// مؤجّل لمرحلة لاحقة: الربط الآلي بالدومين عبر Vercel Domains API
// (إضافة الدومين للمشروع وإصدار SSL تلقائياً) — الآن يدوي بالكامل.
// كذلك دعم next-intl للترجمة.

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { apiRateLimit, checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];
const ADMIN_ONLY_PREFIXES = ["/admin"];

// المضيفات "الأصلية" للمنصة نفسها — أي طلب عليها يمر بشكل طبيعي بلا توجيه دومين
const PLATFORM_HOSTS = new Set(
  [
    "localhost:3000",
    "basita.sa",
    "www.basita.sa",
    process.env.NEXT_PUBLIC_APP_HOST,
    process.env.VERCEL_URL,
  ].filter(Boolean) as string[]
);

// ⚠️ نستدعي الـAPI الداخلي عبر دومين المنصة الثابت (NEXT_PUBLIC_APP_URL)
// لا عبر دومين الزائر المخصص نفسه — الاعتماد على DNS/SSL دومين خارجي
// (قد لا يكون مضبوطاً بعد) فقط لحل اسمه غير آمن ويُبطئ كل طلب بلا داعٍ.
const INTERNAL_API_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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

  // ── 0) توجيه الدومين المخصص ─────────────────────────────
  // ⚠️ نتجاهل _next وapi وأي مسار به امتداد ملف (صور/خطوط) — لا داعي
  // لاستدعاء الـAPI الداخلي لكل أصل ثابت. أيضاً نتجاهل أي مضيف من
  // PLATFORM_HOSTS حتى لا نلف كل زيارة عادية للمنصة بطلب إضافي.
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  const isAsset = pathname.startsWith("/_next") || pathname.startsWith("/api/") || /\.[a-z0-9]+$/i.test(pathname);
  if (host && !PLATFORM_HOSTS.has(host) && !isAsset) {
    try {
      const resolveUrl = new URL("/api/internal/resolve-domain", INTERNAL_API_BASE);
      resolveUrl.searchParams.set("host", host);
      const res = await fetch(resolveUrl);
      const { slug } = (await res.json()) as { slug: string | null };
      if (slug) {
        const rewritten = request.nextUrl.clone();
        // ⚠️ الحالة الحالية (يدوية وأولية): كل مسارات الدومين المخصص تعرض
        // الصفحة الرئيسية للمتجر — لا مطابقة لمسارات فرعية (/products/x)
        // بعد، لأن هذه المسارات بالمنصة عامة وليست مربوطة بمتجر أصلاً.
        rewritten.pathname = `/store/${slug}`;
        return withSecurityHeaders(NextResponse.rewrite(rewritten));
      }
      // دومين غير مرتبط بأي متجر مفعَّل: نكمل التدفق العادي (سيعرض 404
      // الصفحة الرئيسية للمنصة) بدل قطع الطلب بخطأ خام.
    } catch {
      // فشل الاتصال الداخلي: لا نُسقِط الموقع — نكمل بلا توجيه دومين
    }
  }

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

  // حصانة ضد غياب إعدادات Supabase: عند توفّر المتغيّرات (الإنتاج/الإعداد
  // الصحيح) يبقى السلوك مطابقاً تماماً؛ وعند غيابها كلياً لا نُسقِط الموقع
  // بالكامل — الصفحات العامة تُعرض، والمسارات الخاصة تُحوَّل لتسجيل الدخول
  // كإجراء آمن افتراضي (كأن المستخدم غير مسجَّل).
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let isLoggedIn = false;

  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
    });

    const { data } = await supabase.auth.getUser();
    isLoggedIn = !!data.user;
  }

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
