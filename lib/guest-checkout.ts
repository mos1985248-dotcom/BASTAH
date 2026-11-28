import { z } from "zod";
import { normalizeSaudiMobile } from "./phone";
import { checkoutBaseSchema } from "./validation";
import { prisma } from "./prisma";
import { resolveCheckoutItems, computeShippingCost, CheckoutItemError } from "./checkout-pricing";
import { checkoutTotals } from "./checkout-coupon";
import { getCodFee } from "./platform-settings";

export const guestQuoteSchema = checkoutBaseSchema.pick({storeId:true,items:true}).extend({
  name:z.string().trim().min(2).max(100),
  phone:z.string().max(30).transform(v=>normalizeSaudiMobile(v)).refine(v=>v!==null,"رقم الجوال السعودي غير صالح"),
  city:z.string().trim().min(2).max(100),
  region:z.string().trim().min(2).max(100),
  address:z.string().trim().min(5).max(300),
  paymentMethod: z.literal("CASH_ON_DELIVERY"),
});

export async function guestQuote(data: z.infer<typeof guestQuoteSchema>) {
  const sub = await prisma.storeSubscription.findUnique({
    where: { storeId: data.storeId },
    select: { status: true, hasTaxNumber: true, store: { select: { status: true } } },
  });
  if (!sub || sub.store.status !== "ACTIVE" || sub.status === "SUSPENDED") {
    throw new CheckoutItemError("المتجر غير متاح حالياً", 422);
  }
  const { resolved, productNames } = await resolveCheckoutItems(data.storeId, data.items);
  const subtotal = resolved.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const { shippingCost, shippingRateLogId } = await computeShippingCost(data.storeId, resolved, data, subtotal);
  const codFee = await getCodFee(data.paymentMethod);
  const totals = checkoutTotals(subtotal, 0, shippingCost, codFee, sub.hasTaxNumber, data.paymentMethod);
  return { totals, resolved, productNames, shippingRateLogId };
}
