// lib/integrations/routing.ts — دالة نقية (بلا قاعدة بيانات) تدمج التوجيه المحفوظ
// مع الافتراضي وتُسقط أي مزوّد/حدث غير مسجَّل. غياب الإعداد = السلوك الافتراضي
// السابق (كل حدث مفعّل نحو مزوّداته الافتراضية) فلا ينكسر شيء عند أول تشغيل.

import type { EventDefinition, Routing } from "./types";

export function resolveRouting(stored: unknown, events: EventDefinition[], providerKeys: string[]): Routing {
  const raw = stored && typeof stored === "object" ? (stored as Record<string, unknown>) : {};
  const out: Routing = {};
  for (const ev of events) {
    const s = raw[ev.key] && typeof raw[ev.key] === "object" ? (raw[ev.key] as { enabled?: unknown; providers?: unknown }) : {};
    const enabled = typeof s.enabled === "boolean" ? s.enabled : true;
    const list = Array.isArray(s.providers) ? s.providers : ev.defaultProviders;
    const providers = Array.from(new Set(list.filter((p): p is string => typeof p === "string" && providerKeys.includes(p))));
    out[ev.key] = { enabled, providers };
  }
  return out;
}
