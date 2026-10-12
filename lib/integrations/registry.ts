// lib/integrations/registry.ts — Provider Registry. إضافة مزوّد = ملف تحت
// providers/ يصدّر ProviderDefinition + سطر واحد هنا. لا تعديل في المحرك ولا الواجهات.

import type { ProviderDefinition } from "./types";
import { webhookDefinition } from "./providers/webhook";

const PROVIDERS: Record<string, ProviderDefinition> = {
  [webhookDefinition.key]: webhookDefinition,
};

export function getProviderDef(key: string): ProviderDefinition | undefined {
  return Object.prototype.hasOwnProperty.call(PROVIDERS, key) ? PROVIDERS[key] : undefined;
}

export function listProviderDefs(): ProviderDefinition[] {
  return Object.values(PROVIDERS);
}

export function providerKeys(): string[] {
  return Object.keys(PROVIDERS);
}
