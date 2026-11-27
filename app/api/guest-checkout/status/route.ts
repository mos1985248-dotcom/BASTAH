import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
export async function GET(req:NextRequest){
 const id=req.nextUrl.searchParams.get("id")??"";
 const denied=()=>NextResponse.json({error:"الطلب غير متاح"},{status:404,headers:{"Cache-Control":"no-store"}});
 if(!/^guest_[a-f0-9]{64}$/.test(id))return denied();
 const token=req.cookies.get("bastah_guest_"+id.slice(-24))?.value;
 if(!token||!/^([a-f0-9]{64})$/.test(token))return denied();
 const buyerId="guest_"+createHash("sha256").update(token).digest("hex");
 const order=await prisma.order.findFirst({where:{id,buyerId},select:{orderNumber:true,status:true,paymentStatus:true,total:true,createdAt:true}});
 if(!order)return denied();
 return NextResponse.json(order,{headers:{"Cache-Control":"no-store"}});
}
