import { toMinor } from "../finance/money";
export type SaleLine = { id: string; productId: string; nameAr: string; total: number; quantity: number; daftariCostSnapshot: { productCostMinor: number } | null };
export type SaleOrder = { subtotal: number; discountAmount: number; items: SaleLine[] };

// Discounts allocated proportionally in integer halalas, with the final remainder
// assigned deterministically. Unknown cost is never treated as zero.
export function summarizeDeliveredSales(orders: SaleOrder[]) {
  let revenueMinor = 0, knownCostMinor = 0, missingLines = 0;
  const products = new Map<string, { productId: string; name: string; units: number; revenueMinor: number; knownCostMinor: number; missingLines: number }>();
  for (const order of orders) {
    const lines = [...order.items].sort((a,b)=>a.id.localeCompare(b.id));
    const weights = lines.map(line => Math.max(0,toMinor(line.total) ?? 0));
    const total = weights.reduce((a,b)=>a+b,0);
    const net = Math.max(0,(toMinor(order.subtotal) ?? 0)-(toMinor(order.discountAmount) ?? 0));
    revenueMinor += net;
    let allocated = 0, weightSoFar = 0;
    lines.forEach((line,index)=>{
      weightSoFar += weights[index];
      const target = index === lines.length-1 ? net : total ? Math.round(net * weightSoFar / total) : 0;
      const revenue = target - allocated; allocated = target;
      const cost = line.daftariCostSnapshot?.productCostMinor;
      const p = products.get(line.productId) ?? {productId:line.productId,name:line.nameAr,units:0,revenueMinor:0,knownCostMinor:0,missingLines:0};
      p.units += line.quantity; p.revenueMinor += revenue;
      if (cost === undefined) { missingLines++; p.missingLines++; }
      else { const amount = cost * line.quantity; knownCostMinor += amount; p.knownCostMinor += amount; }
      products.set(line.productId,p);
    });
  }
  return { revenueMinor, knownCostMinor, missingLines, grossProfitMinor: missingLines ? null : revenueMinor-knownCostMinor,
    products:[...products.values()].map(p=>({...p,grossProfitMinor:p.missingLines?null:p.revenueMinor-p.knownCostMinor})) };
}
