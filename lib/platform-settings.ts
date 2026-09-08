// lib/platform-settings.ts
// يستخدم PlatformSetting الموجود أصلاً بالسكيما (كان جدولاً جاهزاً بدون أي
// استخدام فعلي) — بدل أي رقم ثابت مكتوب داخل الكود. لو السطر غير موجود
// بعد بقاعدة البيانات (أول تشغيل)، نرجع القيمة الافتراضية الحالية بدون
// أي كسر — التاجر/الإدارة يقدر يضبطها متى شاء عبر /api/admin/settings.

import { prisma } from "./prisma";

export const SETTINGS_KEYS = {
  BASITA_SHIPPING_FEE: "basita_shipping_fee_sar", // رسوم بسطة التشغيلية فوق سعر شركة الشحن الفعلي
  COD_FEE: "cod_fee_sar", // رسوم الدفع عند الاستلام — منفصلة تماماً عن رسوم التوصيل
} as const;

const DEFAULTS: Record<string, number> = {
  [SETTINGS_KEYS.BASITA_SHIPPING_FEE]: 3,
  [SETTINGS_KEYS.COD_FEE]: 0,
};

export async function getNumericSetting(key: string): Promise<number> {
  const row = await prisma.platformSetting.findUnique({ where: { key } });
  if (!row) return DEFAULTS[key] ?? 0;
  const parsed = Number(row.value);
  return Number.isFinite(parsed) ? parsed : DEFAULTS[key] ?? 0;
}

export async function setNumericSetting(key: string, value: number): Promise<void> {
  await prisma.platformSetting.upsert({
    where: { key },
    create: { key, value: String(value), type: "number" },
    update: { value: String(value) },
  });
}

export async function getBasitaShippingFee(): Promise<number> {
  return getNumericSetting(SETTINGS_KEYS.BASITA_SHIPPING_FEE);
}

/** رسوم COD تُطبَّق فقط لو طريقة الدفع هي الدفع عند الاستلام — صفر لأي طريقة أخرى دائماً */
export async function getCodFee(paymentMethod: string): Promise<number> {
  if (paymentMethod !== "CASH_ON_DELIVERY") return 0;
  return getNumericSetting(SETTINGS_KEYS.COD_FEE);
}
