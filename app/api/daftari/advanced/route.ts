import { NextResponse } from "next/server";
import { requireStoreFeature } from "@/lib/feature-access";
import { AuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lastMonths,monthRangeUtc,riyadhMonthOf,monthLabel } from "@/lib/finance/riyadh";
import { readPlatformSales } from "@/lib/daftari/platform-sales";
export async function GET(){
 try{
  const {storeId}=await requireStoreFeature("daftari");
  await requireStoreFeature("daftari_reports");
  await requireStoreFeature("daftari_advanced");
  const months=await Promise.all(lastMonths(riyadhMonthOf(new Date()),6).map(async period=>{
   const {start,end}=monthRangeUtc(period);
   return {period:monthLabel(period),...await readPlatformSales(prisma,storeId,start,end)};
  }));
  return NextResponse.json({months},{headers:{"Cache-Control":"private, no-store"}});
 }catch(e){if(e instanceof AuthError)return NextResponse.json({error:e.message},{status:e.status});return NextResponse.json({error:"تعذّر تحميل المقارنة"},{status:500});}
}
