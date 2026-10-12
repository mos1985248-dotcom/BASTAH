// lib/integrations/providers/webhook.ts
// المزوّد الوحيد المنفَّذ: ويب هوك موقَّع (HMAC-SHA256) إلى رابط https تحدده
// الإدارة. يعمل مع أي نظام يستقبل الأحداث (Zapier/Make/n8n/خادم مخصص). النجاح
// = استلام الطرف الآخر للحدث (2xx) — لا ندّعي أن شيئاً نُشر.
// ⚠️ صيغة الإرسال (الترويسات والجسم) ثابتة للتوافق مع من يستقبلها اليوم.

import crypto from "crypto";
import { z } from "zod";
import type { DeliveryResult, IntegrationEnvelope, IntegrationProvider, ProviderDefinition } from "../types";
import { assertSafeOutboundUrl } from "../url-guard";

const TIMEOUT_MS = 10_000;

export const webhookSchema = z.object({
  url: z.string().trim().url("رابط الويب هوك غير صحيح").startsWith("https://", "الرابط يجب أن يبدأ بـ https://"),
  secret: z.string().min(16, "المفتاح السري 16 حرفاً على الأقل").max(200),
});
export type WebhookCredentials = z.infer<typeof webhookSchema>;

export interface WebhookOptions { guard?: (raw: string) => Promise<URL> }

export class WebhookProvider implements IntegrationProvider {
  readonly key = "webhook";
  private readonly guard: (raw: string) => Promise<URL>;

  constructor(private readonly creds: WebhookCredentials, opts: WebhookOptions = {}) {
    this.guard = opts.guard ?? assertSafeOutboundUrl;
  }

  private async post(event: string, storeId: string, data: Record<string, unknown>): Promise<Response> {
    const url = await this.guard(this.creds.url);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const body = JSON.stringify({ event, storeId, sentAt: new Date().toISOString(), data });
    const signature = crypto.createHmac("sha256", this.creds.secret).update(`${timestamp}.${body}`).digest("hex");

    return fetch(url, {
      method: "POST",
      redirect: "manual", // لا نتبع التحويلات — قد تقود لشبكة داخلية
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "Content-Type": "application/json",
        "X-Basita-Event": event,
        "X-Basita-Timestamp": timestamp,
        "X-Basita-Signature": `sha256=${signature}`,
      },
      body,
    });
  }

  async send(envelope: IntegrationEnvelope): Promise<DeliveryResult> {
    try {
      const res = await this.post(envelope.event, envelope.store.id, {
        store: envelope.store,
        links: envelope.accounts.map((a) => ({ platform: a.type, url: a.url })), // اسم الحقل قديم عمداً (توافق)
        source: envelope.source,
        ...envelope.data,
      });
      return res.ok ? { ok: true } : { ok: false, errorMessage: `HTTP ${res.status}` };
    } catch (err) {
      return { ok: false, errorMessage: err instanceof Error && err.message ? err.message : "تعذّر الاتصال" };
    }
  }

  async test(): Promise<boolean> {
    try {
      return (await this.post("connection.test", "platform", {})).ok;
    } catch {
      return false;
    }
  }
}

export const webhookDefinition: ProviderDefinition = {
  key: "webhook",
  label: "ويب هوك موقَّع",
  description: "يرسل الأحداث موقَّعة إلى رابط https (Zapier أو Make أو n8n أو خادمك).",
  settingKey: "marketing_hub", // اسم قديم محفوظ عمداً: لا ترحيل لما هو مخزَّن
  fields: [
    { name: "url", label: "رابط الويب هوك", placeholder: "https://hooks.zapier.com/..." },
    { name: "secret", label: "المفتاح السري (16 حرفاً فأكثر)", secret: true, generate: true },
  ],
  credentialsSchema: webhookSchema,
  assertSafe: async (c: WebhookCredentials) => { await assertSafeOutboundUrl(c.url); },
  summarize: (c: WebhookCredentials) => new URL(c.url).hostname,
  create: (c) => new WebhookProvider(webhookSchema.parse(c)),
};
