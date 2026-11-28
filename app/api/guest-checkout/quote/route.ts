import { NextRequest, NextResponse } from "next/server";
import { guestQuote, guestQuoteSchema } from "@/lib/guest-checkout";
import { CheckoutItemError, ShippingCalcError } from "@/lib/checkout-pricing";

import { apiRateLimit, checkRateLimit } from "@/lib/rate-limit";
import { setGuestSession, startGuestSession } from "@/lib/guest-order-session";

export async function POST(req:NextRequest){
  // Disabled by default until guest ownership, abuse controls and payment are tested.
  if(process.env.GUEST_CHECKOUT_ENABLED !== "true" || !apiRateLimit) return NextResponse.json({error:"شراء الزائر غير متاح حالياً"},{status:503});
  if (req.headers.get("origin") !== req.nextUrl.origin) return NextResponse.json({ error: "طلب غير صالح" }, { status: 403 });
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const limit = await checkRateLimit(apiRateLimit, "guest-quote:" + ip);
    if (!limit.allowed) return NextResponse.json({ error: "محاولات كثيرة، حاول لاحقاً" }, { status: 429 });
    const parsed=guestQuoteSchema.safeParse(await req.json());
    if(!parsed.success)return NextResponse.json({error:"تحقق من بيانات الشحن والمنتج"},{status:400});
    const { totals } = await guestQuote(parsed.data);
    const response = NextResponse.json(totals, { headers: { "Cache-Control": "no-store" } });
    setGuestSession(response, startGuestSession(req));
    return response;
  }catch(e){
    if(e instanceof CheckoutItemError||e instanceof ShippingCalcError)return NextResponse.json({error:e.message},{status:e.status});
    return NextResponse.json({error:"تعذّر حساب تكلفة الطلب أو طريقة الدفع غير متاحة"},{status:422});
  }
}
