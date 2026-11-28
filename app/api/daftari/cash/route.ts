import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError } from "@/lib/auth";
import { requireStoreFeature } from "@/lib/feature-access";
import { monthRangeUtc,riyadhMonthOf } from "@/lib/finance/riyadh";
import { cashCategories,cashDate,summarizeCash } from "@/lib/daftari/cash";
import { z } from "zod";
const headers={"Cache-Control":"private, no-store"};
const input=z.object({requestId:z.string().uuid(),direction:z.enum(["IN","OUT"]),category:z.string().max(40),amount:z.number().finite().positive().max(10000000).refine(n=>Math.abs(n*100-Math.round(n*100))<0.00001),date:z.string(),description:z.string().trim().max(200).optional()}).strict().refine(v=>(cashCategories[v.direction] as readonly string[]).includes(v.category));
async function access(){const {storeId}=await requireStoreFeature("daftari");await requireStoreFeature("daftari_reports");await requireStoreFeature("daftari_advanced");return storeId;}
function fail(e:unknown){return NextResponse.json({error:e instanceof AuthError?e.message:"تعذّر معالجة السجل النقدي"},{status:e instanceof AuthError?e.status:500,headers});}
export async function GET(req:NextRequest){try{
 const storeId=await access(),now=riyadhMonthOf(new Date());
 const p=z.object({year:z.coerce.number().int().min(2020).max(now.year).default(now.year),month:z.coerce.number().int().min(1).max(12).default(now.month)}).safeParse(Object.fromEntries(req.nextUrl.searchParams));
 if(!p.success)return NextResponse.json({error:"فترة غير صالحة"},{status:400,headers});
 const {start,end}=monthRangeUtc(p.data);
 const where={storeId,occurredAt:{gte:start,lt:end}};
 const [totals,rows]=await Promise.all([prisma.daftariCashEntry.groupBy({by:["direction"],where,_sum:{amountMinor:true}}),prisma.daftariCashEntry.findMany({where,orderBy:[{occurredAt:"desc"},{createdAt:"desc"}],take:100})]);
 return NextResponse.json({summary:summarizeCash(totals.map(r=>({direction:r.direction,amountMinor:r._sum.amountMinor??BigInt(0)}))),entries:rows.map(r=>({...r,amountMinor:r.amountMinor.toString()}))},{headers});
}catch(e){return fail(e)}}
export async function POST(req:NextRequest){try{
 const storeId=await access(),p=input.safeParse(await req.json().catch(()=>null));
 if(!p.success)return NextResponse.json({error:"بيانات الحركة غير صالحة"},{status:400,headers});
 const v=p.data,occurredAt=cashDate(v.date),today=new Date(Date.now()+3*3600000).toISOString().slice(0,10);
 if(!occurredAt||v.date>today||v.date<"2020-01-01")return NextResponse.json({error:"تاريخ غير صالح"},{status:400,headers});
 const amountMinor=BigInt(Math.round(v.amount*100));
 if(amountMinor<=BigInt(0))return NextResponse.json({error:"المبلغ أقل من هللة"},{status:400,headers});
 const row=await prisma.daftariCashEntry.upsert({where:{storeId_requestId:{storeId,requestId:v.requestId}},create:{storeId,requestId:v.requestId,direction:v.direction,category:v.category,amountMinor,occurredAt,description:v.description??null},update:{}});
 if(row.direction!==v.direction||row.category!==v.category||row.amountMinor!==amountMinor||row.occurredAt.getTime()!==occurredAt.getTime()||row.description!==(v.description??null))return NextResponse.json({error:"معرّف الحركة مستخدم لبيانات أخرى"},{status:409,headers});
 return NextResponse.json({id:row.id},{status:201,headers});
}catch(e){return fail(e)}}
