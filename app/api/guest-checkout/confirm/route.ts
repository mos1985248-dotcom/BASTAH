import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guestQuoteSchema } from "@/lib/guest-checkout";
import { resolveCheckoutItems, computeShippingCost, CheckoutItemError, ShippingCalcError } from "@/lib/checkout-pricing";
import { checkoutTotals } from "@/lib/checkout-coupon";
import { getCodFee } from "@/lib/platform-settings";
import { reserveStock, InsufficientStockError } from "@/lib/inventory";
import { snapshotCodShare } from "@/lib/finance/snapshots";
import { authRateLimit, checkRateLimit } from "@/lib/rate-limit";

// First isolated implementation: COD only. Never grants a normal user session.
const schema=guestQuoteSchema.extend({paymentMethod:z.literal("CASH_ON_DELIVERY"),requestId:z.string().uuid(),expectedTotal:z.number().finite().nonnegative()});
export async function POST(req:NextRequest){
 if(process.env.GUEST_CHECKOUT_ENABLED!=="true"||!authRateLimit)return NextResponse.json({error:"شراء الزائر غير متاح حالياً"},{status:503});
 if(req.headers.get("origin")!==req.nextUrl.origin)return NextResponse.json({error:"طلب غير صالح"},{status:403});
 try{
  const parsed=schema.safeParse(await req.json());
  if(!parsed.success)return NextResponse.json({error:"تحقق من بيانات الطلب"},{status:400});
  const d=parsed.data;
  if(!d.phone)return NextResponse.json({error:"رقم الجوال غير صالح"},{status:400});
  const phone=d.phone;
  const ip=req.headers.get("x-forwarded-for")?.split(",")[0].trim()??"unknown";
  const limit=await checkRateLimit(authRateLimit,"guest-order:"+ip);
  const phoneLimit=await checkRateLimit(authRateLimit,"guest-phone:"+createHash("sha256").update(phone).digest("hex"));
  if(!limit.allowed||!phoneLimit.allowed)return NextResponse.json({error:"محاولات كثيرة، حاول لاحقاً"},{status:429});
  // Separate opaque credential, never looked up by unverified phone.
  const token=randomBytes(32).toString("hex");
  const buyerId="guest_"+createHash("sha256").update(token).digest("hex");
  const orderId="guest_"+createHash("sha256").update(d.requestId).digest("hex");
  const sub=await prisma.storeSubscription.findUnique({where:{storeId:d.storeId},include:{store:{select:{status:true}}}});
  if(!sub||sub.status==="SUSPENDED"||sub.store.status!=="ACTIVE")return NextResponse.json({error:"المتجر غير متاح"},{status:422});
  const {resolved,productNames}=await resolveCheckoutItems(d.storeId,d.items);
  const subtotal=resolved.reduce((sum,i)=>sum+i.unitPrice*i.quantity,0);
  const {shippingCost,shippingRateLogId}=await computeShippingCost(d.storeId,resolved,d,subtotal);
  const codFee=await getCodFee(d.paymentMethod);
  const totals=checkoutTotals(subtotal,0,shippingCost,codFee,sub.hasTaxNumber,d.paymentMethod);
  if(Math.round(totals.total*100)!==Math.round(d.expectedTotal*100))return NextResponse.json({error:"تغيّر الإجمالي، أعد حساب التكلفة"},{status:409});
  const order=await prisma.$transaction(async tx=>{
   await tx.user.create({data:{id:buyerId,name:d.name,role:"BUYER",isActive:false,isVerified:false}});
   await reserveStock(tx,resolved,productNames);
   const created=await tx.order.create({data:{id:orderId,orderNumber:"BS-G-"+randomBytes(8).toString("hex").toUpperCase(),buyerId,storeId:d.storeId,paymentMethod:"CASH_ON_DELIVERY",fulfillmentMethod:"SHIPPING",...totals,shippingName:d.name,shippingPhone:phone,shippingCity:d.city,shippingRegion:d.region,shippingAddress:d.address,items:{create:resolved.map(i=>({productId:i.productId,variantId:i.variantId,nameAr:i.nameAr,price:i.unitPrice,quantity:i.quantity,total:i.unitPrice*i.quantity}))},statusHistory:{create:{status:"PENDING",note:"طلب زائر — الدفع عند الاستلام"}}},select:{id:true,orderNumber:true,total:true}});
   if(shippingRateLogId){
    const rate=await tx.shippingRate.update({where:{id:shippingRateLogId},data:{orderId:created.id}});
    if(codFee>0)await snapshotCodShare(tx,created.id,String(rate.carrier));
   }
   return created;
  });
  const response=NextResponse.json({orderId:order.id,orderNumber:order.orderNumber,total:order.total},{status:201,headers:{"Cache-Control":"no-store"}});
  response.cookies.set("bastah_guest_"+order.id.slice(-24),token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/api/guest-checkout",maxAge:60*60*24*30});
  return response;
 }catch(e){
  if(e instanceof CheckoutItemError||e instanceof ShippingCalcError)return NextResponse.json({error:e.message},{status:e.status});
  if(e instanceof InsufficientStockError)return NextResponse.json({error:e.message},{status:409});
  if(typeof e==="object"&&e!==null&&"code" in e&&e.code==="P2002")return NextResponse.json({error:"تم تسجيل طلب بهذه المحاولة، لا تكرر الإرسال"},{status:409});
  return NextResponse.json({error:"تعذّر إنشاء الطلب"},{status:500});
 }
}
