import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeDeliveredSales } from "../../lib/daftari/report";
const line = {id:"a",productId:"p",nameAr:"تمر",total:40,quantity:2,daftariCostSnapshot:{productCostMinor:1000}};
test("subtracts discount and historical cost exactly",()=>{
 const r=summarizeDeliveredSales([{subtotal:40,discountAmount:5,items:[line]}]);
 assert.equal(r.revenueMinor,3500); assert.equal(r.knownCostMinor,2000); assert.equal(r.grossProfitMinor,1500);
});
test("does not report fictitious profit for missing cost",()=>{
 const r=summarizeDeliveredSales([{subtotal:40,discountAmount:0,items:[{...line,daftariCostSnapshot:null}]}]);
 assert.equal(r.grossProfitMinor,null); assert.equal(r.missingLines,1);
});
test("allocates every halala of net revenue",()=>{
 const r=summarizeDeliveredSales([{subtotal:80,discountAmount:0.01,items:[line,{...line,id:"b",productId:"q"}]}]);
 assert.equal(r.products.reduce((s,p)=>s+p.revenueMinor,0),7999);
});
