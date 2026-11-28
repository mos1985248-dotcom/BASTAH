import { createHash, createHmac, randomBytes } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

const cookieName = "bastah_guest_checkout";
export const guestOrderIdPattern = /^guest_[a-f0-9]{64}$/;
const secretPattern = /^[a-f0-9]{64}$/;

export function guestSession(req: NextRequest) {
  const value = req.cookies.get(cookieName)?.value;
  return value && secretPattern.test(value) ? value : null;
}

export function startGuestSession(req: NextRequest) {
  return guestSession(req) ?? randomBytes(32).toString("hex");
}

export function setGuestSession(response: NextResponse, token: string) {
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/guest-checkout",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function guestBuyerId(token: string) {
  return "guest_" + createHash("sha256").update(token).digest("hex");
}

export function guestOrderId(requestId: string, token: string) {
  return "guest_" + createHmac("sha256", token).update(requestId).digest("hex");
}
