import type { Prisma } from "@prisma/client";
import { toMinor, fromMinor } from "../finance/money";
export type PlatformSalesSummary = { deliveredOrders: number; sales: number; deliveredRefunds: number; otherRefunds: number; netSales: number };
export async function readPlatformSales(db: Prisma.TransactionClient, storeId: string, start: Date, end: Date): Promise<PlatformSalesSummary> {
  const period = { gte:start, lt:end };
  const [sales, refunds] = await Promise.all([
    db.order.findMany({ where:{storeId,deliveredAt:period,OR:[{status:"DELIVERED",paymentStatus:"PAID"},{status:"REFUNDED",paymentStatus:"REFUNDED"}]}, select:{subtotal:true,discountAmount:true} }),
    db.order.findMany({ where:{storeId,status:"REFUNDED",paymentStatus:"REFUNDED",statusHistory:{some:{status:"REFUNDED",createdAt:period}}},select:{subtotal:true,discountAmount:true,deliveredAt:true,statusHistory:{where:{status:"REFUNDED"},orderBy:{createdAt:"asc"},take:1,select:{createdAt:true}}} }),
  ]);
  const net = (row:{subtotal:number;discountAmount:number}) => Math.max(0,(toMinor(row.subtotal)??0)-(toMinor(row.discountAmount)??0));
  const gross = sales.reduce((s,r)=>s+net(r),0);
  let deliveredRefunds=0,otherRefunds=0;
  for(const row of refunds) {
    const date=row.statusHistory[0]?.createdAt;
    if(!date||date<start||date>=end) continue;
    if(row.deliveredAt&&row.deliveredAt<=date) deliveredRefunds+=net(row);
    else otherRefunds+=net(row);
  }
  return {deliveredOrders:sales.length,sales:fromMinor(gross),deliveredRefunds:fromMinor(deliveredRefunds),otherRefunds:fromMinor(otherRefunds),netSales:fromMinor(gross-deliveredRefunds)};
}
