"use client";
import { useEffect,useState } from "react";
import { api } from "@/lib/api-client";
import type { PlatformSalesSummary } from "@/lib/daftari/platform-sales";
import type { summarizeDeliveredSales } from "@/lib/daftari/report";
import s from "./daftari.module.css";
type Report=ReturnType<typeof summarizeDeliveredSales>;
const sar=(n:number)=>n.toFixed(2)+" ر.س";
export default function PlatformSummary({summary,reports,advanced}:{summary:PlatformSalesSummary;reports:boolean;advanced:boolean}){
 const [open,setOpen]=useState(false),[report,setReport]=useState<Report|null>(null),[error,setError]=useState("");
 useEffect(()=>{if(!open||!reports)return;let alive=true;setError("");api.get<Report>("/api/daftari/reports").then(d=>{if(alive)setReport(d)}).catch(()=>{if(alive)setError("تعذّر تحميل التقرير")});return()=>{alive=false}},[open,reports,summary]);
 return <section className={s.panel} style={{marginBottom:16}}>
  <div className={s.panelHead}><div><h2 className={s.panelTitle}>مبيعات بسطة مارت — هذا الشهر</h2><p className={s.panelSub}>تحديث تلقائي من الطلبات المسلّمة والمدفوعة، دون ضريبة أو رسوم الشحن والتحصيل</p></div></div>
  <div className={s.panelBody}>
   <div className={s.platformStats}>{[["المبيعات المسلّمة",sar(summary.sales)],["استرداد مبيعات مسلّمة",sar(summary.deliveredRefunds)],["صافي مبيعات المنتجات",sar(summary.netSales)],["عدد الطلبات المسلّمة",String(summary.deliveredOrders)]].map(([label,value])=><div key={label} className={s.mini}><div><span className={s.miniLabel}>{label}</span><strong>{value}</strong></div></div>)}</div>
   {summary.otherRefunds>0&&<p className={s.sub}>استردادات قبل التسليم (لا تخصم من مبيعات التسليم): {sar(summary.otherRefunds)}</p>}
   {reports?<button type="button" className={s.cta} onClick={()=>setOpen(v=>!v)}>{open?"إغلاق التقرير":"ربحية المنتجات"}</button>:<a href="/pricing">تقارير ربحية المنتجات متاحة من باقة انطلاق</a>}
   {reports&&open&&(error?<p role="alert">{error}</p>:!report?<p role="status">جاري التحميل...</p>:<div>
    <h3 className={s.panelTitle}>ربحية المنتجات — الطلبات المسلّمة غير المستردة</h3>
    <p className={s.sub}>التكلفة تقديرية محفوظة وقت الطلب، ولا تشمل رسوم البيع أو المصروفات الفعلية. لا يُعرض ربح إذا كانت التكلفة ناقصة.</p>
    <p>الإيرادات: {sar(report.revenueMinor/100)} · التكلفة المعروفة: {sar(report.knownCostMinor/100)}</p>
    <p>مجمل الربح التقديري: {report.grossProfitMinor===null?"غير مكتمل":sar(report.grossProfitMinor/100)}</p>
    {report.missingLines>0&&<p role="status">بنود بلا تكلفة تاريخية: {report.missingLines}</p>}
    <div className={s.reportScroll}><table className={s.reportTable}><thead><tr><th>المنتج</th><th>الكمية</th><th>الإيراد</th><th>مجمل الربح التقديري</th></tr></thead><tbody>{report.products.map(p=><tr key={p.productId}><td>{p.name}</td><td>{p.units}</td><td>{sar(p.revenueMinor/100)}</td><td>{p.grossProfitMinor===null?"غير مكتمل":sar(p.grossProfitMinor/100)}</td></tr>)}</tbody></table></div>
   </div>)}
   {advanced&&<p className={s.sub}>صلاحية الإدارة المالية المتقدمة متاحة؛ أدوات التخطيط والمقارنات لم تُفعّل بعد.</p>}
  </div>
 </section>;
}
