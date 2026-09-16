// components/about/AboutStoryPart1.tsx

import { t } from "@/theme";
import StorySection from "./StorySection";

export default function AboutStoryPart1() {
  return (
    <>
      <StorySection title='لماذا "بسطة"؟' alt>
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
            اسم بسطة يحمل شيئًا من ذاكرتنا.
          </p>

          <p
            style={{
              margin: 0,
              color: t.colors.text.dark,
              fontWeight: t.typography.fontWeight.semibold,
            }}
          >
            البسطة كانت بسيطة، قريبة، ومفتوحة للناس.
          </p>

          <p style={{ margin: 0 }}>
            كانت الأم تعرض ما تصنعه، والأسرة تبيع ما تنتجه، والناس يعرفون
            المنتج وصاحبه، ويتحدثون معه، ويعودون إليه لأنهم وثقوا به.
          </p>

          <p style={{ margin: 0 }}>
            أردنا أن نأخذ هذه الروح ونمنحها مكانًا جديدًا في العالم الرقمي.
          </p>

          <p
            style={{
              margin: `${t.spacing["1"]} 0 0`,
              padding: `${t.spacing["4"]} ${t.spacing["5"]}`,
              background: t.colors.primary[50],
              borderRadius: t.radius.lg,
              borderInlineStart: `3px solid ${t.colors.primary[700]}`,
              color: t.colors.primary[800],
              fontWeight: t.typography.fontWeight.semibold,
              lineHeight: 1.9,
            }}
          >
            لذلك جاءت بسطة كسوق رقمي للمنتجات الشعبية ومنتجات الأسر المنتجة،
            لكن بروح مختلفة.
          </p>
        </div>
      </StorySection>

      <StorySection title="نحن لا نبيع المنتج فقط">
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
            نؤمن أن المنتج الشعبي لا يُقاس بسعره فقط.
          </p>

          <p style={{ margin: 0 }}>
            وراء قطعة يدوية قد تكون هناك سنوات من التعلم.
          </p>

          <p style={{ margin: 0 }}>
            وراء وصفة منزلية قد تكون ذاكرة أم أو جدة.
          </p>

          <p style={{ margin: 0 }}>
            وراء منتج شعبي قد يكون جزء من تاريخ عائلة أو منطقة.
          </p>

          <p
            style={{
              margin: `${t.spacing["1"]} 0`,
              color: t.colors.text.dark,
              fontWeight: t.typography.fontWeight.semibold,
            }}
          >
            ولهذا نمنح المتجر في بسطة مساحة أكبر من مجرد قائمة منتجات.
          </p>

          <p style={{ margin: 0 }}>
            يمكن أن يكون للمتجر قصة وصور وفيديو ومحتوى يحكي للعميل من هم
            أصحاب المتجر، وكيف بدأوا، وما الذي يجعل منتجاتهم مختلفة.
          </p>

          <p
            style={{
              margin: `${t.spacing["1"]} 0 0`,
              padding: `${t.spacing["4"]} ${t.spacing["5"]}`,
              background: t.colors.cream.warm,
              borderRadius: t.radius.lg,
              borderInlineStart: `3px solid ${t.colors.gold[600]}`,
              color: t.colors.primary[800],
              fontSize: t.typography.fontSize.lg,
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.9,
            }}
          >
            فالعميل لا يرى المنتج فقط؛ بل يستطيع أن يعرف الحكاية التي وراءه.
          </p>
        </div>
      </StorySection>
    </>
  );
}