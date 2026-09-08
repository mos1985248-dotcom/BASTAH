// lib/supabase-admin.ts
// عميل Supabase بصلاحيات service_role — يتجاوز RLS بالكامل.
// ⚠️ يُستخدم فقط داخل API routes (سيرفر). لا يُستورَد أبداً في أي
// "use client" component — لو حدث ذلك بالخطأ، SUPABASE_SERVICE_KEY
// سيُحزَّم داخل الـ bundle المُرسَل للمتصفح وهذا تسريب أمني خطير.
//
// لماذا service_role هنا بالتحديد: الرفع يمر عبر API route نتحقق فيه
// من الملكية والصلاحيات بأنفسنا (lib/auth.ts + lib/product-images.ts)
// قبل لمس أي تخزين — فلا حاجة لسياسات RLS معقّدة على storage.objects
// لعمليات الكتابة، لأن "الحارس" هو السيرفر نفسه لا قاعدة البيانات.

import { createClient } from "@supabase/supabase-js";

let _client: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdminClient() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL أو SUPABASE_SERVICE_KEY غير مضبوطين");
  }

  _client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _client;
}

export const PRODUCT_IMAGES_BUCKET = "basita-media";
