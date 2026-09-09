// lib/image-processing.ts
// التحقق والمعالجة الفعلية للصور — sharp يقرأ البايتات الحقيقية للملف
// (وليس Content-Type المُرسَل من المتصفح، الذي يمكن تزويره بسهولة).

import sharp, { type Metadata } from "sharp";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB قبل الضغط
export const MIN_DIMENSION = 200; // أقل من هذا = صورة منتج غير مفيدة عملياً
export const MAX_DIMENSION = 8000; // أكبر من هذا = خطر decompression bomb

const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageValidationError";
  }
}

interface ValidatedImageMeta {
  format: string;
  width: number;
  height: number;
}

/**
 * يتحقق من الملف فعلياً عبر فك تشفير الصورة الحقيقي (sharp.metadata)،
 * لا عبر امتداد الاسم أو هيدر Content-Type المُرسَل من العميل.
 */
export async function validateImageBuffer(buffer: Buffer): Promise<ValidatedImageMeta> {
  if (buffer.length === 0) {
    throw new ImageValidationError("الملف فارغ");
  }
  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new ImageValidationError(`حجم الملف أكبر من ${MAX_UPLOAD_BYTES / 1024 / 1024}MB`);
  }

  let metadata: Metadata;
  try {
    metadata = await sharp(buffer).metadata();
  } catch {
    throw new ImageValidationError("الملف ليس صورة صالحة أو تالف");
  }

  const { format, width, height } = metadata;
  if (!format || !ALLOWED_FORMATS.has(format)) {
    throw new ImageValidationError("صيغة الصورة غير مدعومة — يُسمح فقط بـ JPG, PNG, WebP");
  }
  if (!width || !height) {
    throw new ImageValidationError("تعذّر قراءة أبعاد الصورة");
  }
  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    throw new ImageValidationError(`أبعاد الصورة صغيرة جداً — الحد الأدنى ${MIN_DIMENSION}×${MIN_DIMENSION} بكسل`);
  }
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    throw new ImageValidationError(`أبعاد الصورة كبيرة جداً — الحد الأقصى ${MAX_DIMENSION}×${MAX_DIMENSION} بكسل`);
  }

  return { format, width, height };
}

export interface ProcessedImage {
  mainBuffer: Buffer;
  mainWidth: number;
  mainHeight: number;
  thumbBuffer: Buffer;
}

/**
 * يُنتج نسختين: رئيسية (حد أقصى 1600×1600، WebP جودة 82) ومصغّرة
 * (حد أقصى 400×400، WebP جودة 75) — كلتاهما تحافظان على نسبة الأبعاد
 * ولا تكبّران صورة أصغر من الحد (withoutEnlargement).
 */
export async function processProductImage(buffer: Buffer): Promise<ProcessedImage> {
  const mainBuffer = await sharp(buffer)
    .rotate() // يصحّح الاتجاه تلقائياً حسب EXIF (صور الجوال غالباً مقلوبة بدونها)
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const mainMeta = await sharp(mainBuffer).metadata();

  const thumbBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: 400, height: 400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  return {
    mainBuffer,
    mainWidth: mainMeta.width!,
    mainHeight: mainMeta.height!,
    thumbBuffer,
  };
}
