import { NextRequest, NextResponse } from "next/server";
import { requireStoreFeature } from "@/lib/feature-access";
import { AuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthRangeUtc, riyadhMonthOf } from "@/lib/finance/riyadh";
import { summarizeDeliveredSales } from "@/lib/daftari/report";
import { toCsv } from "@/lib/finance/csv";
import { monthLabel } from "@/lib/finance/riyadh";
import { z } from "zod";

export async function GET(req: NextRequest) {
 try {
   const {storeId}=await requireStoreFeature("daftari");
   await requireStoreFeature("daftari_reports");
   const now=riyadhMonthOf(new Date());
   const parsed=z.object({year:z.coerce.number().int().min(2020).max(now.year).default(now.year),month:z.coerce.number().int().min(1).max(12).default(now.month),format:z.enum(["json","csv"]).default("json")}).safeParse(Object.fromEntries(req.nextUrl.searchParams));
   if(!parsed.success) return NextResponse.json({error:"فترة غير صالحة"},{status:400});
   const period={year:parsed.data.year,month:parsed.data.month};
   if(monthLabel(period)>monthLabel(now))return NextResponse.json({error:"الفترة مستقبلية"},{status:400});
   const {start,end}=monthRangeUtc(period);
   // Delivered paid orders only. Refunded orders are not included in this product cohort.
   const orders=await prisma.order.findMany({where:{storeId,status:"DELIVERED",paymentStatus:"PAID",deliveredAt:{gte:start,lt:end}},select:{subtotal:true,discountAmount:true,items:{select:{id:true,productId:true,nameAr:true,total:true,quantity:true,daftariCostSnapshot:{select:{productCostMinor:true}}}}},take:5001});
   if(orders.length>5000) return NextResponse.json({error:"الفترة تتجاوز حد التقرير الحالي"},{status:422});
   const report=summarizeDeliveredSales(orders);
   if(parsed.data.format==="csv"){
     const csv=toCsv(["الفترة","المنتج — الطلبات المسلّمة غير المستردة","الكمية","الإيراد (ر.س)","التكلفة المعروفة (ر.س)","مجمل الربح التقديري (ر.س)","بنود مجهولة التكلفة"],report.products.map(p=>[monthLabel(period),p.name,p.units,{sar:p.revenueMinor},{sar:p.knownCostMinor},p.grossProfitMinor===null?null:{sar:p.grossProfitMinor},p.missingLines]));
     return new NextResponse(csv,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="daftari-${monthLabel(period)}.csv"`,"Cache-Control":"private, no-store"}});
   }
   return NextResponse.json({...report,period,orders:orders.length},{headers:{"Cache-Control":"private, no-store"}});
 }catch(err){
   if(err instanceof AuthError)return NextResponse.json({error:err.message},{status:err.status});
   return NextResponse.json({error:"تعذّر تحميل التقرير"},{status:500});
 }
}
