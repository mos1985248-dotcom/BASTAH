export const cashCategories = {
 IN:["SALES_RECEIPT","OWNER_FUNDING","OTHER_IN"],
 OUT:["SUPPLIER","OPERATING","CUSTOMER_REFUND","OWNER_DRAW","OTHER_OUT"]
} as const;
export function summarizeCash(rows: {direction:string;amountMinor:bigint}[]){
 let incoming=BigInt(0),outgoing=BigInt(0);
 for(const row of rows){if(row.direction==="IN")incoming+=row.amountMinor;else if(row.direction==="OUT")outgoing+=row.amountMinor;}
 return {incomingMinor:incoming.toString(),outgoingMinor:outgoing.toString(),netMinor:(incoming-outgoing).toString()};
}
export function cashDate(value:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const d=new Date(value+"T12:00:00+03:00");
 if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==value)return null;
 return d;
}
