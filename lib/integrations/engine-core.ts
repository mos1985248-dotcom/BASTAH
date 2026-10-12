// lib/integrations/engine-core.ts
// محرك التكاملات: يستقبل حدثاً من أي مصدر ويقرر هل يُرسل وإلى من. نقي (حقن
// اعتماديات) فيُختبر بلا قاعدة بيانات. لا يعرف شيئاً عن مصدر الحدث ولا عن
// طريقة تسليم المزوّد.
//
// ترتيب الفحوص: نوع مسموح ← حدث مفعّل من الإدارة ← حجم الحمولة ← مزوّد جاهز
// ← حساب خارجي للمتجر (إن اشترطه الحدث). أي فحص يفشل = لا إرسال.

import { getEvent } from "./catalog";
import type { IntegrationEnvelope, IntegrationProvider, Routing } from "./types";

export const MAX_PAYLOAD_BYTES = 64_000;

export interface StoreContext {
  store: { id: string; name: string; slug: string };
  accounts: { type: string; url: string }[];
}

export interface EngineDeps {
  getRouting(): Promise<Routing>;
  /** حسابات المتجر بأنواع مفعَّلة فقط — العزل بين المتاجر مسؤولية التنفيذ هنا (حسب storeId) */
  getStoreContext(storeId: string): Promise<StoreContext | null>;
  /** null = المزوّد غير مسجَّل أو لم تُضبط بياناته */
  resolveProvider(key: string): Promise<IntegrationProvider | null>;
}

export interface EmitInput { type: string; source: string; storeId: string; data: Record<string, unknown> }

export type SkipReason = "unknown_event" | "event_disabled" | "payload_too_large" | "no_provider" | "no_accounts";
export interface EmitOutcome {
  status: "delivered" | "partial" | "failed" | "skipped";
  reason?: SkipReason;
  results: { provider: string; ok: boolean; errorMessage?: string }[];
}

const skipped = (reason: SkipReason): EmitOutcome => ({ status: "skipped", reason, results: [] });

export function createEngine(deps: EngineDeps) {
  async function emit(input: EmitInput): Promise<EmitOutcome> {
    try {
      const def = getEvent(input.type);
      if (!def) return skipped("unknown_event");

      const route = (await deps.getRouting())[def.key];
      if (!route || !route.enabled) return skipped("event_disabled");

      if (Buffer.byteLength(JSON.stringify(input.data), "utf8") > MAX_PAYLOAD_BYTES) return skipped("payload_too_large");

      const resolved = await Promise.all(route.providers.map((k) => deps.resolveProvider(k)));
      const providers = resolved.filter((p): p is IntegrationProvider => p !== null);
      if (providers.length === 0) return skipped("no_provider");

      const ctx = await deps.getStoreContext(input.storeId);
      if (!ctx || (def.requiresStoreAccount && ctx.accounts.length === 0)) return skipped("no_accounts");

      const envelope: IntegrationEnvelope = { event: def.key, source: input.source, store: ctx.store, accounts: ctx.accounts, data: input.data };
      const results = await Promise.all(
        providers.map(async (p) => {
          try {
            return { provider: p.key, ...(await p.send(envelope)) };
          } catch (err) {
            return { provider: p.key, ok: false, errorMessage: err instanceof Error ? err.message : "خطأ غير معروف" };
          }
        }),
      );
      const okCount = results.filter((r) => r.ok).length;
      return { status: okCount === results.length ? "delivered" : okCount > 0 ? "partial" : "failed", results };
    } catch (err) {
      // لا يرمي أبداً: فشل التكاملات لا يجوز أن يكسر مصدر الحدث (إتمام شراء، كرون...)
      return { status: "failed", results: [{ provider: "engine", ok: false, errorMessage: err instanceof Error ? err.message : "خطأ غير معروف" }] };
    }
  }
  return { emit };
}
