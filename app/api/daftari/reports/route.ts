import { NextRequest, NextResponse } from "next/server";
import { requireStoreFeature } from "@/lib/feature-access";
import { AuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthRangeUtc, riyadhMonthOf } from "@/lib/finance/riyadh";
import { summarizeDeliveredSales } from "@/lib/daftari/report";
import { z } from "zod";

export async function GET(req: NextRequest) {
 try {
   const {storeId}=await requireStoreFeature("daftari");
   await requireStoreFeature("daftari_reports");
   const now=riyadhMonthOf(new Date());
   const parsed=z.object({year:z.coerce.number().int().min(2020).max(now.year).default(now.year),month:z.coerce.number().int().min(1).max(12).default(now.month)}).safeParse(Object.fromEntries(req.nextUrl.searchParams));
   if(!parsed.success) return NextResponse.json({error:"فترة غير صالحة"},{status:400});
   const {start,end}=monthRangeUtc(parsed.data);
   // Delivered paid orders only. Refunded orders are not included in this product cohort.
   const orders=await prisma.order.findMany({where:{storeId,status:"DELIVERED",paymentStatus:"PAID",deliveredAt:{gte:start,lt:end}},select:{subtotal:true,discountAmount:true,items:{select:{id:true,productId:true,nameAr:true,total:true,quantity:true,daftariCostSnapshot:{select:{productCostMinor:true}}}}},take:5001});
   if(orders.length>5000) return NextResponse.json({error:"الفترة تتجاوز حد التقرير الحالي"},{status:422});
   return NextResponse.json({...summarizeDeliveredSales(orders),period:parsed.data,orders:orders.length},{headers:{"Cache-Control":"private, no-store"}});
 }catch(err){
   if(err instanceof AuthError)return NextResponse.json({error:err.message},{status:err.status});
   return NextResponse.json({error:"تعذّر تحميل التقرير"},{status:500});
 }
}
