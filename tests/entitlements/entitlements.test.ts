import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { test } from "node:test";
import { prisma } from "../../lib/prisma";
import { launchExpiry, grantLaunchPromotion } from "../../lib/launch-promotion";
import { resolveFeature } from "../../lib/entitlements";
import { getStoreQuota } from "../../lib/munira/quota";
import { detectAbandonedCarts } from "../../lib/abandoned-carts";
import { remindAbandonedCart } from "../../lib/abandoned-carts-notify";

test("promotion expires after three calendar months, clamped to the final day", () => {
  assert.equal(launchExpiry(new Date("2026-11-30T14:30:00Z")).toISOString(), "2027-02-28T14:30:00.000Z");
});

test("expired monthly subscriptions keep the last earned window without receiving a new quota", async () => {
  const endDate = new Date("2026-11-17T16:18:22Z");
  const db = {
    storeSubscription: { findUnique: async () => ({ plan: "GROWTH", status: "ACTIVE", endDate, store: { status: "ACTIVE" } }) },
    subscriptionPlanConfig: { findUnique: async () => ({ nameAr: "بسطة انطلاق", muniraTrialMessages: 0, muniraMonthlyMessages: 100 }) },
    platformFeature: { findUnique: async () => null },
    storeFeatureOverride: { findUnique: async () => null },
    launchPromotion: { findUnique: async () => null },
  } as unknown as Prisma.TransactionClient;

  const quota = await getStoreQuota(db, "test", new Date("2026-11-24T12:00:00Z"));
  assert.deepEqual(quota, {
    key: "2026-11", planLimit: 100, limit: 100, allowed: true, retained: true, active: false, expired: true, planName: "بسطة انطلاق",
  });
  const afterMonth = await getStoreQuota(db, "test", new Date("2026-12-03T12:00:00Z"));
  assert.equal(afterMonth.key, "2026-11");
  assert.equal(afterMonth.limit, 100);
  const beforeExpiry = await getStoreQuota(db, "test", new Date(endDate.getTime() - 1));
  assert.equal(beforeExpiry.limit, 100);
  assert.equal(beforeExpiry.allowed, true);
});

test("pricing is available on all plans and after expiry for active stores", async () => {
  const now = new Date("2026-11-24T12:00:00Z");
  for (const plan of ["FREE", "STARTER", "GROWTH", "PRO"] as const) {
    const subscription = { plan, status: "EXPIRED", store: { status: "ACTIVE" } };
    const feature = { enabled: true, plans: [] };
    const db = {
      storeSubscription: { findUnique: async () => subscription },
      subscriptionPlanConfig: { findUnique: async () => null },
      platformFeature: { findUnique: async () => feature },
      storeFeatureOverride: { findUnique: async () => null },
      launchPromotion: { findUnique: async () => null },
    } as unknown as Prisma.TransactionClient;

    assert.equal((await resolveFeature(db, "test", "pricing", now)).allowed, true);
    assert.equal((await resolveFeature(db, "test", "products", now)).allowed, false);
    feature.enabled = false;
    assert.equal((await resolveFeature(db, "test", "pricing", now)).allowed, false);
    feature.enabled = true;
    subscription.store.status = "SUSPENDED";
    assert.equal((await resolveFeature(db, "test", "pricing", now)).allowed, false);
  }
});

test("plan access, promotion caps and cart consent on an isolated PostgreSQL database", {
  skip: process.env.RUN_BASTAH_ENTITLEMENTS_INTEGRATION !== "1",
}, async () => {
  const url = new URL(process.env.DATABASE_URL!);
  assert.ok(["127.0.0.1", "localhost"].includes(url.hostname) && url.pathname === "/bastah_entitlements");
  const prefix = "ent-" + randomUUID().slice(0, 8);
  const actor = prefix + "-admin";
  const ids: string[] = [];
  const merchantIds: string[] = [];
  const makeStore = async (plan: "FREE" | "STARTER" | "GROWTH" | "PRO", i: number) => {
    const user = await prisma.user.create({
      data: { name: prefix, phone: "+9665" + String(83000000 + i), role: "SELLER", isVerified: true,
        store: { create: { nameAr: prefix, slug: prefix + "-" + i, status: "ACTIVE", subscription: { create: { plan } } } } },
      include: { store: true },
    });
    ids.push(user.store!.id);
    merchantIds.push(user.id);
    return user.store!.id;
  };
  const key = prefix.replace("-", "_");
  let buyerId: string | undefined;
  try {
    assert.equal(await prisma.launchPromotion.count(), 0);
    const [free, starter, growth, pro] = await Promise.all([
      makeStore("FREE", 0), makeStore("STARTER", 1), makeStore("GROWTH", 2), makeStore("PRO", 3),
    ]);
    for (const [storeId, allowed] of [[free, false], [starter, false], [growth, true], [pro, true]] as const) {
      assert.equal((await resolveFeature(prisma, storeId, "abandoned_carts")).allowed, allowed);
    }
    assert.equal((await resolveFeature(prisma, pro, "campaigns")).allowed, true);
    assert.equal((await resolveFeature(prisma, growth, "social")).allowed, false);
    assert.equal((await resolveFeature(prisma, pro, "social")).allowed, true);

    await prisma.platformFeature.create({ data: { key, label: key, plans: { create: { plan: "FREE", enabled: true } } } });
    assert.equal((await resolveFeature(prisma, free, key)).allowed, true);
    await prisma.platformFeature.update({ where: { key }, data: { enabled: false } });
    assert.equal((await resolveFeature(prisma, free, key)).allowed, false);
    await prisma.platformFeature.update({ where: { key }, data: { enabled: true } });
    await prisma.storeFeatureOverride.create({ data: { storeId: free, featureKey: key, enabled: false, startsAt: new Date("2020-01-01"), endsAt: new Date("2030-01-01") } });
    assert.equal((await resolveFeature(prisma, free, key, new Date("2026-01-01"))).reason, "store_exception");
    assert.equal((await resolveFeature(prisma, free, key, new Date("2030-01-01"))).allowed, true);

    await grantLaunchPromotion(free, actor);
    const promotion = await prisma.launchPromotion.findUniqueOrThrow({ where: { storeId: free } });
    assert.equal((await getStoreQuota(prisma, free, promotion.startsAt)).limit, 100);
    assert.equal((await getStoreQuota(prisma, free, promotion.endsAt)).limit, 0);
    assert.equal(await prisma.subscriptionInvoice.count({ where: { subscription: { storeId: free } } }), 0);
    await assert.rejects(grantLaunchPromotion(free, actor), /سبق/);

    const buyer = await prisma.user.create({ data: { name: prefix, role: "BUYER" } });
    buyerId = buyer.id;
    const cart = await prisma.abandonedCart.create({ data: {
      storeId: growth, userId: buyer.id, itemCount: 1, cartValue: 20, cartUpdatedAt: new Date(Date.now() - 7 * 3600000),
    } });
    assert.equal(await remindAbandonedCart(cart.id, pro), false);
    assert.equal(await remindAbandonedCart(cart.id, growth), false);
    await prisma.cartContactConsent.create({ data: { storeId: growth, userId: buyer.id } });
    assert.deepEqual((await Promise.all([remindAbandonedCart(cart.id, growth), remindAbandonedCart(cart.id, growth)])).sort(), [false, true]);
    await prisma.cartContactConsent.update({ where: { userId_storeId: { userId: buyer.id, storeId: growth } }, data: { revokedAt: new Date() } });
    assert.equal(await remindAbandonedCart(cart.id, growth), false);
    const order = await prisma.order.create({ data: {
      buyerId: buyer.id, storeId: growth, orderNumber: prefix,
      subtotal: 20, total: 20, shippingName: "Test", shippingPhone: "0500000000", shippingCity: "Riyadh", shippingAddress: "Test",
      createdAt: new Date(Date.now() + 1000),
    } });
    await detectAbandonedCarts(new Date(Date.now() + 2000));
    const recovered = await prisma.abandonedCart.findUniqueOrThrow({ where: { id: cart.id } });
    assert.equal(recovered.status, "RECOVERED");
    assert.equal(recovered.recoveredOrderId, order.id);
    assert.equal(await remindAbandonedCart(cart.id, growth), false);
    await prisma.storeSubscription.update({ where: { storeId: growth }, data: { endDate: new Date(Date.now() - 1000) } });
    const expiredQuota = await getStoreQuota(prisma, growth, new Date());
    assert.equal(expiredQuota.planLimit, 100);
    assert.equal(expiredQuota.limit, 100);
    assert.equal(expiredQuota.expired, true);
    assert.equal(expiredQuota.allowed, true);
    assert.equal((await resolveFeature(prisma, growth, "abandoned_carts")).allowed, false);
    assert.equal(await prisma.abandonedCart.count({ where: { id: cart.id } }), 1);

    const candidates = await Promise.all(Array.from({ length: 51 }, (_, i) => makeStore("FREE", i + 10)));
    const outcomes = await Promise.allSettled(candidates.map(id => grantLaunchPromotion(id, actor)));
    assert.equal(outcomes.filter(result => result.status === "fulfilled").length, 49);
    assert.equal(outcomes.filter(result => result.status === "rejected" && /نفدت/.test(String(result.reason))).length, 2);
    assert.equal(await prisma.launchPromotion.count(), 50);
  } finally {
    await prisma.launchPromotion.deleteMany({ where: { grantedBy: actor } });
    await prisma.featureChange.deleteMany({ where: { actorId: actor } });
    await prisma.platformFeature.deleteMany({ where: { key } });
    await prisma.order.deleteMany({ where: { orderNumber: prefix } });
    if (buyerId) await prisma.user.deleteMany({ where: { id: buyerId } });
    await prisma.store.deleteMany({ where: { id: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: merchantIds } } });
    await prisma.$disconnect();
  }
});
