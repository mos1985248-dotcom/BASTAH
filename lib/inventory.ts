// lib/inventory.ts
// حجز وإفراج المخزون بشكل آمن من التزاحم (race conditions).
//
// المشكلة: لو شخصين طلبا آخر قطعتين بنفس اللحظة، وفحصنا "الكمية كافية؟"
// بشكل منفصل عن "خصم الكمية"، الاثنان يمكن أن يقرآ "متوفر" قبل أي خصم،
// فيُباع نفس المخزون مرتين (oversell).
//
// الحل: نستخدم updateMany بشرط WHERE quantity >= المطلوب في نفس استدعاء
// SQL واحد (atomic على مستوى قاعدة البيانات). لو رجع count = 0، يعني
// شخصاً آخر سبقنا أو المخزون غير كافٍ — نرفض الطلب فوراً بدل المخاطرة.
//
// ⚠️ إضافي: أصبحت الدالتان تدعمان variantId اختيارياً. لو المنتج له
// متغيّرات (ProductVariant)، نخصم/نُعيد من مخزون المتغيّر المحدَّد تحديداً
// *و* من مخزون المنتج الإجمالي معاً (نفس المعاملة الذرية) — لأن صفحات
// السوق والمتجر تعرض Product.quantity كإجمالي، بينما القرار الفعلي
// بالمتاح للبيع لكل خيار (حجم/لون) يعتمد على ProductVariant.quantity.

import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export class InsufficientStockError extends Error {
  constructor(public productId: string, public productName: string) {
    super(`الكمية المتوفرة من "${productName}" غير كافية`);
    this.name = "InsufficientStockError";
  }
}

interface ReserveItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

/**
 * يحجز المخزون لكل منتجات الطلب ضمن transaction واحدة.
 * يجب استدعاؤها داخل prisma.$transaction(tx => ...) ونمرّر لها tx بدل prisma.
 */
export async function reserveStock(
  tx: Prisma.TransactionClient,
  items: ReserveItem[],
  productNames: Map<string, string>
): Promise<void> {
  for (const item of items) {
    if (item.variantId) {
      const variantResult = await tx.productVariant.updateMany({
        where: { id: item.variantId, productId: item.productId, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      });
      if (variantResult.count === 0) {
        throw new InsufficientStockError(item.productId, productNames.get(item.productId) ?? item.productId);
      }
    }

    const result = await tx.product.updateMany({
      where: { id: item.productId, quantity: { gte: item.quantity } },
      data: { quantity: { decrement: item.quantity } },
    });

    if (result.count === 0) {
      // ⚠️ لو خصمنا من المتغيّر بالأعلى ثم فشل خصم المنتج هنا، الـtransaction
      // بالكامل تُلغى تلقائياً (rollback) لأن هذه الدالة تُستدعى دائماً داخل
      // prisma.$transaction من طرف المستدعي — لا حاجة لتراجع يدوي هنا.
      throw new InsufficientStockError(item.productId, productNames.get(item.productId) ?? item.productId);
    }
  }

  // تحديث حالة المنتجات التي نفدت كميتها تماماً إلى OUT_OF_STOCK
  await tx.product.updateMany({
    where: { id: { in: items.map((i) => i.productId) }, quantity: 0, status: "ACTIVE" },
    data: { status: "OUT_OF_STOCK" },
  });
}

/** يُستخدم عند فشل الدفع أو إلغاء الطلب — يُعيد الكمية المحجوزة */
export async function releaseStock(
  tx: Prisma.TransactionClient,
  items: ReserveItem[]
): Promise<void> {
  for (const item of items) {
    if (item.variantId) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { quantity: { increment: item.quantity } },
      }).catch(() => {}); // المتغيّر قد يكون حُذف لاحقاً — لا نُفشل كامل العملية لأجله
    }
    await tx.product.update({
      where: { id: item.productId },
      data: { quantity: { increment: item.quantity } },
    });
  }

  // إعادة المنتجات لحالة ACTIVE فقط لو كانت OUT_OF_STOCK بسبب هذا الحجز
  // بالتحديد — لا نلمس منتجات DRAFT أو ARCHIVED عمداً
  await tx.product.updateMany({
    where: {
      id: { in: items.map((i) => i.productId) },
      status: "OUT_OF_STOCK",
      quantity: { gt: 0 },
    },
    data: { status: "ACTIVE" },
  });
}
