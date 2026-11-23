import { createSign } from "node:crypto";

let cached: { token: string; expiresAt: number } | undefined;

export async function googleVerifierToken(): Promise<string | null> {
  const accountJson = process.env.MUNIRA_GOOGLE_VERIFIER_ACCOUNT;
  if (!accountJson) return null;
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  try {
    const account = JSON.parse(accountJson);
    if (typeof account.client_email !== "string" || typeof account.private_key !== "string") return null;
    const tokenEndpoint = "https://oauth2.googleapis.com/token";
    const now = Math.floor(Date.now() / 1000);
    const encode = (data: object) => Buffer.from(JSON.stringify(data)).toString("base64url");
    const claim = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
      iss: account.client_email, scope: "https://www.googleapis.com/auth/cloud-platform.read-only",
      aud: tokenEndpoint, iat: now, exp: now + 900,
    })}`;
    const signature = createSign("RSA-SHA256").update(claim).sign(account.private_key).toString("base64url");
    const response = await fetch(tokenEndpoint, {
      method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(4000),
      body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${claim}.${signature}` }),
    });
    if (!response.ok) return null;
    const { access_token: token, expires_in: seconds } = await response.json();
    if (typeof token !== "string" || typeof seconds !== "number" || seconds <= 0) return null;
    cached = { token, expiresAt: Date.now() + seconds * 1000 };
    return token;
  } catch {
    return null;
  }
}
