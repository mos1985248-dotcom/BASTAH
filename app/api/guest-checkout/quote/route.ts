import { NextRequest, NextResponse } from "next/server";
import { guestQuote, guestQuoteSchema } from "@/lib/guest-checkout";
import { CheckoutItemError, ShippingCalcError } from "@/lib/checkout-pricing";

export async function POST(req:NextRequest){
  // Disabled by default until guest ownership, abuse controls and payment are tested.
  if(process.env.GUEST_CHECKOUT_ENABLED!=="true") return NextResponse.json({error:"شراء الزائر غير متاح حالياً"},{status:503});
  try{
    const parsed=guestQuoteSchema.safeParse(await req.json());
    if(!parsed.success)return NextResponse.json({error:"تحقق من بيانات الشحن والمنتج"},{status:400});
    return NextResponse.json(await guestQuote(parsed.data),{headers:{"Cache-Control":"no-store"}});
  }catch(e){
    if(e instanceof CheckoutItemError||e instanceof ShippingCalcError)return NextResponse.json({error:e.message},{status:e.status});
    return NextResponse.json({error:"تعذّر حساب تكلفة الطلب أو طريقة الدفع غير متاحة"},{status:422});
  }
}
