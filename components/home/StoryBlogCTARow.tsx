// components/home/StoryBlogCTARow.tsx
// روابط "قصتنا" و"المدونة" تشير لصفحات خارطة الطريق الحالية.
import { ArrowLeft, BookOpen, Heart, type LucideIcon } from "lucide-react";
import { t } from "@/theme";
import { uiVars } from "@/components/ui/vars";
import s from "./story.module.css";

const LINKS: {
  href: string;
  Icon: LucideIcon;
  title: string;
  text: string;
  cta: string;
}[] = [
  {
    href: "/story",
    Icon: Heart,
    title: "قصتنا",
    text: "من فكرة بسيطة إلى منصة تدعم الأسر السعودية المنتجة وتصنع أثرًا حقيقيًا.",
    cta: "اقرأ قصتنا",
  },
  {
    href: "/blog",
    Icon: BookOpen,
    title: "المدونة",
    text: "تعرّف على قصص ملهمة ونصائح لرواد الأعمال وأخبار الأسر المنتجة.",
    cta: "تصفّح المدونة",
  },
];

export default function StoryBlogCTARow({ showStartStore }: { showStartStore: boolean }) {
  const display = t.typography.fontFamily.display;
  return (
    <section
      aria-label="قصتنا والمدونة وابدأ متجرك"
      className={s.section}
      style={{ ...uiVars, maxWidth: t.layout.containerMaxWidth }}
    >
      <div className={`${s.grid} ${showStartStore ? s.three : ""}`}>
        {LINKS.map(({ href, Icon, title, text, cta }) => (
          <a key={href} href={href} className={s.card}>
            <Icon size={28} strokeWidth={1.5} className={s.icon} aria-hidden="true" />
            <h3 className={s.title} style={{ fontFamily: display }}>{title}</h3>
            <p className={s.text}>{text}</p>
            <span className={s.link}>
              {cta}
              <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
            </span>
          </a>
        ))}

        {showStartStore && (
          <a href="/register" className={`${s.card} ${s.start}`}>
            <p className={s.kicker}>فرصتك تبدأ هنا</p>
            <h3 className={`${s.title} ${s.startTitle}`} style={{ fontFamily: display }}>
              ابدأ متجرك مجانًا
            </h3>
            <p className={s.text}>
              انضم إلى الأسر المنتجة على بسطة مارت وابدأ رحلتك في بيع منتجاتك
              والوصول إلى عملاء جدد.
            </p>
            <span className={s.startCta}>ابدأ مجانًا</span>
          </a>
        )}
      </div>
    </section>
  );
}
