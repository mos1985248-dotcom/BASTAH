import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { AuthError } from "./auth";
import { prisma } from "./prisma";

export const stockReceiptInput = z.object({
  requestId: z.string().uuid(),
  variantId: z.string().min(1).max(100).nullable(),
  quantity: z.number().int().min(1).max(1_000_000),
  unitPrice: z.string().regex(/^\d{1,6}(\.\d{1,2})?$/).transform(value => {
    const [riyals, fraction = ""] = value.split(".");
    return Number(riyals) * 100 + Number(fraction.padEnd(2, "0"));
  }),
}).strict();

const receiptFields = {
  id: true, quantity: true, unitCostMinor: true, variantName: true, createdAt: true,
} satisfies Prisma.ProductStockReceiptSelect;

export async function listStockReceipts(storeId: string, productId: string, cursor?: string) {
  const product = await prisma.product.findFirst({ where: { id: productId, storeId }, select: { id: true } });
  if (!product) throw new AuthError("المنتج غير موجود.", 404);

  const anchor = cursor ? await prisma.productStockReceipt.findFirst({
    where: { productId, id: cursor }, select: { id: true, createdAt: true },
  }) : null;
  if (cursor && !anchor) throw new AuthError("مؤشر السجل غير صالح.", 400);

  const receipts = await prisma.productStockReceipt.findMany({
    where: { productId, ...(anchor && { OR: [
      { createdAt: { lt: anchor.createdAt } },
      { createdAt: anchor.createdAt, id: { lt: anchor.id } },
    ] }) },
    select: receiptFields,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 21,
  });
  return { receipts: receipts.slice(0, 20), nextCursor: receipts.length > 20 ? receipts[19].id : null };
}

export function receiveStock(storeId: string, productId: string, input: z.output<typeof stockReceiptInput>) {
  return prisma.$transaction(async tx => {
    const locked = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM products WHERE id = ${productId} AND "storeId" = ${storeId} FOR UPDATE
    `;
    if (!locked.length) throw new AuthError("المنتج غير موجود.", 404);

    const prior = await tx.productStockReceipt.findUnique({
      where: { productId_requestId: { productId, requestId: input.requestId } },
      select: { ...receiptFields, variantId: true },
    });
    if (prior) {
      if (prior.variantId !== input.variantId || prior.quantity !== input.quantity || prior.unitCostMinor !== input.unitPrice) {
        throw new AuthError("سبق استخدام معرّف هذه الدفعة ببيانات مختلفة.", 409);
      }
      const { variantId, ...receipt } = prior;
      return { receipt, replayed: true };
    }

    const product = await tx.product.findUniqueOrThrow({
      where: { id: productId },
      select: { status: true, trackInventory: true, _count: { select: { variants: true } } },
    });
    if (product.status === "ARCHIVED" || !product.trackInventory) {
      throw new AuthError("إضافة الكمية متاحة للمنتجات التي يُتتبّع مخزونها.", 409);
    }

    let variantName: string | null = null;
    const room = 2_147_483_647 - input.quantity;
    if (input.variantId) {
      const variant = await tx.productVariant.findFirst({
        where: { id: input.variantId, productId }, select: { id: true, nameAr: true },
      });
      if (!variant) throw new AuthError("خيار المنتج غير موجود.", 404);
      const changed = await tx.productVariant.updateMany({
        where: { id: variant.id, productId, quantity: { lte: room } },
        data: { quantity: { increment: input.quantity } },
      });
      if (!changed.count) throw new AuthError("تعذّر إضافة الكمية إلى هذا الخيار.", 409);
      variantName = variant.nameAr;
    } else if (product._count.variants) {
      throw new AuthError("اختر خيار المنتج الذي استلمت كميته.", 400);
    }
    const changed = await tx.product.updateMany({
      where: { id: productId, storeId, quantity: { lte: room } },
      data: {
        quantity: { increment: input.quantity },
        ...(product.status === "OUT_OF_STOCK" && { status: "ACTIVE" }),
      },
    });
    if (!changed.count) throw new AuthError("الكمية تتجاوز الحد الأقصى للمخزون.", 409);

    const receipt = await tx.productStockReceipt.create({
      data: {
        productId, requestId: input.requestId, variantId: input.variantId, variantName,
        quantity: input.quantity, unitCostMinor: input.unitPrice,
      },
      select: receiptFields,
    });
    return { receipt, replayed: false };
  });
}
