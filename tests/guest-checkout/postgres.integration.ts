import assert from "node:assert/strict";
import { randomInt, randomUUID } from "node:crypto";
import test from "node:test";
import { NextRequest } from "next/server";
import { POST as quote } from "../../app/api/guest-checkout/quote/route";
import { POST as confirm } from "../../app/api/guest-checkout/confirm/route";
import { GET as track } from "../../app/api/guest-checkout/status/route";
import { apiRateLimit, authRateLimit } from "../../lib/rate-limit";
import { prisma } from "../../lib/prisma";

const db = new URL(process.env.DATABASE_URL ?? "postgres://localhost");
assert.ok(["127.0.0.1", "localhost"].includes(db.hostname) && db.searchParams.get("schema") === "guest_fixture",
  "Run only against the local guest_fixture schema");

const origin = "https://guest-checkout.test";
const headers = { origin, "content-type": "application/json" };
const request = (path: string, payload: unknown, cookie = "") =>
  new NextRequest(origin + "/api/guest-checkout/" + path, { method: "POST", headers: { ...headers, cookie }, body: JSON.stringify(payload) });
const status = (id: string, cookie: string) =>
  track(new NextRequest(origin + "/api/guest-checkout/status?id=" + id, { headers: { cookie } }));

test("guest checkout against isolated PostgreSQL (limiter transport simulated)", async (t) => {
  assert.ok(apiRateLimit && authRateLimit);
  const allow = async () => ({ success: true, limit: 5, remaining: 4, reset: Date.now(), pending: Promise.resolve() });
  t.mock.method(apiRateLimit, "limit", allow);
  t.mock.method(authRateLimit, "limit", allow);

  const seller = await prisma.user.create({ data: { name: "بائع اختبار", role: "SELLER" } });
  const phone = "5" + randomInt(10000000, 100000000);
  const existingBuyer = await prisma.user.create({ data: { name: "مشتري اختبار", phone: "+966" + phone } });
  const store = await prisma.store.create({
    data: { userId: seller.id, nameAr: "متجر اختبار", slug: "guest-" + randomUUID(), city: "الرياض", subscription: { create: { hasTaxNumber: true } } },
  });
  const zone = await prisma.shippingZone.create({ data: { nameAr: "شحن محلي", storeId: store.id, regions: ["الرياض"], price: 15 } });
  const product = await prisma.product.create({
    data: {
      storeId: store.id, nameAr: "منتج اختبار", slug: "product", price: 40, quantity: 6, status: "ACTIVE", requiresShipping: true,
      variants: { create: { nameAr: "كبير", options: [{ name: "حجم", value: "كبير" }], price: 50, quantity: 6 } },
    }, include: { variants: true },
  });
  const variant = product.variants[0];
  const payload = {
    storeId: store.id, name: "زائر اختبار", phone: "0" + phone, city: "الرياض", region: "الرياض",
    address: "شارع الاختبار رقم ١", paymentMethod: "CASH_ON_DELIVERY",
    items: [{ productId: product.id, variantId: variant.id, quantity: 2 }],
  };

  try {
    const preview = await quote(request("quote", payload));
    assert.equal(preview.status, 200, await preview.clone().text());
    const expected = await preview.json();
    const cookie = preview.headers.get("set-cookie")?.split(";")[0] ?? "";
    const attempt = { ...payload, expected, requestId: randomUUID() };
    let orderId = "";

    await t.test("server prices the variant, shipping and tax", () => {
      assert.equal(expected.subtotal, 100);
      assert.equal(expected.shippingCost, 15);
      assert.equal(expected.taxAmount, 15);
    });

    await t.test("concurrent confirmations create one order and reserve stock once", async () => {
      const results = await Promise.all([1, 2].map(() => confirm(request("confirm", attempt, cookie))));
      const messages = await Promise.all(results.map((response) => response.json()));
      assert.deepEqual(results.map((response) => response.status).sort(), [200, 201], JSON.stringify(messages));
      assert.equal(messages[0].orderId, messages[1].orderId);
      orderId = messages[0].orderId;
      assert.equal((await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })).quantity, 4);
      assert.equal(await prisma.order.count({ where: { storeId: store.id } }), 1);
    });

    await t.test("the order is stored under the merchant without linking the matching phone account", async () => {
      const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId }, include: { buyer: true } });
      assert.equal(order.storeId, store.id);
      assert.equal(order.paymentMethod, "CASH_ON_DELIVERY");
      assert.notEqual(order.buyerId, existingBuyer.id);
      assert.equal(order.buyer.isActive, false);
      assert.equal(order.buyer.supabaseId, null);
    });

    await t.test("the owning session can track and an unrelated session cannot", async () => {
      assert.equal((await status(orderId, cookie)).status, 200);
      assert.equal((await status(orderId, "bastah_guest_checkout=" + "b".repeat(64))).status, 404);
    });

    await t.test("changed shipping invalidates the previous quote without creating an order", async () => {
      await prisma.shippingZone.update({ where: { id: zone.id }, data: { price: 17 } });
      const response = await confirm(request("confirm", { ...attempt, requestId: randomUUID() }, cookie));
      assert.equal(response.status, 409);
      assert.equal(await prisma.order.count({ where: { storeId: store.id } }), 1);
    });

    await t.test("stock depletion prevents later checkout", async () => {
      await prisma.productVariant.update({ where: { id: variant.id }, data: { quantity: 0 } });
      const response = await confirm(request("confirm", { ...attempt, requestId: randomUUID() }, cookie));
      assert.equal(response.status, 409);
      assert.equal(await prisma.order.count({ where: { storeId: store.id } }), 1);
    });
  } finally {
    await prisma.$disconnect();
  }
});
