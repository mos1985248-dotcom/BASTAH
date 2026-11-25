import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { prisma } from "../../lib/prisma";
import { moyasarCreationPending } from "../../lib/subscription-invoice-reference";
import { startSubscriptionCheckout } from "../../lib/subscription-checkout";
import { applyMoyasarSubscriptionPaymentStatus } from "../../lib/subscription-payment";
import type { MoyasarInvoice } from "../../lib/moyasar";

test("subscription checkout retains a single payable invoice across retries", {
  skip: process.env.RUN_BASTAH_SUBSCRIPTION_CHECKOUT_INTEGRATION !== "1",
}, async () => {
  const database = new URL(process.env.DATABASE_URL ?? "");
  assert.ok(["localhost", "127.0.0.1"].includes(database.hostname));
  assert.equal(database.pathname, "/bastah_entitlements");

  const user = await prisma.user.create({
    data: {
      name: "Local payment fixture",
      role: "SELLER",
      store: { create: { nameAr: "متجر اختبار", slug: randomUUID(), subscription: { create: { plan: "FREE" } } } },
    },
    include: { store: { include: { subscription: true } } },
  });
  const store = user.store!;
  const input = {
    subscriptionId: store.subscription!.id,
    storeId: store.id,
    userId: user.id,
    targetPlan: "GROWTH" as const,
    billingCycle: "monthly",
    amount: 99,
    description: "Local fixture",
    appUrl: "https://example.test",
    secretKey: "local-fixture",
    now: new Date(2026, 0, 10),
  };

  let creates = 0;
  const provider = new Map<string, MoyasarInvoice>();
  let nextResponse: "timeout" | "denied" | undefined;
  let signalEntered: () => void;
  let releaseCreate: () => void;
  const entered = new Promise<void>(resolve => { signalEntered = resolve; });
  const release = new Promise<void>(resolve => { releaseCreate = resolve; });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (resource, options) => {
    const url = new URL(String(resource));
    assert.equal(url.origin, "https://api.moyasar.com");
    if (options?.method !== "POST") {
      const reference = url.pathname.split("/").at(-1)!;
      return Response.json(provider.get(reference));
    }

    creates++;
    const request = JSON.parse(String(options.body));
    assert.equal(request.currency, "SAR");
    assert.ok(request.expired_at);
    if (nextResponse === "denied") return new Response("", { status: 401 });
    const remote = {
      id: randomUUID(), status: "initiated", url: `https://checkout.example.test/${creates}`,
      currency: request.currency, amount: request.amount, payments: [],
    };
    provider.set(remote.id, remote);
    if (nextResponse === "timeout") throw new Error("Response lost after creation");
    if (creates === 1) {
      signalEntered();
      await release;
    }
    return Response.json(remote, { status: 201 });
  };

  try {
    const first = startSubscriptionCheckout(input);
    try {
      await Promise.race([entered, first.then(() => assert.fail("Expected provider creation to be held"))]);
      const concurrent = await Promise.allSettled(Array.from({ length: 8 }, () => startSubscriptionCheckout(input)));
      assert.ok(concurrent.every(result => result.status === "rejected" && result.reason.status === 409));
      assert.equal(creates, 1);
    } finally {
      releaseCreate!();
    }
    const firstResponse = await first;
    assert.deepEqual(await startSubscriptionCheckout(input), firstResponse);
    await assert.rejects(startSubscriptionCheckout({ ...input, targetPlan: "PRO" }), { status: 409 });
    assert.equal(creates, 1);

    const closed = [...provider.values()][0];
    closed.status = "expired";
    const replacements = await Promise.allSettled(Array.from({ length: 4 }, () => startSubscriptionCheckout(input)));
    assert.equal(creates, 2);
    const reused = await startSubscriptionCheckout(input);
    assert.equal(reused.invoiceId, firstResponse.invoiceId);
    assert.notEqual(reused.paymentUrl, firstResponse.paymentUrl);
    assert.ok(replacements.some(result => result.status === "fulfilled"));
    assert.equal((await applyMoyasarSubscriptionPaymentStatus(reused.invoiceId, "paid", closed.id)).applied, false);

    const current = [...provider.values()][1];
    current.status = "paid";
    await assert.rejects(startSubscriptionCheckout(input), { status: 409 });
    const invoice = await prisma.subscriptionInvoice.findUniqueOrThrow({ where: { id: reused.invoiceId } });
    assert.equal(invoice.status, "PAID");
    await assert.rejects(startSubscriptionCheckout(input), { status: 409 });
    assert.equal(creates, 2);

    const february = { ...input, now: new Date(2026, 1, 10) };
    nextResponse = "timeout";
    await assert.rejects(startSubscriptionCheckout(february), { status: 409 });
    nextResponse = undefined;
    await assert.rejects(startSubscriptionCheckout(february), { status: 409 });
    assert.equal(creates, 3);
    const uncertain = await prisma.subscriptionInvoice.findFirstOrThrow({ where: { subscriptionId: input.subscriptionId, periodMonth: 2 } });
    assert.equal(uncertain.moyasarTxnId, moyasarCreationPending);

    const march = { ...input, now: new Date(2026, 2, 10) };
    nextResponse = "denied";
    await assert.rejects(startSubscriptionCheckout(march), { status: 401 });
    nextResponse = undefined;
    assert.ok((await startSubscriptionCheckout(march)).paymentUrl);
    assert.equal(creates, 5);
  } finally {
    globalThis.fetch = originalFetch;
    await prisma.store.delete({ where: { id: store.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.$disconnect();
  }
});
