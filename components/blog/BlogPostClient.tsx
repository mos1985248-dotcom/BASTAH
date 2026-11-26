"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { t } from "@/theme";
import { formatPlatformCopy, platformAuthorName } from "@/lib/brand";
import SiteShell from "@/components/layout/SiteShell";
import BlogPostCard, { BlogPostSummary } from "./BlogPostCard";
import s from "./magazine.module.css";
interface Post { titleAr:string; excerptAr:string|null; contentAr:string; coverImage:string|null; category:string; authorName:string|null; publishedAt:string|null }
export default function BlogPostClient({slug}:{slug:string}) {
 const [post,setPost]=useState<Post|null>(null);
 const [related,setRelated]=useState<BlogPostSummary[]>([]);
 const [error,setError]=useState("");
 const [copied,setCopied]=useState(false);
 useEffect(()=>{setPost(null);setError("");setCopied(false);let active=true;
 api.get<{post:Post}>("/api/blog/"+encodeURIComponent(slug)).then(d=>{if(active)setPost(d.post)}).catch(()=>{if(active)setError("تعذّر تحميل المقال")});
 api.get<{posts:BlogPostSummary[]}>("/api/blog?limit=12").then(d=>{if(active)setRelated(d.posts.filter(p=>p.slug!==slug).slice(0,3))}).catch(()=>{});
 return()=>{active=false};},[slug]);
 if(!post)return <SiteShell><p className={s.status}>{error||"جاري التحميل..."}</p></SiteShell>;
 const blocks=formatPlatformCopy(post.contentAr).trim().split(/\n\s*\n/).filter(Boolean);
 const sections=blocks.map((b,i)=>{const lines=b.split("\n");return {id:"section-"+i,title:lines.length>1&&lines[0].length<100?lines[0]:"",body:lines.length>1&&lines[0].length<100?lines.slice(1).join("\n"):b}});
 const minutes=Math.max(1,Math.ceil(post.contentAr.trim().split(/\s+/).length/180));
 const cats:Record<string,string>={"platform-news":"أخبار بسطة","success-stories":"قصص النجاح","store-management":"إدارة المتاجر",crafts:"الحرف والتسويق"};
 return <SiteShell><main className={s.wrap} dir="rtl">
 <nav className={s.crumb}><a href="/">الرئيسية</a> / <a href="/blog">المدونة</a> / {cats[post.category]||"مقال"}</nav>
 <header className={s.articleHeader}><span className={s.tag}>{cats[post.category]||"مدونة بسطة"}</span><h1 style={{fontFamily:t.typography.fontFamily.display}}>{formatPlatformCopy(post.titleAr)}</h1>{post.excerptAr&&<p>{formatPlatformCopy(post.excerptAr)}</p>}<small>{platformAuthorName(post.authorName)} · {minutes} دقائق للقراءة {post.publishedAt&&" · "+new Date(post.publishedAt).toLocaleDateString("ar-SA")}</small></header>
 {post.coverImage&&<img className={s.heroImage} src={post.coverImage} alt={formatPlatformCopy(post.titleAr)} />}
 <div className={s.readLayout}><aside className={s.sidebar}><nav aria-label="محتويات المقال"><strong>محتويات المقال</strong>{sections.filter(x=>x.title).map(x=><a key={x.id} href={"#"+x.id}>{x.title}</a>)}</nav><div className={s.share}><strong>شارك المقال</strong><a href={"https://wa.me/?text="+encodeURIComponent(post.titleAr+" "+(typeof window==="undefined"?"":window.location.href))} target="_blank" rel="noopener noreferrer">واتساب</a><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);setCopied(true)}catch{setCopied(false)}}}>{copied?"تم النسخ":"نسخ الرابط"}</button></div></aside>
 <article className={s.prose}>{sections.map(x=><section key={x.id} id={x.id}>{x.title&&<h2>{x.title}</h2>}<p>{x.body}</p></section>)}</article></div>
 <div className={s.cta}><div><h2>من الفكرة إلى أول عملية بيع</h2><p>ابدأ رحلتك مع بسطة مارت واعرض منتجاتك.</p></div><a href="/register">ابدأ متجرك مجانًا ←</a></div>
 {related.length>0&&<section><h2 className={s.sectionTitle}>اقرأ أيضًا</h2><div className={s.grid}>{related.map(p=><BlogPostCard key={p.id} post={p}/>)}</div></section>}
 <a className={s.back} href="/blog">العودة إلى المدونة ←</a></main></SiteShell>;
}
