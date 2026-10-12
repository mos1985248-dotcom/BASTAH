// lib/integrations/engine.ts — تركيب المحرك مع قاعدة البيانات. مصادر الأحداث
// تستورد من هنا emitIntegrationEvent فقط.

import { prisma } from "@/lib/prisma";
import { createEngine, type EngineDeps } from "./engine-core";
import { getDisabledAccountTypes, getProviderCredentials, getRouting } from "./config";
import { getProviderDef } from "./registry";
import type { IntegrationProvider } from "./types";

/** يبني المزوّد من بيانات الإدارة المخزَّنة؛ null إن لم يُسجَّل أو لم تُضبط بياناته */
export async function resolveConfiguredProvider(key: string): Promise<IntegrationProvider | null> {
  const def = getProviderDef(key);
  if (!def) return null;
  const creds = await getProviderCredentials(def);
  if (!creds) return null;
  try {
    return def.create(creds);
  } catch {
    return null;
  }
}

const deps: EngineDeps = {
  getRouting,
  resolveProvider: resolveConfiguredProvider,
  async getStoreContext(storeId) {
    // العزل: كل الاستعلامات مقيّدة بـstoreId الممرَّر من الخادم (لا من العميل)
    const [store, links, disabled] = await Promise.all([
      prisma.store.findUnique({ where: { id: storeId }, select: { id: true, nameAr: true, slug: true } }),
      prisma.storeMarketingLink.findMany({ where: { storeId }, select: { platform: true, url: true } }),
      getDisabledAccountTypes(),
    ]);
    if (!store) return null;
    return {
      store: { id: store.id, name: store.nameAr, slug: store.slug },
      accounts: links.filter((l) => !disabled.includes(l.platform)).map((l) => ({ type: l.platform, url: l.url })),
    };
  },
};

export const emitIntegrationEvent = createEngine(deps).emit;
