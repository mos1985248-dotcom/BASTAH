// components/about/AboutStoryPart1.tsx
import { t } from "@/theme";
import StorySection from "./StorySection";

export default function AboutStoryPart1() {
  return (
    <>
      <StorySection title='لماذا "بسطة"؟' alt>
        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
          <p style={{ margin: 0 }}>اسم بسطة يحمل شيئًا من ذاكرتنا.</p>
          <p style={{ margin: 0 }}>البسطة كانت بسيطة، قريبة، ومفتوحة للناس.</p>
          <p style={{ margin: 0 }}>
            كانت الأم تعرض ما تصنعه، والأسرة تبيع ما تنتجه، والناس يعرفون المنتج وصاحبه، ويتحدثون معه، ويعودون إليه
            لأنهم وثقوا به.
          </p>
          <p style={{ margin: 0 }}>أردنا أن نأخذ هذه الروح ونمنحها مكانًا جديدًا في العالم الرقمي.</p>
          <p style={{ margin: 0, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primary[800] }}>
            لذلك جاءت بسطة كسوق رقمي للمنتجات الشعبية ومنتجات الأسر المنتجة، لكن بروح مختلفة.
          </p>
        </div>
      </StorySection>

      <StorySection title="نحن لا نبيع المنتج فقط">
        <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
          <p style={{ margin: 0 }}>نؤمن أن المنتج الشعبي لا يُقاس بسعره فقط.</p>
          <p style={{ margin: 0 }}>وراء قطعة يدوية قد تكون هناك سنوات من التعلم.</p>
          <p style={{ margin: 0 }}>وراء وصفة منزلية قد تكون ذاكرة أم أو جدة.</p>
          <p style={{ margin: 0 }}>وراء منتج شعبي قد يكون جزء من تاريخ عائلة أو منطقة.</p>
          <p style={{ margin: 0 }}>ولهذا نمنح المتجر في بسطة مساحة أكبر من مجرد قائمة منتجات.</p>
          <p style={{ margin: 0 }}>
            يمكن أن يكون للمتجر قصة وصور وفيديو ومحتوى يحكي للعميل من هم أصحاب المتجر، وكيف بدأوا، وما الذي يجعل
            منتجاتهم مختلفة.
          </p>
          <p style={{ margin: 0, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
            فالعميل لا يرى المنتج فقط؛ بل يستطيع أن يعرف الحكاية التي وراءه.
          </p>
        </div>
      </StorySection>
    </>
  );
}