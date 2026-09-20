
// components/about/AboutStoryPart2.tsx

import Image from "next/image";
import { t } from "@/theme";
import styles from "./AboutStoryPart2.module.css";

export default function AboutStoryPart2() {
  return (
    <section
      style={{
        background: t.colors.white,
        padding: `${t.spacing["16"]} ${t.spacing["5"]}`,
        direction: "rtl",
      }}
    >
      <div className={styles.container}>
        {/* دعم الأسرة المنتجة */}
        <div className={styles.storyBlock}>
          <div className={styles.storyImage}>
            <Image
              src="/images/story/story-part-2.jpg.jpg"
              alt="أسرة منتجة تطور مشروعها وتعرض منتجاتها بطريقة حديثة"
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              style={{
                objectFit: "cover",
              }}
            />
          </div>

          <div className={styles.storyContent}>
            <p className={styles.eyebrow}>الأسرة المنتجة</p>

            <h2
              style={{
                margin: 0,
                color: t.colors.primary[900],
                fontSize: t.typography.fontSize["3xl"],
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.5,
              }}
            >
              دعم الأسرة المنتجة
            </h2>

            <div className={styles.text}>
              <p className={styles.highlight}>
                دعم الأسرة المنتجة هو روح بسطة.
              </p>

              <p>
                نريد أن نمنح الأسر المنتجة فرصة حقيقية لعرض أعمالها بطريقة
                تليق بها، والوصول إلى عملاء جدد دون أن تضطر في البداية إلى
                بناء متجر تقني معقد أو تحمل تكاليف كبيرة.
              </p>

              <p>
                لهذا تبدأ الأسرة بمتجر يمكنها من خلاله عرض منتجاتها والوصول
                إلى العملاء، ثم تنمو المنصة معها كلما نجحت تجارتها.
              </p>

              <p>نحن لا نريد أن نجعل البداية صعبة.</p>

              <p className={styles.strong}>
                نريد أن تكون البداية بسيطة.
              </p>

              <p className={styles.finalStatement}>
                ثم يأتي النمو عندما يصبح هناك منتج حقيقي وعملاء حقيقيون.
              </p>
            </div>
          </div>
        </div>

        {/* التراث */}
        <div className={styles.heritageBlock}>
          <div className={styles.heritageContent}>
            <p className={styles.eyebrow}>الهوية والتراث</p>

            <h2
              style={{
                margin: 0,
                color: t.colors.primary[900],
                fontSize: t.typography.fontSize["3xl"],
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.5,
              }}
            >
              التراث لا يجب أن يبقى في الماضي
            </h2>

            <div className={styles.text}>
              <p>
                نحب الأشياء القديمة، ليس لأنها قديمة فقط، وإنما لأنها تحمل
                شيئًا منّا.
              </p>

              <p>
                البيوت القديمة، السدو، الحرف اليدوية، المنتجات الشعبية،
                وصفات الأمهات، الأسواق والبسطات… كلها أجزاء من ذاكرة مجتمع.
              </p>

              <p>
                لكن الحفاظ على التراث لا يعني أن نضعه خلف زجاج ونشاهده فقط.
              </p>

              <p>
                يمكن أن يعيش التراث من جديد عندما يجد من يصنعه سوقًا، ويجد من
                يقدّره طريقة سهلة للوصول إليه.
              </p>

              <p className={styles.strong}>
                بسطة تريد أن تكون واحدة من المساحات التي يلتقي فيها التراث
                بالسوق الحديث.
              </p>

              <p className={styles.highlightGold}>
                بصورة أجمل، ومحتوى أفضل، وتجربة رقمية تفتح هذه المنتجات أمام
                جيل جديد من العملاء.
              </p>
            </div>
          </div>

          <div className={styles.heritageImage}>
            <Image
              src="/images/story/story-heritage.jpg.jpg"
              alt="حرف ومنتجات تراثية سعودية في مساحة تجمع بين التراث والحياة الحديثة"
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

