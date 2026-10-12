// lib/integrations/config.ts
// إعدادات الإدارة فوق PlatformSetting الموجود (بلا جداول جديدة):
//   <settingKey>           بيانات اعتماد المزوّد مشفّرة AES-256-GCM (webhook = "marketing_hub")
//   <settingKey>_status    نتيجة آخر اختبار اتصال
//   integrations_routing   توجيه الأحداث (JSON)
//   integrations_disabled_account_types   أنواع الحسابات التي عطّلتها الإدارة (JSON)
// أسرار المزوّدين لا تغادر هذا الملف إلا إلى التنفيذ الداخلي — لا تُعاد لأي واجهة.

import { prisma } from "@/lib/prisma";
import { encryptSecret, decryptSecret } from "@/lib/crypto";
import { EVENT_CATALOG } from "./catalog";
import { ACCOUNT_TYPES } from "./account-types";
import { providerKeys } from "./registry";
import { resolveRouting } from "./routing";
import type { ProviderDefinition, Routing } from "./types";

const ROUTING_KEY = "integrations_routing";
const DISABLED_TYPES_KEY = "integrations_disabled_account_types";

async function readJson(key: string): Promise<unknown> {
  const row = await prisma.platformSetting.findUnique({ where: { key } });
  if (!row) return null;
  try { return JSON.parse(row.value); } catch { return null; }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  const text = JSON.stringify(value);
  await prisma.platformSetting.upsert({ where: { key }, create: { key, value: text, type: "json" }, update: { value: text } });
}

// ── بيانات اعتماد المزوّد ──────────────────────────────────────────

export async function getProviderCredentials(def: ProviderDefinition): Promise<unknown | null> {
  const row = await prisma.platformSetting.findUnique({ where: { key: def.settingKey } });
  if (!row) return null;
  try {
    const parsed = def.credentialsSchema.safeParse(JSON.parse(decryptSecret(row.value)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null; // مفتاح التشفير تغيّر أو بيانات تالفة — نعاملها كغير مُعدّة
  }
}

export async function saveProviderCredentials(def: ProviderDefinition, credentials: unknown): Promise<void> {
  const value = encryptSecret(JSON.stringify(credentials));
  await prisma.platformSetting.upsert({ where: { key: def.settingKey }, create: { key: def.settingKey, value, type: "string" }, update: { value } });
  await prisma.platformSetting.deleteMany({ where: { key: `${def.settingKey}_status` } }); // اختبار قديم لا ينطبق على بيانات جديدة
}

export async function deleteProviderCredentials(def: ProviderDefinition): Promise<void> {
  await prisma.platformSetting.deleteMany({ where: { key: { in: [def.settingKey, `${def.settingKey}_status`] } } });
}

export async function saveProviderTestResult(def: ProviderDefinition, ok: boolean): Promise<void> {
  await writeJson(`${def.settingKey}_status`, { at: new Date().toISOString(), ok });
}

export interface ProviderStatus { configured: boolean; summary: string | null; lastTestedAt: string | null; lastTestOk: boolean | null }

export async function getProviderStatus(def: ProviderDefinition): Promise<ProviderStatus> {
  const creds = await getProviderCredentials(def);
  if (!creds) return { configured: false, summary: null, lastTestedAt: null, lastTestOk: null };
  let summary: string | null = null;
  try { summary = def.summarize(creds as never); } catch { /* بيانات غريبة: نعرض بلا وصف */ }
  const test = (await readJson(`${def.settingKey}_status`)) as { at?: string; ok?: boolean } | null;
  return { configured: true, summary, lastTestedAt: test?.at ?? null, lastTestOk: typeof test?.ok === "boolean" ? test.ok : null };
}

// ── التوجيه وأنواع الحسابات ────────────────────────────────────────

export async function getRouting(): Promise<Routing> {
  return resolveRouting(await readJson(ROUTING_KEY), EVENT_CATALOG, providerKeys());
}

/** يدمج تعديلاً جزئياً فوق التوجيه الحالي؛ التحقق من الأنواع والمزوّدين مسؤولية المستدعي (admin-service) */
export async function saveRouting(patch: Routing): Promise<void> {
  await writeJson(ROUTING_KEY, { ...(await getRouting()), ...patch });
}

export async function getDisabledAccountTypes(): Promise<string[]> {
  const raw = await readJson(DISABLED_TYPES_KEY);
  const known = ACCOUNT_TYPES.map((t) => t.key);
  return Array.isArray(raw) ? raw.filter((k): k is string => typeof k === "string" && known.includes(k)) : [];
}

export async function saveDisabledAccountTypes(keys: string[]): Promise<void> {
  await writeJson(DISABLED_TYPES_KEY, Array.from(new Set(keys)));
}
