// lib/finance/settings.ts — إعدادات المركز المالي داخل PlatformSetting الموجود (قيم نصية، بلا جدول جديد).
import { prisma } from "@/lib/prisma";
import type { Tx } from "./tx";
import type { VatMode } from "./types";

export const FIN_KEYS = {
  VAT_MODE: "finance.vat_mode",                       // UNSET | INCLUSIVE | EXCLUDED_FROM_CHARGE
  LOCAL_DIRECT_COST: "finance.local_direct_cost_sar",  // تكلفة مباشرة لكل شحنة محلية (تُثبَّت على الإسناد)
  SHIPMENT_GAP_SHARE: "finance.break_even_shipment_gap_share_pct", // افتراض السيناريو المختلط
} as const;

async function getRaw(db: Tx, key: string): Promise<string | null> {
  return (await db.platformSetting.findUnique({ where: { key } }))?.value ?? null;
}

async function setRaw(db: Tx, key: string, value: string, type: string): Promise<void> {
  await db.platformSetting.upsert({ where: { key }, create: { key, value, type }, update: { value } });
}

export async function getVatMode(db: Tx = prisma): Promise<VatMode> {
  const v = await getRaw(db, FIN_KEYS.VAT_MODE);
  return v === "INCLUSIVE" || v === "EXCLUDED_FROM_CHARGE" ? v : "UNSET";
}
export const setVatMode = (mode: VatMode, db: Tx) => setRaw(db, FIN_KEYS.VAT_MODE, mode, "string");

export async function getLocalDirectCostSar(db: Tx = prisma): Promise<number> {
  const n = Number(await getRaw(db, FIN_KEYS.LOCAL_DIRECT_COST));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
export const setLocalDirectCostSar = (v: number, db: Tx) => setRaw(db, FIN_KEYS.LOCAL_DIRECT_COST, String(v), "number");

export async function getShipmentGapSharePct(db: Tx = prisma): Promise<number> {
  const value = await getRaw(db, FIN_KEYS.SHIPMENT_GAP_SHARE);
  const n = value === null ? 50 : Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : 50;
}
export const setShipmentGapSharePct = (v: number, db: Tx) => setRaw(db, FIN_KEYS.SHIPMENT_GAP_SHARE, String(v), "number");
