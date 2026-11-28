import type { Prisma } from "@prisma/client";

// Cost is the product-only estimate, not checkout fees or selling expenses.
// A variant has no independent cost input yet: leave it unknown rather than assume.
export async function snapshotDaftariCosts(tx: Prisma.TransactionClient, orderId: string, storeId: string) {
  const items = await tx.orderItem.findMany({
    where: { orderId, order: { storeId }, product: { storeId }, variantId: null },
    select: { id: true, product: { select: { pricing: { select: { productCostMinor: true } } } } },
  });
  const data = items.flatMap(item => {
    const cost = item.product.pricing?.productCostMinor;
    return cost !== undefined && Number.isSafeInteger(cost) && cost > 0
      ? [{ orderItemId: item.id, productCostMinor: cost }] : [];
  });
  if (data.length) await tx.daftariOrderItemCost.createMany({ data, skipDuplicates: true });
}
