// tests/integrations.selftest.ts
// اختبارات ذاتية لنظام التكاملات (بلا قاعدة بيانات ولا إطار اختبار):
//   npx tsx tests/integrations.selftest.ts
// تغطي: كتالوج الأحداث، المحرك، التوجيه، عزل المتاجر، المزوّد الموقَّع على خادم HTTP حقيقي.

import assert from "node:assert/strict";
import crypto from "node:crypto";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { createEngine, MAX_PAYLOAD_BYTES, type EngineDeps, type StoreContext } from "../lib/integrations/engine-core";
import { EVENT_CATALOG } from "../lib/integrations/catalog";
import { resolveRouting } from "../lib/integrations/routing";
import { validateAccountUrl } from "../lib/integrations/account-types";
import { getProviderDef, providerKeys } from "../lib/integrations/registry";
import { WebhookProvider } from "../lib/integrations/providers/webhook";
import type { IntegrationEnvelope, IntegrationProvider, Routing } from "../lib/integrations/types";

let passed = 0;
async function test(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log(`ok   ${name}`); }
  catch (e) { console.error(`FAIL ${name}\n     ${e instanceof Error ? e.message : e}`); process.exitCode = 1; }
}

const ctxA: StoreContext = { store: { id: "A", name: "متجر أ", slug: "a" }, accounts: [{ type: "instagram", url: "https://instagram.com/a" }] };
const ctxB: StoreContext = { store: { id: "B", name: "متجر ب", slug: "b" }, accounts: [] };

function fakeProvider(key: string, ok = true, sink: IntegrationEnvelope[] = []): IntegrationProvider {
  return { key, async send(e) { sink.push(e); return ok ? { ok: true } : { ok: false, errorMessage: "boom" }; }, async test() { return ok; } };
}

function engineWith(over: Partial<EngineDeps> & { routing?: Routing } = {}) {
  const deps: EngineDeps = {
    getRouting: async () => over.routing ?? { "content.publish": { enabled: true, providers: ["p"] }, "cart.abandoned": { enabled: true, providers: ["p"] } },
    getStoreContext: over.getStoreContext ?? (async (id) => (id === "A" ? ctxA : id === "B" ? ctxB : null)),
    resolveProvider: over.resolveProvider ?? (async (k) => (k === "p" ? fakeProvider("p") : null)),
  };
  return createEngine(deps);
}

async function main() {
  await test("كتالوج الأحداث: الأنواع المعلنة هي المنفَّذة فقط", () => {
    assert.deepEqual(EVENT_CATALOG.map((e) => e.key).sort(), ["cart.abandoned", "content.publish"]);
  });

  await test("المحرك يرفض نوع حدث غير مسموح", async () => {
    const r = await engineWith().emit({ type: "order.created", source: "x", storeId: "A", data: {} });
    assert.equal(r.status, "skipped"); assert.equal(r.reason, "unknown_event");
  });

  await test("حدث معطَّل من الإدارة لا يُرسل", async () => {
    const r = await engineWith({ routing: { "cart.abandoned": { enabled: false, providers: ["p"] }, "content.publish": { enabled: true, providers: ["p"] } } })
      .emit({ type: "cart.abandoned", source: "x", storeId: "A", data: {} });
    assert.equal(r.reason, "event_disabled");
  });

  await test("لا مزوّد مضبوط = لا إرسال", async () => {
    const r = await engineWith({ resolveProvider: async () => null }).emit({ type: "content.publish", source: "x", storeId: "A", data: {} });
    assert.equal(r.reason, "no_provider");
  });

  await test("متجر بلا حساب خارجي = لا إرسال (موافقة التاجر)", async () => {
    const r = await engineWith().emit({ type: "cart.abandoned", source: "x", storeId: "B", data: {} });
    assert.equal(r.reason, "no_accounts");
  });

  await test("متجر غير موجود = لا إرسال", async () => {
    const r = await engineWith().emit({ type: "cart.abandoned", source: "x", storeId: "ZZZ", data: {} });
    assert.equal(r.reason, "no_accounts");
  });

  await test("حمولة أكبر من الحد ترفض", async () => {
    const r = await engineWith().emit({ type: "content.publish", source: "x", storeId: "A", data: { blob: "x".repeat(MAX_PAYLOAD_BYTES + 1) } });
    assert.equal(r.reason, "payload_too_large");
  });

  await test("التسليم يحمل المتجر المعنيّ وحساباته فقط (عزل)", async () => {
    const sink: IntegrationEnvelope[] = [];
    const asked: string[] = [];
    const eng = engineWith({
      resolveProvider: async () => fakeProvider("p", true, sink),
      getStoreContext: async (id) => { asked.push(id); return id === "A" ? ctxA : ctxB; },
    });
    const r = await eng.emit({ type: "content.publish", source: "marketing-content", storeId: "A", data: { title: "t" } });
    assert.equal(r.status, "delivered");
    assert.deepEqual(asked, ["A"]);
    assert.equal(sink[0].store.id, "A");
    assert.deepEqual(sink[0].accounts, ctxA.accounts);
    assert.equal(sink[0].source, "marketing-content");
    assert.equal(JSON.stringify(sink[0]).includes("متجر ب"), false);
  });

  await test("فشل مزوّد لا يوقف الآخر، والنتيجة partial", async () => {
    const eng = engineWith({
      routing: { "content.publish": { enabled: true, providers: ["good", "bad", "throws"] }, "cart.abandoned": { enabled: true, providers: [] } },
      resolveProvider: async (k) => k === "good" ? fakeProvider("good") : k === "bad" ? fakeProvider("bad", false)
        : { key: "throws", async send() { throw new Error("x"); }, async test() { return false; } },
    });
    const r = await eng.emit({ type: "content.publish", source: "x", storeId: "A", data: {} });
    assert.equal(r.status, "partial");
    assert.deepEqual(r.results.map((x) => x.ok), [true, false, false]);
  });

  await test("المحرك لا يرمي أبداً حتى لو انهارت الاعتماديات", async () => {
    const eng = engineWith({ getStoreContext: async () => { throw new Error("db down"); } });
    const r = await eng.emit({ type: "content.publish", source: "x", storeId: "A", data: {} });
    assert.equal(r.status, "failed");
  });

  await test("التوجيه: الافتراضي = مفعّل نحو webhook (توافق مع السلوك السابق)", () => {
    const r = resolveRouting(null, EVENT_CATALOG, providerKeys());
    assert.deepEqual(r["cart.abandoned"], { enabled: true, providers: ["webhook"] });
    assert.deepEqual(r["content.publish"], { enabled: true, providers: ["webhook"] });
  });

  await test("التوجيه: يُسقط المزوّدين والأحداث غير المسجَّلة ويحترم القائمة الفارغة", () => {
    const r = resolveRouting({ "cart.abandoned": { enabled: false, providers: ["ghost", "webhook", "webhook"] }, "content.publish": { providers: [] }, "order.created": { enabled: true, providers: ["webhook"] } }, EVENT_CATALOG, providerKeys());
    assert.deepEqual(r["cart.abandoned"], { enabled: false, providers: ["webhook"] });
    assert.deepEqual(r["content.publish"], { enabled: true, providers: [] });
    assert.equal("order.created" in r, false);
  });

  await test("التوجيه: بيانات تالفة لا تكسر شيئاً", () => {
    for (const bad of ["x", 5, [], { "cart.abandoned": "x" }]) {
      const r = resolveRouting(bad, EVENT_CATALOG, providerKeys());
      assert.equal(r["cart.abandoned"].enabled, true);
    }
  });

  await test("السجل: لا يُعيد مزوّداً عبر مفاتيح النموذج الأولي", () => {
    assert.equal(getProviderDef("__proto__"), undefined);
    assert.equal(getProviderDef("constructor"), undefined);
    assert.ok(getProviderDef("webhook"));
    assert.deepEqual(providerKeys(), ["webhook"]);
  });

  await test("webhook: يرفض http والمفتاح القصير", () => {
    const schema = getProviderDef("webhook")!.credentialsSchema;
    assert.equal(schema.safeParse({ url: "http://a.com", secret: "x".repeat(20) }).success, false);
    assert.equal(schema.safeParse({ url: "https://a.com", secret: "short" }).success, false);
    assert.equal(schema.safeParse({ url: "https://a.com/h", secret: "x".repeat(20) }).success, true);
  });

  await test("أنواع الحسابات: النطاق يجب أن يطابق النوع", () => {
    assert.equal(validateAccountUrl("instagram", "https://www.instagram.com/a"), "https://www.instagram.com/a");
    for (const [t, u] of [["instagram", "https://evil.com/instagram.com"], ["instagram", "https://instagram.com.evil.com/"], ["instagram", "http://instagram.com/a"], ["snapchat", "https://u:p@snapchat.com/a"], ["nope", "https://a.com"]]) {
      assert.throws(() => validateAccountUrl(t, u));
    }
  });

  await test("webhook: حارس SSRF الافتراضي يمنع localhost", async () => {
    const p = new WebhookProvider({ url: "https://127.0.0.1:9/x", secret: "s".repeat(20) });
    const r = await p.send({ event: "content.publish", source: "t", store: ctxA.store, accounts: ctxA.accounts, data: {} });
    assert.equal(r.ok, false);
    assert.equal(await p.test(), false);
  });

  // ── خادم HTTP حقيقي: التوقيع وصيغة الجسم والتحويلات ──
  const received: { headers: http.IncomingHttpHeaders; body: string }[] = [];
  let mode: "ok" | "redirect" | "fail" = "ok";
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      received.push({ headers: req.headers, body });
      if (mode === "redirect") { res.writeHead(302, { Location: "http://169.254.169.254/" }); res.end(); }
      else if (mode === "fail") { res.writeHead(500); res.end(); }
      else { res.writeHead(200); res.end("{}"); }
    });
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const url = `https://127.0.0.1:${(server.address() as AddressInfo).port}/hook`;
  const allowLocal = async () => new URL(url.replace("https:", "http:")); // الاختبار فقط: نوجّه إلى الخادم المحلي
  const secret = "test-secret-1234567890";
  const provider = new WebhookProvider({ url, secret }, { guard: allowLocal });

  await test("webhook: توقيع HMAC صحيح وصيغة الجسم المتوافقة", async () => {
    mode = "ok"; received.length = 0;
    const r = await provider.send({ event: "cart.abandoned", source: "cart-recovery", store: ctxA.store, accounts: ctxA.accounts, data: { cartId: "c1", itemCount: 2 } });
    assert.equal(r.ok, true);
    const { headers, body } = received[0];
    const ts = String(headers["x-basita-timestamp"]);
    const expected = "sha256=" + crypto.createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");
    assert.equal(headers["x-basita-signature"], expected);
    assert.equal(headers["x-basita-event"], "cart.abandoned");
    const parsed = JSON.parse(body);
    assert.equal(parsed.event, "cart.abandoned");
    assert.equal(parsed.storeId, "A");
    assert.deepEqual(parsed.data.links, [{ platform: "instagram", url: "https://instagram.com/a" }]); // حقل قديم محفوظ
    assert.equal(parsed.data.source, "cart-recovery");
    assert.equal(parsed.data.store.name, "متجر أ");
    assert.equal(parsed.data.cartId, "c1");
    assert.equal("customer" in parsed.data, false); // بلا هوية ما لم يمرّرها المصدر بموافقة
  });

  await test("webhook: اختبار الاتصال يرسل connection.test موقَّعاً", async () => {
    mode = "ok"; received.length = 0;
    assert.equal(await provider.test(), true);
    assert.equal(received[0].headers["x-basita-event"], "connection.test");
    assert.ok(String(received[0].headers["x-basita-signature"]).startsWith("sha256="));
  });

  await test("webhook: لا يتبع التحويلات (302 = فشل)", async () => {
    mode = "redirect";
    const r = await provider.send({ event: "content.publish", source: "t", store: ctxA.store, accounts: ctxA.accounts, data: {} });
    assert.equal(r.ok, false);
  });

  await test("webhook: خطأ الخادم 500 = فشل مع رسالة", async () => {
    mode = "fail";
    const r = await provider.send({ event: "content.publish", source: "t", store: ctxA.store, accounts: ctxA.accounts, data: {} });
    assert.equal(r.ok, false); assert.equal(r.errorMessage, "HTTP 500");
  });

  await test("تكامل كامل: المحرك + المزوّد الحقيقي + الخادم", async () => {
    mode = "ok"; received.length = 0;
    const eng = engineWith({ resolveProvider: async (k) => (k === "p" ? provider : null) });
    const r = await eng.emit({ type: "content.publish", source: "marketing-content", storeId: "A", data: { contentId: "m1", title: "عنوان" } });
    assert.equal(r.status, "delivered");
    assert.equal(received.length, 1);
    assert.equal(JSON.parse(received[0].body).data.title, "عنوان");
  });

  server.close();
  console.log(`\n${passed} اختباراً نجح${process.exitCode ? " — وهناك إخفاقات" : ""}`);
}

main();
