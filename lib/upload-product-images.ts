// lib/upload-product-images.ts
// رفع صور منتج جديد بالتتابع (لا بالتوازي) — السيرفر يحسب position وisCover من
// عدد الصور الموجودة لحظة الرفع (راجع uploadProductImage)، فالرفع المتوازي
// يسبّب تسابقاً: صورتان بنفس الترتيب وأكثر من غلاف. نتوقف عند أول فشل حتى
// يبقى ترتيب التاجر سليماً، ونُعيد ما رُفع فعلاً لتُزال من قائمة الانتظار.

export interface PendingImage { id: string; file: File; previewUrl: string }

export const MAX_PRODUCT_IMAGES = 8;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** رسالة خطأ عربية إن كان الملف غير صالح، وإلا null */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return `«${file.name}» ليست بصيغة JPG أو PNG أو WebP`;
  if (file.size > MAX_IMAGE_BYTES) return `«${file.name}» أكبر من 8MB`;
  return null;
}

export async function uploadImagesSequentially(
  productId: string,
  images: PendingImage[]
): Promise<{ uploadedIds: string[]; failure: { index: number; message: string } | null }> {
  const uploadedIds: string[] = [];
  for (let i = 0; i < images.length; i++) {
    try {
      const fd = new FormData();
      fd.append("productId", productId);
      fd.append("file", images[i].file);
      const res = await fetch("/api/uploads/products", { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) return { uploadedIds, failure: { index: i, message: body?.error ?? "فشل رفع الصورة" } };
      uploadedIds.push(images[i].id);
    } catch {
      return { uploadedIds, failure: { index: i, message: "تعذّر الاتصال أثناء رفع الصورة" } };
    }
  }
  return { uploadedIds, failure: null };
}
