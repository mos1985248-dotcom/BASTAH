import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { test } from "node:test";
import sharp from "sharp";
import { prisma } from "../../lib/prisma";
import { imageBudget, imageProviders, inspectCloudflareBilling, isVerifiedFreeImageAccount, reservedNeurons, CloudflareDiagnosticError } from "../../lib/munira/image-provider";
import { fluxModel } from "../../lib/munira/image-options";
import { generateStudioImage, imageQuota, imageSettingsKey, ownedStudioImage, studioFile } from "../../lib/munira/image-studio";

test("image generation requires explicit and unambiguous zero-cost Workers billing evidence", () => {
  const free = { price: 0, state: "Paid", rate_plan: { id: "workers_free" } };
  assert.equal(isVerifiedFreeImageAccount({ success: true, result: [free] }), true);
  const provisioned = { price: "0.00", state: "Provisioned", rate_plan: { public_name: "Cloudflare Workers Free" } };
  assert.equal(isVerifiedFreeImageAccount({ success: true, result: [provisioned] }), true);
  assert.equal(inspectCloudflareBilling({ success: true, result: [{}] }).code, "BILLING_PAID_OR_AMBIGUOUS");
  assert.equal(inspectCloudflareBilling({ success: true, result: [free, { state: "Paid" }] }).code, "BILLING_PAID_OR_AMBIGUOUS");
  assert.equal(inspectCloudflareBilling({ success: true, result: [] }).code, "BILLING_UNVERIFIED");
  assert.equal(inspectCloudflareBilling({ success: true, result: {} }).code, "UNEXPECTED_RESPONSE");
  assert.equal(isVerifiedFreeImageAccount({ success: true, result: [] }), false);
  assert.equal(isVerifiedFreeImageAccount({ success: true, result: [{ ...free, state: "Trial" }] }), false);
  assert.equal(isVerifiedFreeImageAccount({ success: true, result: [free, { ...free, price: 5 }] }), false);
  assert.equal(isVerifiedFreeImageAccount({ success: true, result: [free, { ...free, rate_plan: { id: "workers_paid" } }] }), false);
});

test("Cloudflare verification classifies HTTP errors without exposing secret material", async t => {
  const oldAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  const oldToken = process.env.CLOUDFLARE_API_TOKEN;
  const account = "a".repeat(32);
  const secret = "test-only-token";
  process.env.CLOUDFLARE_ACCOUNT_ID = account;
  process.env.CLOUDFLARE_API_TOKEN = secret;
  t.after(() => {
    if (oldAccount === undefined) delete process.env.CLOUDFLARE_ACCOUNT_ID;
    else process.env.CLOUDFLARE_ACCOUNT_ID = oldAccount;
    if (oldToken === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
    else process.env.CLOUDFLARE_API_TOKEN = oldToken;
  });
  const logger = t.mock.method(console, "warn", () => {});
  let status = 403;
  t.mock.method(globalThis, "fetch", async () => Response.json({ errors: [{ code: 10000, message: secret }] }, { status }));
  for (const [value, code] of [[401, "AUTH_INVALID"], [403, "PERMISSION_DENIED"], [404, "ACCOUNT_NOT_FOUND"], [429, "HTTP_429"]] as const) {
    status = value;
    await assert.rejects(imageProviders.cloudflare.verify(), (error: unknown) => {
      assert.ok(error instanceof CloudflareDiagnosticError);
      assert.deepEqual(error.diagnostic, { code, httpStatus: value, providerCodes: [10000] });
      return true;
    });
  }
  const logged = JSON.stringify(logger.mock.calls.map(call => call.arguments));
  assert.match(logged, /MUNIRA-CLOUDFLARE/);
  assert.ok(!logged.includes(secret) && !logged.includes(account));
});

test("isolated studio processes 50 merchants with a shared ceiling and separate quota", {
  skip: process.env.RUN_MUNIRA_IMAGE_INTEGRATION !== "1",
}, async () => {
  const url = new URL(process.env.DATABASE_URL!);
  assert.equal(url.hostname, "127.0.0.1");
  assert.equal(url.pathname, "/bastah_studio");
  const fixture = "image-" + randomUUID().slice(0, 8);
  const storage = new Map<string, Buffer>();
  const server = createServer(async (req, res) => {
    const path = req.url?.split("/munira-private/").at(-1) ?? "";
    if (req.method === "POST") {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      storage.set(path, Buffer.concat(chunks));
      return res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ Key: path }));
    }
    const bytes = storage.get(path);
    if (bytes) return res.writeHead(200, { "Content-Type": "image/webp" }).end(bytes);
    res.writeHead(404).end();
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  process.env.NEXT_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${address.port}`;
  process.env.SUPABASE_SERVICE_KEY = "local-fixture";
  const image = await sharp({ create: { width: 12, height: 12, channels: 3, background: "#006241" } }).webp().toBuffer();
  const provider = imageProviders.cloudflare;
  const original = { ...provider };
  let calls = 0;
  provider.verify = async () => ({ code: "VERIFIED_FREE" });
  provider.generate = async (_, prompt) => {
    calls++;
    if (prompt.includes("اختبار الفشل")) throw new Error("HTTP_429");
    return { buffer: image, estimatedNeurons: 58 };
  };
  const request = (prompt = "صورة لتمور القصيم") => ({
    requestId: randomUUID(), prompt, kind: "product" as const, size: "square" as const,
  });
  const scopes: string[] = [];
  try {
    const plans = ["FREE", "STARTER", "GROWTH", "PRO"] as const;
    for (const [index, plan] of plans.entries()) {
      await prisma.subscriptionPlanConfig.upsert({ where: { plan },
        create: { plan, nameAr: plan, priceMonthly: index, priceYearly: index, muniraMonthlyImages: [0, 0, 20, 40][index] },
        update: { muniraMonthlyImages: [0, 0, 20, 40][index] },
      });
    }
    await prisma.platformSetting.upsert({ where: { key: imageSettingsKey }, create: {
      key: imageSettingsKey, type: "json", value: JSON.stringify({ enabled: true, models: [{ provider: "cloudflare", model: fluxModel, enabled: true, priority: 1 }] }),
    }, update: {} });
    await prisma.user.createMany({ data: Array.from({ length: 53 }, (_, i) => ({ id: `${fixture}-u${i}`, name: fixture, role: "SELLER" })) });
    const fixtures = Array.from({ length: 53 }, (_, i) => ({ id: `${fixture}-s${i}`, userId: `${fixture}-u${i}`, slug: `${fixture}-s${i}`, nameAr: fixture, status: "ACTIVE" as const }));
    scopes.push(...fixtures.map(row => "store:" + row.id));
    await prisma.store.createMany({ data: fixtures });
    await prisma.storeSubscription.createMany({ data: fixtures.map((row, i) => ({ storeId: row.id, plan: plans[Math.min(i, 3)] })) });
    const run = (i: number, input = request()) => generateStudioImage(scopes[i], input, fixtures[i].id);
    const chatCount = await prisma.muniraRequest.count();
    await assert.rejects(run(0), { status: 403 });
    await assert.rejects(run(1), { status: 403 });
    assert.equal((await imageQuota(fixtures[2].id)).limit, 20);
    assert.equal((await imageQuota(fixtures[3].id)).limit, 40);
    await assert.rejects(run(2, request("اختبار الفشل")), { status: 503 });
    assert.equal((await imageQuota(fixtures[2].id)).used, 0);

    const originalRequest = request();
    const outcomes = await Promise.allSettled([run(3, originalRequest), run(3, originalRequest)]);
    const fulfilled = outcomes.find(item => item.status === "fulfilled");
    assert.ok(fulfilled && fulfilled.status === "fulfilled");
    assert.equal(await run(3, originalRequest), fulfilled.value);
    assert.equal((await imageQuota(fixtures[3].id)).used, 1);
    await assert.rejects(ownedStudioImage(scopes[2], fulfilled.value), { status: 404 });
    const response = await studioFile(scopes[3], fulfilled.value, true);
    assert.equal(response.headers.get("Content-Type"), "image/webp");
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), image);

    const simulations = await Promise.allSettled(fixtures.slice(3).map((_, i) => run(i + 3)));
    const successes = simulations.filter(item => item.status === "fulfilled");
    assert.equal(successes.length, imageBudget / reservedNeurons - 2);
    assert.equal(calls, imageBudget / reservedNeurons);
    assert.equal(await prisma.muniraRequest.count(), chatCount);
  } finally {
    Object.assign(provider, original);
    await prisma.muniraImage.deleteMany({ where: { scope: { in: scopes } } });
    await prisma.store.deleteMany({ where: { id: { startsWith: fixture } } });
    await prisma.user.deleteMany({ where: { id: { startsWith: fixture } } });
    await prisma.platformSetting.deleteMany({ where: { key: imageSettingsKey } });
    await prisma.$disconnect();
    server.close();
  }
});
