import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { prisma } from "../../lib/prisma";
import { reserveStock } from "../../lib/inventory";
import { listStockReceipts, receiveStock, stockReceiptInput } from "../../lib/stock-receipts";

test("stock receipt costs are stored in integer halalas", () => {
  const input = { requestId: randomUUID(), variantId: null, quantity: 3, unitPrice: "12.35" };
  assert.equal(stockReceiptInput.parse(input).unitPrice, 1235);
  assert.equal(stockReceiptInput.safeParse({ ...input, unitPrice: "12.345" }).success, false);
  assert.equal(stockReceiptInput.safeParse({ ...input, quantity: 0 }).success, false);
  assert.equal(stockReceiptInput.safeParse({ ...input, createdAt: "2026-11-01" }).success, false);
});

test("stock receipt is atomic, idempotent and limited to the owner's product", {
  skip: process.env.RUN_BASTAH_STOCK_INTEGRATION !== "1",
}, async () => {
  const url = new URL(process.env.DATABASE_URL ?? "");
  assert.equal(url.hostname, "127.0.0.1");
  assert.equal(url.pathname, "/bastah_stock");
  const slug = randomUUID();
  const owner = await prisma.user.create({ data: { name: "Fixture", role: "SELLER" } });
  const store = await prisma.store.create({ data: { userId: owner.id, slug, nameAr: "Fixture" } });
  try {
    const product = await prisma.product.create({ data: { storeId: store.id, nameAr: "Fixture", slug, price: 20, status: "OUT_OF_STOCK" } });
    const input = { requestId: randomUUID(), quantity: 15, unitPrice: 1250, variantId: null };
    const results = await Promise.all([receiveStock(store.id, product.id, input), receiveStock(store.id, product.id, input)]);
    assert.deepEqual(results.map(row => row.replayed).sort(), [false, true]);
    assert.equal(results[0].receipt.id, results[1].receipt.id);
    assert.equal(results[0].receipt.unitCostMinor, 1250);
    assert.ok(Math.abs(Date.now() - results[0].receipt.createdAt.getTime()) < 60000);
    await assert.rejects(receiveStock(store.id, product.id, { ...input, quantity: 16 }), { status: 409 });
    await assert.rejects(receiveStock("other-store", product.id, input), { status: 404 });
    await assert.rejects(listStockReceipts("other-store", product.id), { status: 404 });
    const restocked = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    assert.equal(restocked.quantity, 15);
    assert.equal(restocked.status, "ACTIVE");

    const variant = await prisma.productVariant.create({ data: {
      productId: product.id, nameAr: "كيلو", options: [{ name: "وزن", value: "كيلو" }], quantity: 15,
    } });
    await assert.rejects(receiveStock(store.id, product.id, { ...input, requestId: randomUUID() }), { status: 400 });
    const [batch] = await Promise.all([
      receiveStock(store.id, product.id, { ...input, variantId: variant.id, requestId: randomUUID() }),
      prisma.$transaction(tx => reserveStock(tx, [{ productId: product.id, variantId: variant.id, quantity: 2 }], new Map())),
    ]);
    assert.equal(batch.receipt.variantName, "كيلو");
    assert.equal((await prisma.product.findUniqueOrThrow({ where: { id: product.id } })).quantity, 28);
    assert.equal((await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).quantity, 28);
    assert.equal((await listStockReceipts(store.id, product.id)).receipts.length, 2);
  } finally {
    await prisma.store.delete({ where: { id: store.id } });
    await prisma.user.delete({ where: { id: owner.id } });
    await prisma.$disconnect();
  }
});
