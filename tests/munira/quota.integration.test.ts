import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { prisma } from "../../lib/prisma";
import { completeMessage, quotaWindow, releaseMessage, reserveMessage } from "../../lib/munira/quota";

test("local PostgreSQL serializes seller requests and simulates 50 merchants without provider calls",
  { skip: process.env.RUN_MUNIRA_LOCAL_INTEGRATION !== "1" }, async () => {
    const name = new URL(process.env.DATABASE_URL ?? "");
    assert.ok(["localhost", "127.0.0.1"].includes(name.hostname) && name.pathname === "/munira_preview");
    const users: string[] = [];
    const stores: string[] = [];
    try {
      for (let i = 0; i < 50; i++) {
        const role = i === 0 ? "FREE" : i === 1 ? "GROWTH" : i === 2 ? "PRO" : "STARTER";
        const user = await prisma.user.create({ data: {
          name: "Munira integration", role: "SELLER",
          store: { create: { nameAr: "متجر اختبار", slug: randomUUID(), subscription: { create: { plan: role } } } },
        }, include: { store: true } });
        users.push(user.id);
        stores.push(user.store!.id);
      }
      const ticket = (storeId: string) => ({ scope: `store:${storeId}`, storeId, requestId: randomUUID(), inputHash: "same-input" });
      await assert.rejects(() => reserveMessage(ticket(stores[0])), { status: 403 });
      const completed = async (item: ReturnType<typeof ticket>) => {
        const reservation = await reserveMessage(item);
        assert.ok(reservation.lease);
        const sessionId = await completeMessage({ scope: item.scope, requestId: item.requestId }, reservation.lease, "رد عربي", async () => "local-test-session");
        assert.equal(sessionId, "local-test-session");
      };

      for (let offset = 1; offset < stores.length; offset += 7) {
        const batch = stores.slice(offset, offset + 7);
        await Promise.all(batch.map((id, index) => new Promise<void>((resolve, reject) => {
          setTimeout(() => { void completed(ticket(id)).then(resolve, reject); }, index * 5);
        })));
      }

      const storeId = stores[49];
      const request = ticket(storeId);
      const first = await reserveMessage(request);
      assert.ok(first.lease);
      await assert.rejects(() => reserveMessage(request), { status: 409 });
      await releaseMessage({ scope: request.scope, requestId: request.requestId }, first.lease);
      await completed(request);
      assert.deepEqual((await reserveMessage(request)).replay, { response: "رد عربي", sessionId: "local-test-session" });
      await assert.rejects(() => reserveMessage({ ...request, inputHash: "different" }), { status: 409 });

      const attempts = await Promise.allSettled(Array.from({ length: 12 }, () => completed(ticket(storeId))));
      assert.equal(attempts.filter(result => result.status === "fulfilled").length, 3);
      assert.equal(await prisma.muniraRequest.count({ where: { scope: request.scope, state: "COMPLETE", quotaWindow: "trial" } }), 5);
      assert.equal(await prisma.muniraRequest.count({ where: { scope: `store:${stores[48]}`, state: "COMPLETE" } }), 1);
      for (const [index, limit] of [[1, 100], [2, 200]] as const) {
        const scope = `store:${stores[index]}`;
        const window = quotaWindow(limit, 0, new Date()).key;
        await prisma.muniraRequest.createMany({ data: Array.from({ length: limit - 2 }, () => ({
          scope, requestId: randomUUID(), inputHash: "filled", lease: randomUUID(), quotaWindow: window,
          state: "COMPLETE", expiresAt: new Date(),
        })) });
        await completed(ticket(stores[index]));
        await assert.rejects(() => reserveMessage(ticket(stores[index])), { status: 429 });
      }
    } finally {
      await prisma.muniraRequest.deleteMany({ where: { scope: { in: stores.map(id => `store:${id}`) } } });
      await prisma.store.deleteMany({ where: { id: { in: stores } } });
      await prisma.user.deleteMany({ where: { id: { in: users } } });
      await prisma.$disconnect();
    }
  });
