// lib/store-images.ts
// رفع شعار/غلاف المتجر. نفس bucket ونفس تحقق الصور المستخدَم بالمنتجات
// (lib/image-processing.ts) — فقط أبعاد إخراج مختلفة تناسب كل حقل.
// ⚠️ لا تنظيف تلقائي للملف القديم عند الاستبدال (Store لا يخزّن storagePath
// لكل حقل، بخلاف ProductImage) — نفس المفاضلة المقبولة بمكان آخر بالمشروع؛
// ملف يتيم غير ضار، أفضل من تعقيد إضافي لحالة نادرة.

import crypto from "crypto";
import sharp from "sharp";
import { prisma } from "./prisma";
import { getSupabaseAdminClient, PRODUCT_IMAGES_BUCKET } from "./supabase-admin";
import { validateImageBuffer, ImageValidationError } from "./image-processing";

export class StoreImageError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
    this.name = "StoreImageError";
  }
}

export type StoreImageField = "logo" | "cover";

// أبعاد الإخراج الموصى بها لكل حقل — يُعرَض نفس الرقم بالواجهة كتوضيح للتاجر
export const STORE_IMAGE_DIMENSIONS: Record<StoreImageField, { width: number; height: number }> = {
  logo: { width: 500, height: 500 },
  cover: { width: 1600, height: 600 },
};

async function getOwnedStore(slug: string, userId: string, userRole: string) {
  const store = await prisma.store.findUnique({ where: { slug }, select: { id: true, userId: true } });
  if (!store) throw new StoreImageError("المتجر غير موجود", 404);
  const allowed = store.userId === userId || userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  if (!allowed) throw new StoreImageError("لا تملكين صلاحية تعديل هذا المتجر", 403);
  return store;
}

async function processStoreImage(buffer: Buffer, field: StoreImageField) {
  const { width, height } = STORE_IMAGE_DIMENSIONS[field];
  return sharp(buffer)
    .rotate() // يصحّح الاتجاه حسب EXIF
    .resize({ width, height, fit: "cover", position: "attention" }) // قصّ ذكي بدل تمديد/تفريغ
    .webp({ quality: 85 })
    .toBuffer();
}

export async function uploadStoreImage(params: {
  slug: string;
  userId: string;
  userRole: string;
  field: StoreImageField;
  fileBuffer: Buffer;
}) {
  const { slug, userId, userRole, field, fileBuffer } = params;
  const store = await getOwnedStore(slug, userId, userRole);

  try {
    await validateImageBuffer(fileBuffer);
  } catch (err) {
    if (err instanceof ImageValidationError) throw new StoreImageError(err.message, 422);
    throw err;
  }

  const processed = await processStoreImage(fileBuffer, field);
  const path = `stores/${store.id}/${field}-${crypto.randomUUID()}.webp`;

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, processed, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw new StoreImageError(`فشل رفع الصورة: ${error.message}`, 502);

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  const url = data.publicUrl;

  const updated = await prisma.store.update({
    where: { id: store.id },
    data: field === "logo" ? { logo: url } : { coverImage: url },
    select: { id: true, logo: true, coverImage: true },
  });

  return updated;
}
