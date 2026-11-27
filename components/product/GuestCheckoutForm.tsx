"use client";
import { useState, type FormEvent } from "react";
import { api, ApiError } from "@/lib/api-client";
import { uiVars } from "@/components/ui/vars";
import s from "./guest-checkout.module.css";
type Quote={subtotal:number;shippingCost:number;codFee:number;taxAmount:number;total:number};
export default function GuestCheckoutForm({storeId,productId,variantId,quantity}:{storeId:string;productId:string;variantId?:string;quantity:number}){
  const [form,setForm]=useState({name:"",phone:"",city:"",region:"",address:"",paymentMethod:"CREDIT_CARD"});
  const [quote,setQuote]=useState<Quote|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");setQuote(null);try{setQuote(await api.post<Quote>("/api/guest-checkout/quote",{...form,storeId,items:[{productId,variantId,quantity}]}));}catch(e){setError(e instanceof ApiError?e.message:"تعذّر حساب التكلفة");}finally{setBusy(false);}}
  const fields=[["name","الاسم الكامل"],["phone","الجوال السعودي"],["city","المدينة"],["region","المنطقة"],["address","العنوان"]] as const;
  return <form className={s.form} style={uiVars} onSubmit={submit}><h2>الشراء كزائر</h2><a href={"/login?redirect="+encodeURIComponent("/products/"+productId)}>لديك حساب؟ تسجيل الدخول</a>{fields.map(([key,label])=><label key={key}>{label}<input required maxLength={key==="address"?300:100} type={key==="phone"?"tel":"text"} value={form[key]} onChange={e=>{setForm(p=>({...p,[key]:e.target.value}));setQuote(null);}}/></label>)}<label>طريقة الدفع<select value={form.paymentMethod} onChange={e=>{setForm(p=>({...p,paymentMethod:e.target.value}));setQuote(null);}}><option value="CREDIT_CARD">الدفع الإلكتروني</option><option value="CASH_ON_DELIVERY">الدفع عند الاستلام</option><option value="BANK_TRANSFER">تحويل بنكي</option></select></label><button disabled={busy}>{busy?"جاري الحساب...":"احسب تكلفة الطلب"}</button>{error&&<p role="alert">{error}</p>}{quote&&<div role="status"><p>المنتجات: {quote.subtotal.toFixed(2)} ر.س</p><p>الشحن: {quote.shippingCost.toFixed(2)} ر.س</p><p>رسوم الدفع: {quote.codFee.toFixed(2)} ر.س</p><p>الضريبة: {quote.taxAmount.toFixed(2)} ر.س</p><strong>الإجمالي: {quote.total.toFixed(2)} ر.س</strong><p>معاينة فقط — لم يُنشأ طلب.</p></div>}</form>;
}
