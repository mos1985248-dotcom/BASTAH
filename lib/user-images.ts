// lib/user-images.ts
// رفع الصورة الشخصية (avatar) — نفس bucket وتحقق صور المنتج/المتجر
// (lib/image-processing.ts)، فقط مقاس مربّع أصغر يناسب الأفاتار.

import crypto from "crypto";
import sharp from "sharp";
import { prisma } from "./prisma";
import { getSupabaseAdminClient, PRODUCT_IMAGES_BUCKET } from "./supabase-admin";
import { validateImageBuffer, ImageValidationError } from "./image-processing";

export class UserImageError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
    this.name = "UserImageError";
  }
}

export const AVATAR_SIZE = 300;

export async function uploadAvatar(params: { userId: string; fileBuffer: Buffer }) {
  const { userId, fileBuffer } = params;

  try {
    await validateImageBuffer(fileBuffer);
  } catch (err) {
    if (err instanceof ImageValidationError) throw new UserImageError(err.message, 422);
    throw err;
  }

  const processed = await sharp(fileBuffer)
    .rotate()
    .resize({ width: AVATAR_SIZE, height: AVATAR_SIZE, fit: "cover", position: "attention" })
    .webp({ quality: 85 })
    .toBuffer();

  const path = `users/${userId}/avatar-${crypto.randomUUID()}.webp`;

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, processed, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw new UserImageError(`فشل رفع الصورة: ${error.message}`, 502);

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  const url = data.publicUrl;

  return prisma.user.update({
    where: { id: userId },
    data: { avatar: url },
    select: { id: true, avatar: true },
  });
}
