import assert from "node:assert/strict";
import { test } from "node:test";
import { comparableMarket, marketPriceDirection } from "../../lib/pricing/market";

const sales = [80, 90, 100, 110, 120].flatMap((price, store) =>
  Array.from({ length: 3 }, (_, order) => ({ price, storeId: String(store), orderId: `${store}-${order}`, categoryId: "same" })),
);

test("requires independent orders and enough comparable stores", () => {
  assert.equal(comparableMarket(sales.slice(0, 14)), null);
  assert.equal(comparableMarket(sales.map(x => ({ ...x, storeId: "one" }))), null);
  assert.equal(comparableMarket(sales.map(x => ({ ...x, orderId: "one" }))), null);
  assert.equal(comparableMarket(sales.map((x, i) => i === 0 ? { ...x, categoryId: "other" } : x)), null);
});

test("provides an aggregated comparable range and warns only outside a 20% buffer", () => {
  const band = comparableMarket(sales);
  assert.deepEqual(band, { lowerMinor: 9000, upperMinor: 11000 });
  assert.equal(marketPriceDirection(BigInt(7199), band), "low");
  assert.equal(marketPriceDirection(BigInt(7200), band), null);
  assert.equal(marketPriceDirection(BigInt(13200), band), null);
  assert.equal(marketPriceDirection(BigInt(13201), band), "high");
  assert.equal(marketPriceDirection(BigInt(1), null), null);
});
