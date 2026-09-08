// lib/supabase-browser.ts
// عميل Supabase للمتصفح — يُستخدم فقط داخل "use client" components.
// مختلف عن lib/auth.ts (الذي يعمل على السيرفر فقط بكوكيز الطلب).

import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
