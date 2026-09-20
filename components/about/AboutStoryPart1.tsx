
// components/about/AboutStoryPart1.tsx

import Image from "next/image";
import { t } from "@/theme";
import styles from "./AboutStoryPart1.module.css";

export default function AboutStoryPart1() {
  return (
    <section
      style={{
        background: t.colors.cream.bg,
        padding: `${t.spacing["16"]} ${t.spacing["5"]}`,
        direction: "rtl",
      }}
    >
      <div className={styles.container}>
        {/* البداية */}
        <div className={styles.storyBlock}>
          <div className={styles.storyImage}>
            <Image
              src="/images/story/story-part-1.jpg.jpg"
              alt="بسطة وسوق محلي يعكس روح المنتجات المحلية"
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              style={{
                objectFit: "cover",
              }}
            />
          </div>

          <div className={styles.storyContent}>
            <p className={styles.eyebrow}>البداية</p>

            <h2
              style={{
                color: t.colors.primary[900],
                fontSize: t.typography.fontSize["3xl"],
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.5,
              }}
            >
              لماذا &quot;بسطة&quot;؟
            </h2>

            <div className={styles.text}>
              <p>
                اسم بسطة يحمل شيئًا من ذاكرتنا.
              </p>

              <p className={styles.strong}>
                البسطة كانت بسيطة، قريبة، ومفتوحة للناس.
              </p>

              <p>
                كانت الأم تعرض ما تصنعه، والأسرة تبيع ما تنتجه، والناس يعرفون
                المنتج وصاحبه، ويتحدثون معه، ويعودون إليه لأنهم وثقوا به.
              </p>

              <p>
                أردنا أن نأخذ هذه الروح ونمنحها مكانًا جديدًا في العالم الرقمي.
              </p>

              <p className={styles.highlight}>
                لذلك جاءت بسطة كسوق رقمي للمنتجات الشعبية ومنتجات الأسر
                المنتجة، لكن بروح مختلفة.
              </p>
            </div>
          </div>
        </div>

        {/* أكثر من منتج */}
        <div className={styles.storyBlockReverse}>
          <div className={styles.storyContent}>
            <p className={styles.eyebrow}>أكثر من منتج</p>

            <h2
              style={{
                color: t.colors.primary[900],
                fontSize: t.typography.fontSize["3xl"],
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.5,
              }}
            >
              نحن لا نبيع المنتج فقط
            </h2>

            <div className={styles.text}>
              <p>
                نؤمن أن المنتج الشعبي لا يُقاس بسعره فقط.
              </p>

              <p>
                وراء قطعة يدوية قد تكون هناك سنوات من التعلم.
              </p>

              <p>
                وراء وصفة منزلية قد تكون ذاكرة أم أو جدة.
              </p>

              <p>
                وراء منتج شعبي قد يكون جزء من تاريخ عائلة أو منطقة.
              </p>

              <p className={styles.strong}>
                ولهذا نمنح المتجر في بسطة مساحة أكبر من مجرد قائمة منتجات.
              </p>

              <p>
                يمكن أن يكون للمتجر قصة وصور وفيديو ومحتوى يحكي للعميل من هم
                أصحاب المتجر، وكيف بدأوا، وما الذي يجعل منتجاتهم مختلفة.
              </p>

              <p className={styles.highlightGold}>
                فالعميل لا يرى المنتج فقط؛ بل يستطيع أن يعرف الحكاية التي وراءه.
              </p>
            </div>
          </div>

          {/* الصورة */}
          <div className={styles.productImage}>
            <Image
              src="/images/story/story-more-than-product.jpg.jpg"
              alt="منتجات متنوعة من الأسر المنتجة تحمل قصصًا وذكريات"
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              style={{
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
