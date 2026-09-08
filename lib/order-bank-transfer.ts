// lib/order-bank-transfer.ts
// المشتري يرفع إثبات تحويل بنكي على طلب دفعه بطريقة BANK_TRANSFER —
// لا يُفعّل الطلب بنفسه، فقط يسجّل الإثبات لمراجعة التاجر (أو الإدارة
// إشرافياً لو ما أكّد التاجر أو اشتكى المشتري — لها نفس صلاحية البائع
// على هذا الطلب، راجع getOrderWithAccessCheck).

import crypto from "crypto";
import sharp from "sharp";
import { prisma } from "./prisma";
import { getSupabaseAdminClient, PRODUCT_IMAGES_BUCKET } from "./supabase-admin";
import { validateImageBuffer, ImageValidationError } from "./image-processing";

export class OrderBankTransferError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
    this.name = "OrderBankTransferError";
  }
}

export async function submitOrderBankTransferProof(params: {
  orderId: string;
  buyerId: string;
  referenceNumber: string;
  proofImageBuffer: Buffer; // إلزامية هنا (بعكس التحويل البنكي للاشتراك) — إثبات الدفع للطلب أهم من رقم مرجعي وحده لتفادي نزاعات المبلغ/التوقيت
}) {
  const { orderId, buyerId, referenceNumber, proofImageBuffer } = params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, buyerId: true, paymentMethod: true, paymentStatus: true, storeId: true },
  });

  if (!order || order.buyerId !== buyerId) {
    throw new OrderBankTransferError("الطلب غير موجود", 404);
  }
  if (order.paymentMethod !== "BANK_TRANSFER") {
    throw new OrderBankTransferError("هذا الطلب ليس بطريقة تحويل بنكي", 422);
  }
  if (order.paymentStatus === "PAID") {
    throw new OrderBankTransferError("تم تأكيد دفع هذا الطلب بالفعل", 409);
  }

  try {
    await validateImageBuffer(proofImageBuffer);
  } catch (err) {
    if (err instanceof ImageValidationError) throw new OrderBankTransferError(err.message, 422);
    throw err;
  }

  const processed = await sharp(proofImageBuffer)
    .rotate()
    .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const path = `order-proofs/${order.storeId}/${orderId}-${crypto.randomUUID()}.webp`;
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, processed, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw new OrderBankTransferError(`فشل رفع صورة الإثبات: ${error.message}`, 502);

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);

  return prisma.order.update({
    where: { id: orderId },
    data: {
      bankTransferReference: referenceNumber,
      bankTransferProofUrl: data.publicUrl,
      bankTransferSubmittedAt: new Date(),
    },
    select: { id: true, status: true, paymentStatus: true, bankTransferProofUrl: true, bankTransferSubmittedAt: true },
  });
}
