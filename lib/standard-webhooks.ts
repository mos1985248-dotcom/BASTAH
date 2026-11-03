// lib/standard-webhooks.ts
// التحقق من توقيع Standard Webhooks الذي يستعمله Supabase Auth Hooks.
// الرؤوس: webhook-id وwebhook-timestamp وwebhook-signature ("v1,<base64>" مفصولة بمسافة).
// السر يأتي بصيغة "v1,whsec_<base64>" ومفتاح HMAC هو الجزء المفكوك من base64 بعد "whsec_".
// التوقيع = base64(HMAC-SHA256(key, `${id}.${timestamp}.${body}`)). نرفض الطلب القديم (> 5 دقائق).

import crypto from "crypto";

const TOLERANCE_SECONDS = 5 * 60;

export function verifyStandardWebhook(rawBody: string, headers: Headers, secret: string): boolean {
  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");
  if (!id || !timestamp || !signatureHeader) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > TOLERANCE_SECONDS) return false;

  const key = Buffer.from(secret.replace(/^v1,whsec_/, "").replace(/^whsec_/, ""), "base64");
  const expected = crypto.createHmac("sha256", key).update(`${id}.${timestamp}.${rawBody}`).digest();

  return signatureHeader.split(" ").some((part) => {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig) return false;
    const received = Buffer.from(sig, "base64");
    return received.length === expected.length && crypto.timingSafeEqual(received, expected);
  });
}
