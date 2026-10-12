// lib/integrations/merchant-view.ts — ما يراه التاجر: أنواع الحسابات التي فعّلتها
// الإدارة، وحساباته المربوطة، والخدمات الجاهزة فعلاً. لا مزوّدين ولا أسرار.

import { prisma } from "@/lib/prisma";
import { ACCOUNT_TYPES } from "./account-types";
import { EVENT_CATALOG } from "./catalog";
import { getDisabledAccountTypes, getRouting } from "./config";
import { resolveConfiguredProvider } from "./engine";

export async function getMerchantView(storeId: string) {
  const [disabled, routing, links] = await Promise.all([
    getDisabledAccountTypes(),
    getRouting(),
    prisma.storeMarketingLink.findMany({ where: { storeId }, select: { platform: true, url: true } }),
  ]);

  const accountTypes = ACCOUNT_TYPES.filter((t) => !disabled.includes(t.key)).map(({ key, label, example }) => ({ key, label, example }));
  const enabledKeys = new Set(accountTypes.map((t) => t.key));

  // «خدمة جاهزة» = حدث مفعّل من الإدارة وله مزوّد واحد على الأقل مضبوط فعلاً
  const services: { key: string; label: string; description: string }[] = [];
  for (const ev of EVENT_CATALOG) {
    const r = routing[ev.key];
    if (!r?.enabled) continue;
    const ready = (await Promise.all(r.providers.map(resolveConfiguredProvider))).some((p) => p !== null);
    if (ready) services.push({ key: ev.key, label: ev.label, description: ev.description });
  }

  return {
    links: links.filter((l) => enabledKeys.has(l.platform)),
    platforms: accountTypes, // الاسم قديم محفوظ للتوافق
    services,
    hubReady: services.length > 0, // الاسم قديم محفوظ للتوافق
  };
}
