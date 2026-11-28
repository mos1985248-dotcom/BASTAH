export function planScenario(fixed:number,price:number,variable:number,units:number){
 if(![fixed,price,variable,units].every(Number.isFinite)||fixed<0||price<=0||variable<0||!Number.isSafeInteger(units)||units<0)return null;
 const contribution=Math.round(price*100)-Math.round(variable*100);
 if(contribution<=0)return {breakEvenUnits:null,revenue:Math.round(price*100)*units/100,profit:(contribution*units-Math.round(fixed*100))/100};
 return {breakEvenUnits:Math.ceil(Math.round(fixed*100)/contribution),revenue:Math.round(price*100)*units/100,profit:(contribution*units-Math.round(fixed*100))/100};
}
