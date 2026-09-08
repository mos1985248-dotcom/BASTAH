// components/about/AboutStoreLife.tsx
import { t } from "@/theme";
import StorySection from "./StorySection";

export default function AboutStoreLife() {
  return (
    <StorySection title="لكل متجر حكاية" alt>
      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
        <p style={{ margin: 0 }}>لهذا لا ننظر إلى متاجر بسطة على أنها متشابهة.</p>
        <p style={{ margin: 0 }}>قد تجد أسرة تصنع الحلويات المنزلية.</p>
        <p style={{ margin: 0 }}>وأخرى تقدم منتجات يدوية.</p>
        <p style={{ margin: 0 }}>وأخرى تحافظ على حرفة شعبية.</p>
        <p style={{ margin: 0 }}>وأخرى تبيع منتجًا بدأ من وصفة عائلية قديمة.</p>
        <p style={{ margin: 0 }}>كل واحدة منها تستحق أن تُروى قصتها بطريقتها.</p>
        <p style={{ margin: 0 }}>وهنا يأتي دور المحتوى في بسطة.</p>
        <p style={{ margin: 0 }}>المتجر ليس مجرد واجهة للبيع؛ بل مساحة يمكن أن تعرّف الناس بالأسرة ومنتجاتها وتاريخها.</p>
        <p style={{ margin: 0, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>
          نريد أن يكتشف العميل المنتج، ثم يكتشف القصة، ثم يشعر بأنه اشترى شيئًا له معنى.
        </p>
      </div>
    </StorySection>
  );
}