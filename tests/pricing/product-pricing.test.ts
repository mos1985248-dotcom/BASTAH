import assert from "node:assert/strict";
import { test } from "node:test";
import { calculatePricing, emptyPricing, formatMinor, withStoreVat, type PricingInput } from "../../lib/pricing/product-pricing";
import { pricingRecord, productPricingSchema } from "../../lib/pricing/storage";

function result(overrides: Partial<PricingInput>, current = "") {
  const value = calculatePricing({ ...emptyPricing, ...overrides }, current);
  if ("error" in value) throw new Error(value.error);
  return value;
}

test("uses margin on the sale price, without an implicit commission", () => {
  const quote = result({ materials: "60", targetMargin: "25" }).suggested!;
  assert.equal(formatMinor(quote.price), "80.00");
  assert.equal(formatMinor(quote.profit), "20.00");
  assert.equal(formatMinor(quote.margin!), "25.00");
});

test("recalculates actual fees, profit and margin after the price is rounded", () => {
  const quote = result({ materials: "20", production: "10", packaging: "5", labor: "5", direct: "5", paymentRate: "2" }).suggested!;
  assert.equal(formatMinor(quote.price), "61.64");
  assert.equal(formatMinor(quote.fees), "1.23");
  assert.equal(formatMinor(quote.profit), "15.41");
  assert.equal(formatMinor(quote.margin!), "25.00");
});

test("includes fixed payment fees, overhead and seller-paid shipping once", () => {
  const value = result({ materials: "38", overhead: ".50", paymentFixed: "1.50", shipping: "10", paymentRate: "2", targetMargin: "20" }, "49");
  assert.equal(formatMinor(value.productCost), "38.50");
  assert.equal(formatMinor(value.cost), "50.00");
  assert.equal(formatMinor(value.suggested!.price), "64.10");
  assert.equal(formatMinor(value.suggested!.fees), "12.78");
  assert.ok(value.current!.profit < BigInt(0));
});

test("supports .99, .90 and whole-riyal rounding and upward protection", () => {
  for (const [rounding, price, up] of [["99","19.99","20.99"],["90","19.90","20.90"],["whole","20.00","20.00"]] as const) {
    const input = { materials: "15", rounding };
    assert.equal(formatMinor(result(input).suggested!.price), price);
    const protectedPrice = result({ ...input, roundUp: true }).suggested!;
    assert.equal(formatMinor(protectedPrice.price), up);
    assert.equal(protectedPrice.belowTarget, false);
  }
  assert.equal(result({ materials: "15", rounding: "90" }).suggested!.belowTarget, true);
});

test("shows net and gross VAT once and excludes VAT from profit", () => {
  const options = { materials: "75", vatRate: "15" };
  const exclusive = result({ ...options, vatMode: "exclusive" }, "100").suggested!;
  const inclusive = result({ ...options, vatMode: "inclusive" }, "115");
  assert.equal(formatMinor(exclusive.price), "100.00");
  assert.equal(formatMinor(exclusive.gross), "115.00");
  assert.equal(formatMinor(inclusive.suggested!.price), "115.00");
  assert.equal(formatMinor(inclusive.current!.net), "100.00");
  assert.equal(formatMinor(inclusive.current!.tax), "15.00");
  assert.equal(formatMinor(inclusive.current!.profit), "25.00");
});

test("recalculates the suggestion and a manually selected price when costs change", () => {
  const old = result({ materials: "15" }, "20");
  const updated = result({ materials: "18" }, "20");
  assert.equal(formatMinor(old.suggested!.price), "20.00");
  assert.equal(formatMinor(updated.suggested!.price), "24.00");
  assert.equal(formatMinor(updated.current!.profit), "2.00");
  assert.equal(updated.current!.belowTarget, true);
});

test("rejects negative, malformed and impossible inputs and handles zero", () => {
  for (const changes of [
    { materials: "-1" }, { labor: "1.234" }, { direct: "NaN" }, { paymentRate: "75", targetMargin: "25" },
    { commissionRate: "100.01" }, { targetMargin: "" }, { vatMode: "inclusive" as const, vatRate: "-2" },
  ]) {
    const input = { ...emptyPricing, ...changes };
    assert.ok("error" in calculatePricing(input, ""));
    assert.equal(productPricingSchema.safeParse(input).success, false);
  }
  assert.equal(result({}).suggested, null);
  assert.equal(result({ materials: "1" }, "0").current, null);
});

test("stores checked cost totals as integer halalas and ignores client totals", () => {
  const input = { ...emptyPricing, materials: ".10", labor: ".20", paymentFixed: ".30" };
  assert.equal(productPricingSchema.safeParse({ ...input, unitCostMinor: 1 }).success, false);
  const stored = pricingRecord(productPricingSchema.parse(input));
  assert.deepEqual(stored, { inputs: input, productCostMinor: 30, unitCostMinor: 60 });
});

test("retains checkout's before-tax product price in either tax display mode", () => {
  const input = withStoreVat({ ...emptyPricing, materials: "75", vatMode: "inclusive" }, "15");
  const value = calculatePricing(input, "100", "beforeVat");
  if ("error" in value) throw new Error(value.error);
  assert.equal(formatMinor(value.suggested!.net), "100.00");
  assert.equal(formatMinor(value.suggested!.gross), "115.00");
  assert.equal(formatMinor(value.current!.profit), "25.00");
  assert.equal(withStoreVat(input, "0").vatMode, "none");
});
