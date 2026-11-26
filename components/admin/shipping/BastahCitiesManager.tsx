"use client";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { t } from "@/theme";
interface City { key: string; name: string; isActive: boolean; flatFee: number; perKgFee: number; couriers: {id:string;name:string;isActive:boolean;commissionPerShipment:number|null}[] }
export default function BastahCitiesManager() {
  const [cities,setCities] = useState<City[]>([]);
  const [selected,setSelected] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [draft,setDraft] = useState({isActive:false,flatFee:"",perKgFee:""});
  const load = async () => { try { const r = await api.get<{cities:City[]}>("/api/admin/shipping/cities"); setCities(r.cities); setError(""); } catch(e) {setError(e instanceof ApiError ? e.message : "تعذّر تحميل المدن");} finally {setLoading(false);} };
  useEffect(() => {void load();},[]);
  const city = cities.find(c=>c.key===selected);
  const choose = (key:string) => {setSelected(key);const c=cities.find(x=>x.key===key);if(c)setDraft({isActive:c.isActive,flatFee:String(c.flatFee),perKgFee:String(c.perKgFee)});};
  const valid=[draft.flatFee,draft.perKgFee].every(v=>v.trim()!=="" && Number.isFinite(Number(v)) && Number(v)>=0 && Number(v)<=100000);
  const save=async()=>{if(!city||!valid||saving)return;setSaving(true);setError("");try{await api.patch("/api/admin/shipping/cities",{key:city.key,isActive:draft.isActive,flatFee:Number(draft.flatFee),perKgFee:Number(draft.perKgFee)});await load();}catch(e){setError(e instanceof ApiError?e.message:"تعذّر الحفظ");}finally{setSaving(false);}};
  const field={padding:8,border:"1px solid "+t.colors.cream.border,borderRadius:8,font:"inherit",width:"100%",boxSizing:"border-box" as const};
  return <section style={{background:t.colors.white,border:"1px solid "+t.colors.cream.border,borderRadius:12,padding:16,display:"grid",gap:12}}>
    <h3 style={{margin:0,color:t.colors.primary[800]}}>بسطة للشحن — المدن والتغطية</h3>
    <p style={{margin:0,fontSize:13}}>{cities.filter(c=>c.isActive).length} مدينة مفعّلة من {cities.length} · التوصيل داخل المدينة فقط</p>
    {loading?<p>جاري تحميل المدن...</p>:<select aria-label="المدينة" style={field} value={selected} disabled={saving} onChange={e=>choose(e.target.value)}><option value="">اختر المدينة لإدارة إعداداتها</option>{cities.map(c=><option key={c.key} value={c.key}>{c.name} — {c.isActive?"نشطة":"متوقفة"} ({c.couriers.filter(x=>x.isActive).length} مندوب نشط)</option>)}</select>}
    {city&&<form onSubmit={e=>{e.preventDefault();void save();}} style={{display:"grid",gap:10}}>
      <label><input type="checkbox" checked={draft.isActive} disabled={saving} onChange={e=>setDraft(d=>({...d,isActive:e.target.checked}))}/> تفعيل التوصيل في {city.name}</label>
      <label>سعر التوصيل (ر.س)<input style={field} type="number" min="0" max="100000" step="0.01" required value={draft.flatFee} disabled={saving} onChange={e=>setDraft(d=>({...d,flatFee:e.target.value}))}/></label>
      <label>رسوم كل كيلوجرام (ر.س)<input style={field} type="number" min="0" max="100000" step="0.01" required value={draft.perKgFee} disabled={saving} onChange={e=>setDraft(d=>({...d,perKgFee:e.target.value}))}/></label>
      <button disabled={saving||!valid} style={{padding:10,border:0,borderRadius:8,background:t.colors.primary[800],color:"white"}}>{saving?"جاري الحفظ...":"حفظ إعدادات المدينة"}</button>
      <strong>المناديب المرتبطون ({city.couriers.length})</strong>
      {city.couriers.length===0?<p style={{margin:0,fontSize:12}}>لا يوجد مناديب في هذه المدينة</p>:city.couriers.map(c=><div key={c.id} style={{padding:8,border:"1px solid "+t.colors.cream.border,borderRadius:8,fontSize:13}}>{c.name} · {c.isActive?"نشط":"متوقف"} · {c.commissionPerShipment===null?"المستحق غير محدد":c.commissionPerShipment+" ر.س/شحنة"}</div>)}
    </form>}
    {error&&<p role="alert" style={{color:t.colors.semantic.danger}}>{error}</p>}
    <button type="button" disabled={saving} onClick={()=>void load()} style={{padding:8,border:"1px solid "+t.colors.cream.border,background:"white",borderRadius:8}}>تحديث القائمة</button>
  </section>;
}
