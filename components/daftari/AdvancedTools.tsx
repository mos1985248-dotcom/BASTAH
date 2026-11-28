"use client";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { planScenario } from "@/lib/daftari/planning";
import type { PlatformSalesSummary } from "@/lib/daftari/platform-sales";
import s from "./daftari.module.css";
type Month=PlatformSalesSummary&{period:string};
export default function AdvancedTools(){
 const [months,setMonths]=useState<Month[]|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState("");
 const [values,setValues]=useState({fixed:"",price:"",variable:"",units:""});
 const valid=Object.values(values).every(v=>v.trim()!==""&&Number(v)<=10000000);
 const result=valid?planScenario(Number(values.fixed),Number(values.price),Number(values.variable),Number(values.units)):null;
 const load=async()=>{setLoading(true);setError("");try{setMonths((await api.get<{months:Month[]}>("/api/daftari/advanced")).months)}catch{setError("تعذّر تحميل المقارنة")}finally{setLoading(false)}};
 return <div className={s.advancedBox}>
  <h3 className={s.panelTitle}>الإدارة المالية المتقدمة — ازدهار</h3>
  <button type="button" className={s.cta} disabled={loading} onClick={load}>{loading?"جاري التحميل...":"مقارنة آخر 6 أشهر"}</button>
  {error&&<p role="alert">{error}</p>}
  {months&&<div className={s.reportScroll}><table className={s.reportTable}><thead><tr><th>الشهر</th><th>المبيعات المسلّمة</th><th>المستردات بعد التسليم</th><th>صافي المبيعات</th></tr></thead><tbody>{months.map(m=><tr key={m.period}><td>{m.period}</td><td>{m.sales.toFixed(2)}</td><td>{m.deliveredRefunds.toFixed(2)}</td><td>{m.netSales.toFixed(2)}</td></tr>)}</tbody></table></div>}
  <h3 className={s.panelTitle}>حاسبة نقطة التعادل والتخطيط</h3>
  <p className={s.sub}>سيناريو تقديري لمنتج واحد أو متوسط مزيج ثابت، دون ضريبة. أدخل تكاليفك الفعلية المتوقعة؛ لا يُحفظ كقيد محاسبي.</p>
  <div className={s.planGrid}>{([["fixed","المصروفات الثابتة الشهرية"],["price","سعر بيع الوحدة"],["variable","التكلفة المتغيرة للوحدة"],["units","الوحدات المتوقع بيعها"]] as const).map(([key,label])=><label key={key} className={s.fieldWrap}><span className={s.fieldLabel}>{label}</span><input className={s.field} type="number" min="0" max="10000000" step={key==="units"?"1":"0.01"} value={values[key]} onChange={e=>setValues(v=>({...v,[key]:e.target.value}))}/></label>)}</div>
  {result&&<div><p>نقطة التعادل: {result.breakEvenUnits===null?"لا يمكن تحقيقها بهذا الهامش":result.breakEvenUnits+" وحدة"}</p><p>الإيرادات المتوقعة: {result.revenue.toFixed(2)} ر.س</p><p>نتيجة السيناريو: {result.profit.toFixed(2)} ر.س</p></div>}
 </div>;
}
