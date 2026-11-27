import { z } from "zod";
import { normalizeSaudiMobile } from "./phone";
import { checkoutBaseSchema } from "./validation";
import { prisma } from "./prisma";
import { resolveCheckoutItems, computeShippingCost } from "./checkout-pricing";
import { checkoutTotals } from "./checkout-coupon";
import { getCodFee } from "./platform-settings";

export const guestQuoteSchema = checkoutBaseSchema.pick({storeId:true,items:true}).extend({
  name:z.string().trim().min(2).max(100),
  phone:z.string().max(30).transform(v=>normalizeSaudiMobile(v)).refine(v=>v!==null,"رقم الجوال السعودي غير صالح"),
  city:z.string().trim().min(2).max(100),
  region:z.string().trim().min(2).max(100),
  address:z.string().trim().min(5).max(300),
  paymentMethod:z.enum(["CREDIT_CARD","CASH_ON_DELIVERY","BANK_TRANSFER"]),
});

export async function guestQuote(data:z.infer<typeof guestQuoteSchema>){
  const sub=await prisma.storeSubscription.findUnique({where:{storeId:data.storeId},include:{store:{select:{status:true}}}});
  if(!sub||sub.store.status!=="ACTIVE"||sub.status==="SUSPENDED") throw new Error("المتجر غير متاح حالياً");
  if(data.paymentMethod==="CREDIT_CARD"&&!sub.merchantMoyasarSecretKeyEnc) throw new Error("الدفع الإلكتروني غير متاح");
  if(data.paymentMethod==="BANK_TRANSFER"&&!sub.bankTransferEnabled) throw new Error("التحويل البنكي غير متاح");
  const {resolved}=await resolveCheckoutItems(data.storeId,data.items);
  const subtotal=resolved.reduce((sum,i)=>sum+i.unitPrice*i.quantity,0);
  const {shippingCost}=await computeShippingCost(data.storeId,resolved,data,subtotal);
  return checkoutTotals(subtotal,0,shippingCost,await getCodFee(data.paymentMethod),sub.hasTaxNumber,data.paymentMethod);
}
