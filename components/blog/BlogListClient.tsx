"use client";
import {useEffect,useState} from "react";
import {api} from "@/lib/api-client";
import {t} from "@/theme";
import {formatPlatformCopy} from "@/lib/brand";
import SiteShell from "@/components/layout/SiteShell";
import BlogPostCard,{BlogPostSummary} from "./BlogPostCard";
import s from "./magazine.module.css";
const tabs=[["all","الكل"],["store-management","إدارة المتاجر"],["crafts","الحرف والتسويق"],["success-stories","قصص النجاح"],["platform-news","أخبار بسطة"]];
export default function BlogListClient(){
 const [posts,setPosts]=useState<BlogPostSummary[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [category,setCategory]=useState("all");
 useEffect(()=>{let active=true;setLoading(true);setError("");api.get<{posts:BlogPostSummary[]}>("/api/blog?limit=50"+(category==="all"?"":"&category="+encodeURIComponent(category))).then(d=>{if(active)setPosts(d.posts)}).catch(()=>{if(active)setError("تعذّر تحميل المدونة")}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[category]);
 const hero=posts[0];
 return <SiteShell><main className={s.wrap} dir="rtl"><header className={s.listHeader}><span className={s.tag}>معرفة تنمو مع مشروعك</span><h1 style={{fontFamily:t.typography.fontFamily.display}}>مدونة بسطة مارت</h1><p>أفكار عملية، حكايات ملهمة، وخطوات صغيرة تصنع فرقًا في تجارتك.</p></header><nav aria-label="تصنيفات المدونة" className={s.tabs}>{tabs.map(([id,label])=><button type="button" key={id} aria-pressed={category===id} onClick={()=>setCategory(id)}>{label}</button>)}</nav>
 {loading?<p className={s.status}>جاري التحميل...</p>:error?<p className={s.status}>{error}</p>:!hero?<p className={s.status}>لا توجد مقالات في هذا القسم بعد.</p>:<><a className={s.featured} href={"/blog/"+hero.slug}>{hero.coverImage?<img src={hero.coverImage} alt={formatPlatformCopy(hero.titleAr)}/>:<div className={s.placeholder}>بسطة مارت</div>}<div><span className={s.tag}>مختارات المدونة</span><h2>{formatPlatformCopy(hero.titleAr)}</h2><p>{formatPlatformCopy(hero.excerptAr||"")}</p><span className={s.back}>اقرأ المقال ←</span></div></a>{posts.length>1&&<><h2 className={s.sectionTitle}>أحدث المقالات</h2><div className={s.grid}>{posts.slice(1).map(p=><BlogPostCard key={p.id} post={p}/>)}</div></>}</>}</main></SiteShell>
}
