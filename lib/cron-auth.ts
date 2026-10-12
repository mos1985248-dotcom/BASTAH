// lib/cron-auth.ts — نفس آلية subscription-lifecycle: Bearer (Vercel Cron) أو x-cron-secret
import crypto from "crypto";
import type { NextRequest } from "next/server";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a), bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export function isCronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const bearer = req.headers.get("authorization");
  if (bearer && safeEqual(bearer, `Bearer ${secret}`)) return true;
  const custom = req.headers.get("x-cron-secret");
  return !!custom && safeEqual(custom, secret);
}
