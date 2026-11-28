"use client";
import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { uiVars } from "@/components/ui/vars";
import { faqGroups } from "./faq-data";
import s from "./faq.module.css";
const normalize=(value:string)=>value.toLowerCase().normalize("NFKC").replace(/[\u064B-\u065F\u0640]/g,"").replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").trim();
export default function GeneralFAQ(){
 const [query,setQuery]=useState("");
 const [group,setGroup]=useState("all");
 const words=normalize(query).split(/\s+/).filter(Boolean);
 const visible=faqGroups.filter(g=>group==="all"||g.id===group).map(g=>({...g,items:g.items.filter(i=>words.every(w=>normalize(g.title+" "+i.question+" "+i.answer).includes(w)))})).filter(g=>g.items.length);
 const total=visible.reduce((sum,g)=>sum+g.items.length,0);
 return <main dir="rtl" className={s.page} style={uiVars}>
  <header className={s.header}><h1>الأسئلة الشائعة</h1><p>كيف نساعدك؟ إجابات لكل زائر ومشترٍ وصاحب بسطة.</p></header>
  <div className={s.search}><Search size={19} aria-hidden="true"/><input aria-label="ابحث في الأسئلة الشائعة" placeholder="ابحث عن سؤال..." type="search" value={query} onChange={e=>setQuery(e.target.value)}/></div>
  <nav className={s.filters} aria-label="موضوعات المساعدة">{[{id:"all",title:"الكل"},...faqGroups].map(g=><button type="button" key={g.id} aria-pressed={group===g.id} onClick={()=>setGroup(g.id)}>{g.title}</button>)}</nav>
  <p className={s.count} role="status">{total} سؤال</p>
  {visible.map(g=><section key={g.id} className={s.group} aria-labelledby={"faq-"+g.id}><h2 id={"faq-"+g.id}>{g.title}</h2><div className={s.list}>{g.items.map(i=><details key={i.question} className={s.item}><summary>{i.question}<ChevronDown size={17} aria-hidden="true"/></summary><div className={s.answer}><p>{i.answer}</p>{i.href&&<a href={i.href}>{i.linkLabel}</a>}</div></details>)}</div></section>)}
  {!total&&<div className={s.empty}><p>لم نجد سؤالًا مطابقًا.</p><button type="button" onClick={()=>{setGroup("all");setQuery("");}}>عرض جميع الأسئلة</button></div>}
  <section className={s.support}><h2>لم تجد إجابتك؟</h2><p>تواصل مع الدعم بعد تسجيل الدخول، أو مع صاحب البسطة للاستفسار عن منتج أو طلب.</p><a href="/dashboard/support">الدعم والمساعدة</a></section>
 </main>;
}
