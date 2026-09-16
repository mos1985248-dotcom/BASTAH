// components/about/AboutStoreLife.tsx

import { t } from "@/theme";
import StorySection from "./StorySection";

export default function AboutStoreLife() {
  return (
    <StorySection title="لكل متجر حكاية" alt>
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
          لهذا لا ننظر إلى متاجر بسطة على أنها متشابهة.
        </p>

        <p style={{ margin: 0 }}>
          قد تجد أسرة تصنع الحلويات المنزلية.
        </p>

        <p style={{ margin: 0 }}>
          وأخرى تقدم منتجات يدوية.
        </p>

        <p style={{ margin: 0 }}>
          وأخرى تحافظ على حرفة شعبية.
        </p>

        <p style={{ margin: 0 }}>
          وأخرى تبيع منتجًا بدأ من وصفة عائلية قديمة.
        </p>

        <p
          style={{
            margin: `${t.spacing["1"]} 0`,
            color: t.colors.text.dark,
            fontWeight: t.typography.fontWeight.semibold,
          }}
        >
          كل واحدة منها تستحق أن تُروى قصتها بطريقتها.
        </p>

        <p style={{ margin: 0 }}>
          وهنا يأتي دور المحتوى في بسطة.
        </p>

        <p style={{ margin: 0 }}>
          المتجر ليس مجرد واجهة للبيع؛ بل مساحة يمكن أن تعرّف الناس بالأسرة
          ومنتجاتها وتاريخها.
        </p>

        <p
          style={{
            margin: `${t.spacing["2"]} 0 0`,
            padding: `${t.spacing["4"]} ${t.spacing["5"]}`,
            borderRadius: t.radius.lg,
            background: t.colors.primary[50],
            borderInlineStart: `3px solid ${t.colors.primary[700]}`,
            color: t.colors.primary[800],
            fontSize: t.typography.fontSize.lg,
            fontWeight: t.typography.fontWeight.bold,
            lineHeight: 1.9,
          }}
        >
          نريد أن يكتشف العميل المنتج، ثم يكتشف القصة، ثم يشعر بأنه اشترى
          شيئًا له معنى.
        </p>
      </div>
    </StorySection>
  );
}