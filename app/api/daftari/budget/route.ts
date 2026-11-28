import { NextRequest,NextResponse } from "next/server";
import { requireStoreFeature } from "@/lib/feature-access";
import { AuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { monthRangeUtc } from "@/lib/finance/riyadh";
import { readPlatformSales } from "@/lib/daftari/platform-sales";
const period=z.object({year:z.coerce.number().int().min(2020).max(2100),month:z.coerce.number().int().min(1).max(12)});
const money=z.number().finite().nonnegative().max(10000000).refine(n=>Math.abs(n*100-Math.round(n*100))<0.00001);
const input=period.extend({revenue:money,expenses:money}).strict();
const headers={"Cache-Control":"private, no-store"};
async function access(){const {storeId}=await requireStoreFeature("daftari");await requireStoreFeature("daftari_reports");await requireStoreFeature("daftari_advanced");return storeId;}
function error(e:unknown){return NextResponse.json({error:e instanceof AuthError?e.message:"تعذّر معالجة الموازنة"},{status:e instanceof AuthError?e.status:500,headers});}
export async function GET(req:NextRequest){try{
 const storeId=await access(), p=period.safeParse(Object.fromEntries(req.nextUrl.searchParams));
 if(!p.success)return NextResponse.json({error:"فترة غير صالحة"},{status:400,headers});
 const {start,end}=monthRangeUtc(p.data);
 const [budget,sales]=await Promise.all([prisma.daftariBudget.findUnique({where:{storeId_year_month:{storeId,...p.data}}}),readPlatformSales(prisma,storeId,start,end)]);
 return NextResponse.json({budget:budget?{revenue:Number(budget.revenueMinor)/100,expenses:Number(budget.expensesMinor)/100}:null,actualPlatformNetSales:sales.netSales},{headers});
}catch(e){return error(e)}}
export async function PUT(req:NextRequest){try{
 const storeId=await access(),p=input.safeParse(await req.json().catch(()=>null));
 if(!p.success)return NextResponse.json({error:"بيانات الموازنة غير صالحة"},{status:400,headers});
 const {year,month,revenue,expenses}=p.data;
 const values={revenueMinor:BigInt(Math.round(revenue*100)),expensesMinor:BigInt(Math.round(expenses*100))};
 await prisma.daftariBudget.upsert({where:{storeId_year_month:{storeId,year,month}},create:{storeId,year,month,...values},update:values});
 return NextResponse.json({budget:{revenue,expenses}},{headers});
}catch(e){return error(e)}}
