
// components/about/AboutExperience.tsx
// يجسّد فكرة "المتجر ليس مجرد قائمة منتجات" — بلا أرقام أو ادعاءات، فقط
// وصف لما تتيحه بسطة فعلياً بصفحة كل متجر (قصة، صور/فيديو، هوية، ذاكرة).

import Image from "next/image";
import {
  BookOpen,
  Film,
  Palette,
  History,
  type LucideIcon,
} from "lucide-react";
import { t } from "@/theme";
import styles from "./AboutExperience.module.css";

const PILLARS: {
  Icon: LucideIcon;
  title: string;
  desc: string;
}[] = [
  {
    Icon: BookOpen,
    title: "قصة",
    desc: "لكل أسرة مساحة تروي فيها من هي ولماذا تصنع ما تصنع، بكلماتها الخاصة",
  },
  {
    Icon: Film,
    title: "صور وفيديو",
    desc: "معرض صور حقيقي، وفيديو قصير إن رغبت الأسرة يُظهر لمسة الصنعة اليدوية",
  },
  {
    Icon: Palette,
    title: "هوية بصرية",
    desc: "شارات ثقة وتفاصيل تعكس شخصية المتجر، لا قالباً موحّداً لكل التجار",
  },
  {
    Icon: History,
    title: "ذاكرة",
    desc: "وصفة أو حرفة توارثتها الأجيال — مساحة لتُروى كما هي، بلا مبالغة",
  },
];

export default function AboutExperience() {
  return (
    <section
      style={{
        background: t.colors.white,
        padding: `${t.spacing["16"]} ${t.spacing["5"]}`,
        direction: "rtl",
      }}
    >
      <div className={styles.container}>
        <div className={styles.intro}>
          <div className={styles.image}>
            <Image
              src="/images/story/story-experience.jpg.jpg"
              alt="تفاصيل من تجربة متجر محلي ومنتجاته"
              fill
              sizes="(max-width: 900px) 100vw, 40vw"
              style={{
                objectFit: "cover",
              }}
            />
          </div>

          <div className={styles.heading}>
            <p className={styles.eyebrow}>تجربة المتجر</p>

            <h2
              style={{
                margin: `0 0 ${t.spacing["3"]}`,
                color: t.colors.text.dark,
                fontSize: t.typography.fontSize["3xl"],
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.5,
              }}
            >
              المتجر ليس مجرد قائمة منتجات
            </h2>

            <p
              style={{
                margin: 0,
                color: t.colors.text.mid,
                fontSize: t.typography.fontSize.base,
                lineHeight: 2,
              }}
            >
              كل متجر على بسطة مساحة كاملة — قصة وصور وذاكرة وهوية، لا صفحة
              سعر واحدة.
            </p>
          </div>
        </div>

        <div className={styles.pillars}>
          {PILLARS.map(({ Icon, title, desc }) => (
            <div key={title} className={styles.pillar}>
              <div className={styles.icon}>
                <Icon
                  size={25}
                  strokeWidth={1.7}
                  color={t.colors.primary[800]}
                />
              </div>

              <h3
                style={{
                  margin: `0 0 ${t.spacing["2"]}`,
                  color: t.colors.text.dark,
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: t.typography.fontWeight.bold,
                  lineHeight: 1.5,
                }}
              >
                {title}
              </h3>

              <p
                style={{
                  maxWidth: 270,
                  margin: 0,
                  color: t.colors.text.body,
                  fontSize: t.typography.fontSize.sm,
                  lineHeight: 1.95,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

