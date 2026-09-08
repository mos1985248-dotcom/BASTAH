// lib/shipping/registry.ts
// نقطة التوسعة الوحيدة لإضافة شركة شحن جديدة: نفّذي ShippingProvider في
// ملف جديد تحت providers/، أضيفي القيمة في enum ShippingCarrier بالـ
// schema، وسطر واحد هنا. بدون لمس أي route أو منطق آخر إطلاقاً.

import type { ShippingCarrier } from "@prisma/client";
import type { ShippingProvider } from "./types";
import { AramexProvider } from "./providers/aramex";
import { SplProvider } from "./providers/spl";

const providers: Record<ShippingCarrier, ShippingProvider> = {
  ARAMEX: new AramexProvider(),
  SPL: new SplProvider(),
};

export function getShippingProvider(carrier: ShippingCarrier): ShippingProvider {
  const provider = providers[carrier];
  if (!provider) {
    throw new Error(`لا يوجد مزوّد مسجَّل لشركة الشحن: ${carrier}`);
  }
  return provider;
}

export function listSupportedCarriers(): ShippingCarrier[] {
  return Object.keys(providers) as ShippingCarrier[];
}
