// lib/integrations/admin-service.ts — عمليات لوحة الإدارة. المسارات (routes) تتولى
// الصلاحيات والتدقيق فقط؛ المنطق والتحقق هنا ليخدم المسار الجديد والمسار القديم نفسه.

import { prisma } from "@/lib/prisma";
import { ACCOUNT_TYPES } from "./account-types";
import { EVENT_CATALOG, getEvent } from "./catalog";
import {
  deleteProviderCredentials, getDisabledAccountTypes, getProviderCredentials, getProviderStatus, getRouting,
  saveDisabledAccountTypes, saveProviderCredentials, saveProviderTestResult, saveRouting,
} from "./config";
import { getProviderDef, listProviderDefs } from "./registry";
import type { Routing } from "./types";

export type Fail = { ok: false; status: number; error: string };
const fail = (status: number, error: string): Fail => ({ ok: false, status, error });

export async function saveProvider(key: string, body: unknown): Promise<{ ok: true; summary: string } | Fail> {
  const def = getProviderDef(key);
  if (!def) return fail(404, "المزوّد غير موجود");
  const parsed = def.credentialsSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.issues[0]?.message ?? "بيانات غير صحيحة");
  try {
    await def.assertSafe?.(parsed.data as never);
  } catch (e) {
    return fail(400, e instanceof Error ? e.message : "بيانات غير آمنة");
  }
  await saveProviderCredentials(def, parsed.data);
  return { ok: true, summary: def.summarize(parsed.data as never) };
}

export async function removeProvider(key: string): Promise<{ ok: true } | Fail> {
  const def = getProviderDef(key);
  if (!def) return fail(404, "المزوّد غير موجود");
  await deleteProviderCredentials(def);
  return { ok: true };
}

export async function testProvider(key: string): Promise<{ ok: true; passed: boolean } | Fail> {
  const def = getProviderDef(key);
  if (!def) return fail(404, "المزوّد غير موجود");
  const creds = await getProviderCredentials(def);
  if (!creds) return fail(404, "لم تُضبط بيانات هذا المزوّد بعد");
  let passed = false;
  try { passed = await def.create(creds).test(); } catch { passed = false; }
  await saveProviderTestResult(def, passed);
  return { ok: true, passed };
}

export interface SettingsPatch {
  routing?: Record<string, { enabled: boolean; providers: string[] }>;
  disabledAccountTypes?: string[];
}

/** يتحقق: أنواع الأحداث من الكتالوج فقط، والمزوّدون من السجل فقط، وأنواع الحسابات من الكتالوج فقط */
export async function applySettings(patch: SettingsPatch): Promise<{ ok: true } | Fail> {
  if (patch.routing) {
    for (const [eventKey, r] of Object.entries(patch.routing)) {
      if (!getEvent(eventKey)) return fail(400, "نوع حدث غير مسموح");
      if (r.providers.some((p) => !getProviderDef(p))) return fail(400, "مزوّد غير مسجَّل");
    }
  }
  if (patch.disabledAccountTypes && patch.disabledAccountTypes.some((k) => !ACCOUNT_TYPES.some((t) => t.key === k))) {
    return fail(400, "نوع حساب غير معروف");
  }
  if (patch.routing) await saveRouting(patch.routing as Routing);
  if (patch.disabledAccountTypes) await saveDisabledAccountTypes(patch.disabledAccountTypes);
  return { ok: true };
}

export async function getAdminOverview() {
  const [routing, disabled, byType, byStore] = await Promise.all([
    getRouting(),
    getDisabledAccountTypes(),
    prisma.storeMarketingLink.groupBy({ by: ["platform"], _count: { _all: true } }),
    prisma.storeMarketingLink.groupBy({ by: ["storeId"] }),
  ]);
  const counts = new Map(byType.map((r) => [r.platform, r._count._all]));

  const providers = await Promise.all(
    listProviderDefs().map(async (def) => ({
      key: def.key, label: def.label, description: def.description, fields: def.fields, ...(await getProviderStatus(def)),
    })),
  );

  return {
    providers,
    events: EVENT_CATALOG.map((ev) => ({
      key: ev.key, label: ev.label, description: ev.description,
      enabled: routing[ev.key].enabled, providers: routing[ev.key].providers,
    })),
    accountTypes: ACCOUNT_TYPES.map((t) => ({ key: t.key, label: t.label, enabled: !disabled.includes(t.key), links: counts.get(t.key) ?? 0 })),
    stats: { linkedStores: byStore.length, links: byType.reduce((n, r) => n + r._count._all, 0) },
  };
}
