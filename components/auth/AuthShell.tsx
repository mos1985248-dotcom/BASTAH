// components/auth/AuthShell.tsx
// القالب المشترك لصفحات المصادقة (دخول/تسجيل/استعادة): نموذج + لوحة بصورة تراثية من صور الموقع.
// على الجوال تتحول اللوحة إلى شريط علوي بالصورة نفسها.

import Image from "next/image";
import { uiVars } from "@/components/ui/vars";
import s from "./auth.module.css";

const SCENES = {
  heritage: {
    src: "/images/story/story-heritage.jpg.jpg",
    kicker: "من قلب السوق السعودي",
    headline: "أهلاً بعودتك إلى بسطة مارت",
    lead: "سوق الأسر المنتجة السعودية: منتجات أصيلة بأيدي أصحابها، وتجربة تسوق سهلة.",
  },
  souq: {
    src: "/images/story/story-hero.jpg.jpg",
    kicker: "انضم إلى بسطة مارت",
    headline: "ابدأ رحلتك في سوق الأسر المنتجة",
    lead: "افتح متجرك أو تسوّق من بيوت منتجة سعودية، واحجز لك مكاناً في السوق.",
  },
  home: {
    src: "/images/story/story-store-life.jpg.jpg",
    kicker: "حسابك في أمان",
    headline: "نعيدك إلى حسابك بسهولة",
    lead: "خطوات قصيرة وواضحة، وتعود لمتجرك أو لتسوقك كما تركتها.",
  },
} as const;

export default function AuthShell({
  title,
  subtitle,
  scene = "heritage",
  children,
}: {
  title?: string;
  subtitle?: string;
  scene?: keyof typeof SCENES;
  children: React.ReactNode;
}) {
  const view = SCENES[scene];

  return (
    <div className={s.root} style={uiVars}>
      <main className={s.main}>
        <div className={s.panel}>
          {title && <h1 className={s.title}>{title}</h1>}
          {subtitle && <p className={s.sub}>{subtitle}</p>}
          <div className={s.card}>{children}</div>
        </div>
      </main>

      <aside className={s.aside} aria-hidden="true">
        <Image src={view.src} alt="" fill priority sizes="(max-width: 900px) 100vw, 50vw" className={s.asideImg} />
        <div className={s.shade} />

        <div className={s.asideBottom}>
          <span className={s.kicker}>{view.kicker}</span>
          <h2 className={s.headline}>{view.headline}</h2>
          <p className={s.lead}>{view.lead}</p>
        </div>

        <div className={s.brandRow}>
          <a href="/" className={s.brand} tabIndex={-1}>
            <span className={s.logoBox}>
              <Image src="/images/logo-icon.png" alt="" width={36} height={36} />
            </span>
            <span>
              <span className={s.brandName}>بسطة مارت</span>
              <span className={s.brandTag}>منصة الأسر المنتجة السعودية</span>
            </span>
          </a>
        </div>

      </aside>
    </div>
  );
}
