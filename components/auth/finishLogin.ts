// components/auth/finishLogin.ts
// ما بعد نجاح أي طريقة دخول (بريد/جوال): تحديث الجلسة، ثم التحقق من الحساب الداخلي، ثم التوجيه حسب الدور.
// المنطق كما كان حرفياً في LoginClient، مع حماية redirect من المسارات الخارجية.

import type { useRouter } from "next/navigation";

/** مسار داخلي فقط (يبدأ بـ"/" وليس "//") وإلا نتجاهله. */
export function safeRedirect(value: string | null): string | null {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : null;
}

/** يرجع رسالة خطأ عند الفشل، أو null بعد التوجيه الناجح. */
export async function finishLogin(
  router: ReturnType<typeof useRouter>,
  refresh: () => Promise<void> | void,
  redirectTo: string | null,
): Promise<string | null> {
  // إجبار Next.js على إعادة تشغيل Server Components بالكوكيز الجديدة
  router.refresh();

  // تحديث UserProvider بالمستخدم الجديد
  await refresh();

  // التحقق من أن الحساب الداخلي صالح ونشط
  const res = await fetch("/api/auth/me");
  if (!res.ok) {
    return "تعذّر تسجيل الدخول إلى حسابك — قد يكون حسابك معلّقاً أو غير نشط حالياً. تواصل مع الدعم إذا استمرت المشكلة.";
  }

  const { user } = await res.json();

  // إذا كان هناك redirect محدد في الرابط، نستخدمه أولاً
  const target = safeRedirect(redirectTo);
  if (target) {
    router.push(target);
    return null;
  }

  // توجيه ذكي حسب الدور
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") router.push("/admin");
  else if (user.role === "SELLER") router.push("/dashboard");
  else router.push("/marketplace");
  return null;
}
