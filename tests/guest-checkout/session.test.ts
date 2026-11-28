import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest, NextResponse } from "next/server";
import { guestBuyerId, guestOrderId, guestOrderIdPattern, guestSession, setGuestSession, startGuestSession } from "../../lib/guest-order-session";
import { guestQuoteSchema } from "../../lib/guest-checkout";
import { GET } from "../../app/api/guest-checkout/status/route";
import { POST as confirm } from "../../app/api/guest-checkout/confirm/route";
import { POST as quote } from "../../app/api/guest-checkout/quote/route";

const url = "https://example.test/api/guest-checkout/status";
const session = "a".repeat(64);
const otherSession = "b".repeat(64);
const attemptId = "23dc36fe-b1d0-43b5-b20c-50f2e77fd33b";
const payload = {
  name: "اسم الاختبار", phone: "0501234567", city: "الرياض", region: "الرياض", address: "شارع اختبار 10",
  paymentMethod: "CASH_ON_DELIVERY", storeId: "clabcdefgh123456789012345", items: [
    { productId: "clabcdefgh123456789012346", variantId: "clabcdefgh123456789012347", quantity: 2 },
  ],
};

test("order retries derive the same id only within the owning session", () => {
  const id = guestOrderId(attemptId, session);
  assert.match(id, guestOrderIdPattern);
  assert.equal(id, guestOrderId(attemptId, session));
  assert.notEqual(id, guestOrderId(attemptId, otherSession));
  assert.notEqual(guestBuyerId(session), guestBuyerId(otherSession));
});

test("only structurally valid cookies are accepted", () => {
  const invalid = new NextRequest(url, { headers: { cookie: "bastah_guest_checkout=invalid" } });
  assert.equal(guestSession(invalid), null);
  const valid = new NextRequest(url, { headers: { cookie: "bastah_guest_checkout=" + session } });
  assert.equal(startGuestSession(valid), session);
  assert.match(startGuestSession(invalid), /^[a-f0-9]{64}$/);
});

test("guest session cookie is HTTP-only and scoped to checkout APIs", () => {
  const response = NextResponse.json({});
  setGuestSession(response, session);
  const cookie = response.headers.get("set-cookie") ?? "";
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=lax/i);
  assert.match(cookie, /Path=\/api\/guest-checkout/);
});

test("tracking denies access without a session without querying the database", async () => {
  const response = await GET(new NextRequest(url + "?id=" + guestOrderId(attemptId, session)));
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("guest checkout endpoints stay closed without the rollout flag", async () => {
  const previous = process.env.GUEST_CHECKOUT_ENABLED;
  delete process.env.GUEST_CHECKOUT_ENABLED;
  try {
    const request = new NextRequest(url, { method: "POST" });
    assert.equal((await quote(request)).status, 503);
    assert.equal((await confirm(request)).status, 503);
  } finally {
    if (previous !== undefined) process.env.GUEST_CHECKOUT_ENABLED = previous;
  }
});

test("Saudi mobile and variant quantity are normalized and validated", () => {
  assert.equal(guestQuoteSchema.parse(payload).phone, "+966501234567");
  assert.equal(guestQuoteSchema.safeParse({ ...payload, phone: "123" }).success, false);
  assert.equal(guestQuoteSchema.safeParse({ ...payload, items: [{ ...payload.items[0], quantity: 0 }] }).success, false);
});

test("guest checkout rejects payment methods it cannot confirm", () => {
  assert.equal(guestQuoteSchema.safeParse({ ...payload, paymentMethod: "CREDIT_CARD" }).success, false);
  assert.equal(guestQuoteSchema.safeParse({ ...payload, paymentMethod: "BANK_TRANSFER" }).success, false);
});
