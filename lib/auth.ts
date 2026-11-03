// lib/auth.ts
// مساعد المصادقة — يُستخدم في كل API route يحتاج تحقق هوية
//
// قرار معماري: نعتمد على Supabase Auth كمصدر الهوية (JWT في الكوكيز)،
// وجدول `users` في قاعدتنا هو مصدر بيانات الملف الشخصي + الدور (role).
// كل طلب يحتاج المستخدم يُستدعى مرتين: مرة لـ Supabase (هل التوكن صالح؟)
// ومرة لقاعدتنا (ما دوره؟ هل متجره موجود؟).

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { prisma } from "./prisma";
import type { User as PrismaUser, UserRole } from "@prisma/client";
import { normalizeSaudiMobile } from "./phone";

export class AuthError extends Error {
  constructor(message: string, public status: number = 401) {
    super(message);
    this.name = "AuthError";
  }
}

function getSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
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
            // يحدث عند الاستدعاء من Server Component (قراءة فقط، لا يمكن
            // تعديل الكوكيز هناك) — يمكن تجاهله بأمان لأن middleware.ts
            // يتولّى تحديث الجلسة فعلياً على مستوى كل طلب. داخل Route
            // Handlers (وهو استخدام getCurrentUser الفعلي بكل المشروع)
            // هذا السطر يعمل بلا مشاكل.
          }
        },
      },
    }
  );
}

export type AuthedUser = PrismaUser & {
  store: { id: string; slug: string; status: string } | null;
};

/** يرجع المستخدم الحالي أو null — لا يرمي خطأ (للاستخدام في صفحات عامة) */
export async function getCurrentUser(): Promise<AuthedUser | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  let user = await prisma.user.findUnique({
    where: { supabaseId: data.user.id },
    include: { store: { select: { id: true, slug: true, status: true } } },
  });

  // ⚠️ شفاء ذاتي: جلسة Supabase صالحة لكن لا صفّ مطابق بجدولنا — يحدث
  // فعلياً حين يُعيد رابط تأكيد البريد المستخدم لصفحة لا تستدعي
  // /api/auth/sync (مثلاً الصفحة الرئيسية بدل /register)، فيضيع الدور
  // المُختار وقت التسجيل ولا يُنشأ الملف الشخصي إطلاقاً. نُعيد بناءه هنا
  // من user_metadata المخزَّنة بحساب Supabase نفسه وقت signUp — يعمل عند
  // أول طلب مُصادَق من أي صفحة، بلا اعتماد على أي رابط تحويل محدَّد.
  if (!user) {
    // بيانات الهوية تختلف حسب طريقة الدخول: بريد (name/phone/role من signUp)،
    // Google (full_name/avatar_url)، جوال OTP (الرقم في data.user.phone بلا "+").
    const meta = data.user.user_metadata as {
      name?: string; full_name?: string; phone?: string; role?: UserRole;
      avatar_url?: string; picture?: string;
    } | null;
    const email = data.user.email ?? null;
    const createData = {
      supabaseId: data.user.id,
      email,
      name: meta?.name?.trim() || meta?.full_name?.trim() || email?.split("@")[0] || "مستخدم بسطة",
      phone: normalizeSaudiMobile(data.user.phone) ?? meta?.phone ?? null,
      avatar: meta?.avatar_url ?? meta?.picture ?? null,
      // دائماً BUYER افتراضياً لو الدور غير موجود بالـmetadata (Google وحسابات قديمة)
      // — لا نمنح صلاحية بائع تلقائياً بلا تأكيد صريح من المستخدم وقت التسجيل.
      role: (meta?.role === "SELLER" ? "SELLER" : "BUYER") as UserRole,
      isVerified: !!(data.user.email_confirmed_at || data.user.phone_confirmed_at),
    };
    const include = { store: { select: { id: true, slug: true, status: true } } };
    const upsert = (create: typeof createData) =>
      prisma.user.upsert({ where: { supabaseId: data.user.id }, update: {}, create, include });
    try {
      user = await upsert(createData);
    } catch (err: any) {
      try {
        // الرقم محجوز لحساب آخر (مثلاً كُتب بلا تحقق عند تسجيل ببريد): لا نحبس المستخدم خارج
        // حسابه — نُنشئه بلا رقم في جدولنا (الرقم الموثَّق يبقى في Supabase) بدل دمج الحسابين تلقائياً.
        if (err?.code === "P2002" && createData.phone && String(err?.meta?.target).includes("phone")) {
          user = await upsert({ ...createData, phone: null });
        } else {
          throw err;
        }
      } catch {
        // تعارض آخر (سباق مع /api/auth/sync يعمل بنفس اللحظة) — أعد القراءة
        user = await prisma.user.findUnique({ where: { supabaseId: data.user.id }, include });
      }
    }
  }

  if (!user || !user.isActive) return null;

  // ⚠️ ترقية إدارية تلقائية: ADMIN_EMAIL كان موجوداً بـ.env منذ البداية
  // لكن غير مُستخدَم بأي مكان بالكود إطلاقاً — لا توجد أي طريقة أخرى
  // لإنشاء أول حساب SUPER_ADMIN بالمشروع (لا seed، لا مسار API). نفس مبدأ
  // الشفاء الذاتي أعلاه: أي دخول بهذا البريد تحديداً يُرقّى تلقائياً،
  // idempotent (لا يُعاد التحديث لو الدور مطابق أصلاً).
  if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL && user.role !== "SUPER_ADMIN") {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: "SUPER_ADMIN" },
      include: { store: { select: { id: true, slug: true, status: true } } },
    });
  }

  return user as AuthedUser;
}

/** يفرض تسجيل دخول — يرمي AuthError(401) لو لم يكن مسجّلاً */
export async function requireUser(): Promise<AuthedUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("يجب تسجيل الدخول أولاً", 401);
  return user;
}

/** يفرض دوراً معيناً — يرمي AuthError(403) لو لم يملك الصلاحية */
export async function requireRole(...roles: UserRole[]): Promise<AuthedUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new AuthError("لا تملك صلاحية الوصول لهذا الإجراء", 403);
  }
  return user;
}

/** يفرض وجود متجر فعّال — يرمي AuthError لو لا متجر أو متجر معلّق */
export async function requireActiveStore(): Promise<{
  user: AuthedUser;
  storeId: string;
}> {
  const user = await requireRole("SELLER");
  if (!user.store) throw new AuthError("لا يوجد متجر مرتبط بحسابك", 404);
  if (user.store.status === "SUSPENDED") {
    throw new AuthError(
      "متجرك معلّق حالياً بسبب فاتورة متأخرة — راجعي صفحة الفواتير",
      403
    );
  }
  return { user, storeId: user.store.id };
}

/** غلاف موحّد لمعالجة أخطاء AuthError في كل route — يرجع NextResponse صحيح */
export function authErrorResponse(err: unknown) {
  if (err instanceof AuthError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  console.error("[unhandled-auth-error]", err);
  return Response.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
}