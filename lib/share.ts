// lib/share.ts
// دالة مشاركة موحّدة — Web Share API لو مدعومة، وإلا نسخ الرابط للحافظة.
// تُستخدم بصفحة المتجر وصفحة المنتج بدل تكرار نفس المنطق بكل مكوّن.

export async function shareContent(data: { title: string; text?: string; url?: string }): Promise<"shared" | "copied" | "cancelled"> {
  const url = data.url ?? (typeof window !== "undefined" ? window.location.href : "");
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ ...data, url });
      return "shared";
    }
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "cancelled";
  }
}
