import { prisma } from "@/lib/prisma";
import { z } from "zod";
export const CITY_PREFIX = "bastah_shipping_city_";
export const citySchema = z.object({ name: z.string().min(2), isActive: z.boolean(), flatFee: z.number().finite().min(0).max(100000), perKgFee: z.number().finite().min(0).max(100000) });
export function normalizeCity(value: string) {
  return value.trim().replace(/[\u064B-\u065F\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/\s+/g, " ");
}
export async function listBastahCities() {
  const rows = await prisma.platformSetting.findMany({ where: { key: { startsWith: CITY_PREFIX } }, select: { key: true, value: true } });
  return rows.map(row => {
    const city = citySchema.parse(JSON.parse(row.value));
    return { key: row.key, ...city };
  }).sort((a,b) => a.name.localeCompare(b.name, "ar"));
}
export async function findBastahCity(name: string) {
  return (await listBastahCities()).find(c => normalizeCity(c.name) === normalizeCity(name));
}
