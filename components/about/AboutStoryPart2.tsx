// components/about/AboutStoryPart2.tsx

import { t } from "@/theme";
import StorySection from "./StorySection";

export default function AboutStoryPart2() {
  return (
    <>
      <StorySection title="دعم الأسرة المنتجة" alt>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: t.spacing["4"],
            color: t.colors.text.body,
            fontSize: t.typography.fontSize.base,
            lineHeight: 2,
          }}
        >
          <p
            style={{
              margin: 0,
              padding: `${t.spacing["3"]} ${t.spacing["4"]}`,
              borderRadius: t.radius.lg,
              background: t.colors.primary[50],
              borderInlineStart: `3px solid ${t.colors.primary[700]}`,
              color: t.colors.primary[800],
              fontSize: t.typography.fontSize.lg,
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.8,
            }}
          >
            دعم الأسرة المنتجة هو روح بسطة.
          </p>

          <p style={{ margin: 0 }}>
            نريد أن نمنح الأسر المنتجة فرصة حقيقية لعرض أعمالها بطريقة تليق
            بها، والوصول إلى عملاء جدد دون أن تضطر في البداية إلى بناء متجر
            تقني معقد أو تحمل تكاليف كبيرة.
          </p>

          <p style={{ margin: 0 }}>
            لهذا تبدأ الأسرة بمتجر يمكنها من خلاله عرض منتجاتها والوصول إلى
            العملاء، ثم تنمو المنصة معها كلما نجحت تجارتها.
          </p>

          <p style={{ margin: 0 }}>
            نحن لا نريد أن نجعل البداية صعبة.
          </p>

          <p
            style={{
              margin: 0,
              color: t.colors.text.dark,
              fontWeight: t.typography.fontWeight.semibold,
            }}
          >
            نريد أن تكون البداية بسيطة.
          </p>

          <p
            style={{
              margin: `${t.spacing["1"]} 0 0`,
              color: t.colors.primary[800],
              fontWeight: t.typography.fontWeight.semibold,
            }}
          >
            ثم يأتي النمو عندما يصبح هناك منتج حقيقي وعملاء حقيقيون.
          </p>
        </div>
      </StorySection>

      <StorySection title="التراث لا يجب أن يبقى في الماضي">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: t.spacing["4"],
            color: t.colors.text.body,
            fontSize: t.typography.fontSize.base,
            lineHeight: 2,
          }}
        >
          <p style={{ margin: 0 }}>
            نحب الأشياء القديمة، ليس لأنها قديمة فقط، وإنما لأنها تحمل
            شيئًا منّا.
          </p>

          <p style={{ margin: 0 }}>
            البيوت القديمة، السدو، الحرف اليدوية، المنتجات الشعبية، وصفات
            الأمهات، الأسواق والبسطات… كلها أجزاء من ذاكرة مجتمع.
          </p>

          <p style={{ margin: 0 }}>
            لكن الحفاظ على التراث لا يعني أن نضعه خلف زجاج ونشاهده فقط.
          </p>

          <p style={{ margin: 0 }}>
            يمكن أن يعيش التراث من جديد عندما يجد من يصنعه سوقًا، ويجد من
            يقدّره طريقة سهلة للوصول إليه.
          </p>

          <p
            style={{
              margin: `${t.spacing["1"]} 0`,
              color: t.colors.text.dark,
              fontWeight: t.typography.fontWeight.semibold,
            }}
          >
            بسطة تريد أن تكون واحدة من المساحات التي يلتقي فيها التراث
            بالسوق الحديث.
          </p>

          <p
            style={{
              margin: `${t.spacing["1"]} 0 0`,
              padding: `${t.spacing["4"]} ${t.spacing["5"]}`,
              borderRadius: t.radius.lg,
              background: t.colors.cream.warm,
              borderInlineStart: `3px solid ${t.colors.gold[600]}`,
              color: t.colors.primary[800],
              fontSize: t.typography.fontSize.lg,
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.9,
            }}
          >
            بصورة أجمل، ومحتوى أفضل، وتجربة رقمية تفتح هذه المنتجات أمام جيل
            جديد من العملاء.
          </p>
        </div>
      </StorySection>
    </>
  );
}