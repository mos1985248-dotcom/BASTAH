// lib/product-images.ts
// منطق العمل الكامل لصور المنتج: تحقق ملكية → معالجة → رفع → مزامنة الكاش.
// كل دالة هنا تفترض أنها تُستدعى من API route بعد المصادقة (requireUser).

import crypto from "crypto";
import { prisma } from "./prisma";
import { getSupabaseAdminClient, PRODUCT_IMAGES_BUCKET } from "./supabase-admin";
import { validateImageBuffer, processProductImage, ImageValidationError } from "./image-processing";

export class ProductImageError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
    this.name = "ProductImageError";
  }
}

const MAX_IMAGES_PER_PRODUCT = 8;

async function getOwnedProduct(productId: string, userId: string, userRole: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, storeId: true, store: { select: { userId: true } } },
  });
  if (!product) throw new ProductImageError("المنتج غير موجود", 404);
  const allowed = product.store.userId === userId || userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  if (!allowed) throw new ProductImageError("لا تملكين صلاحية على هذا المنتج", 403);
  return product;
}

async function getOwnedImage(imageId: string, userId: string, userRole: string) {
  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    include: { product: { select: { id: true, storeId: true, store: { select: { userId: true } } } } },
  });
  if (!image) throw new ProductImageError("الصورة غير موجودة", 404);
  const allowed = image.product.store.userId === userId || userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  if (!allowed) throw new ProductImageError("لا تملكين صلاحية على هذه الصورة", 403);
  return image;
}

/** يعيد حساب Product.mainImage و Product.images من جدول ProductImage — المصدر الحقيقي */
async function syncProductImageCache(productId: string) {
  const images = await prisma.productImage.findMany({
    where: { productId },
    orderBy: { position: "asc" },
    select: { url: true, isCover: true },
  });
  const cover = images.find((i) => i.isCover) ?? images[0] ?? null;
  await prisma.product.update({
    where: { id: productId },
    data: { mainImage: cover?.url ?? null, images: images.map((i) => i.url) },
  });
}

function buildPaths(storeId: string, productId: string) {
  const uid = crypto.randomUUID();
  return {
    mainPath: `products/${storeId}/${productId}/${uid}-main.webp`,
    thumbPath: `products/${storeId}/${productId}/${uid}-thumb.webp`,
  };
}

async function uploadToStorage(path: string, buffer: Buffer) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, buffer, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw new ProductImageError(`فشل رفع الصورة: ${error.message}`, 502);
  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function deleteFromStorage(paths: string[]) {
  if (paths.length === 0) return;
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  // فشل الحذف من Storage لا يجب أن يمنع حذف السجل من القاعدة (يصبح ملفاً
  // يتيماً قابلاً للتنظيف لاحقاً بمهمة دورية، أفضل من تعليق العملية كاملة)
  if (error) console.error("[storage-cleanup-failed]", paths, error.message);
}

// ── رفع صورة جديدة ───────────────────────────────────────
export async function uploadProductImage(params: {
  productId: string; userId: string; userRole: string; fileBuffer: Buffer;
}) {
  const { productId, userId, userRole, fileBuffer } = params;
  const product = await getOwnedProduct(productId, userId, userRole);

  const existingCount = await prisma.productImage.count({ where: { productId } });
  if (existingCount >= MAX_IMAGES_PER_PRODUCT) {
    throw new ProductImageError(`الحد الأقصى ${MAX_IMAGES_PER_PRODUCT} صور لكل منتج`, 422);
  }

  try {
    await validateImageBuffer(fileBuffer);
  } catch (err) {
    if (err instanceof ImageValidationError) throw new ProductImageError(err.message, 422);
    throw err;
  }

  const { mainBuffer, mainWidth, mainHeight, thumbBuffer } = await processProductImage(fileBuffer);
  const { mainPath, thumbPath } = buildPaths(product.storeId, productId);

  const url = await uploadToStorage(mainPath, mainBuffer);
  let thumbnailUrl: string;
  try {
    thumbnailUrl = await uploadToStorage(thumbPath, thumbBuffer);
  } catch (err) {
    await deleteFromStorage([mainPath]); // تعويض: لا نُبقي صورة رئيسية بدون مصغّرة
    throw err;
  }

  const image = await prisma.productImage.create({
    data: {
      productId,
      storagePath: mainPath,
      thumbnailPath: thumbPath,
      url,
      thumbnailUrl,
      width: mainWidth,
      height: mainHeight,
      position: existingCount,
      isCover: existingCount === 0, // أول صورة تصبح الغلاف تلقائياً
    },
  });

  await syncProductImageCache(productId);
  return image;
}

// ── حذف صورة (مع تنظيف التخزين) ──────────────────────────
export async function deleteProductImage(params: { imageId: string; userId: string; userRole: string }) {
  const { imageId, userId, userRole } = params;
  const image = await getOwnedImage(imageId, userId, userRole);

  await prisma.productImage.delete({ where: { id: imageId } });
  await deleteFromStorage([image.storagePath, image.thumbnailPath]);

  // لو كانت صورة الغلاف المحذوفة، نُرقّي أقرب صورة بالترتيب لتكون الغلاف
  if (image.isCover) {
    const next = await prisma.productImage.findFirst({
      where: { productId: image.productId },
      orderBy: { position: "asc" },
    });
    if (next) {
      await prisma.productImage.update({ where: { id: next.id }, data: { isCover: true } });
    }
  }

  await syncProductImageCache(image.productId);
}

// ── استبدال محتوى صورة موجودة (تحافظ على position/isCover) ──
export async function replaceProductImage(params: {
  imageId: string; userId: string; userRole: string; fileBuffer: Buffer;
}) {
  const { imageId, userId, userRole, fileBuffer } = params;
  const image = await getOwnedImage(imageId, userId, userRole);

  try {
    await validateImageBuffer(fileBuffer);
  } catch (err) {
    if (err instanceof ImageValidationError) throw new ProductImageError(err.message, 422);
    throw err;
  }

  const { mainBuffer, mainWidth, mainHeight, thumbBuffer } = await processProductImage(fileBuffer);
  const { mainPath, thumbPath } = buildPaths(image.product.storeId, image.productId);

  const url = await uploadToStorage(mainPath, mainBuffer);
  const thumbnailUrl = await uploadToStorage(thumbPath, thumbBuffer);

  const oldPaths = [image.storagePath, image.thumbnailPath];

  const updated = await prisma.productImage.update({
    where: { id: imageId },
    data: { storagePath: mainPath, thumbnailPath: thumbPath, url, thumbnailUrl, width: mainWidth, height: mainHeight },
  });

  await deleteFromStorage(oldPaths); // تنظيف الملفات القديمة بعد نجاح الاستبدال فقط
  await syncProductImageCache(image.productId);
  return updated;
}

// ── تحديث الترتيب أو تعيين صورة كغلاف ────────────────────
export async function updateProductImageMeta(params: {
  imageId: string; userId: string; userRole: string; position?: number; isCover?: boolean;
}) {
  const { imageId, userId, userRole, position, isCover } = params;
  const image = await getOwnedImage(imageId, userId, userRole);

  await prisma.$transaction(async (tx) => {
    if (isCover === true) {
      await tx.productImage.updateMany({ where: { productId: image.productId }, data: { isCover: false } });
    }
    await tx.productImage.update({
      where: { id: imageId },
      data: {
        ...(position !== undefined ? { position } : {}),
        ...(isCover !== undefined ? { isCover } : {}),
      },
    });
  });

  await syncProductImageCache(image.productId);
}
