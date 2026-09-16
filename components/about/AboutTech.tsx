// components/about/AboutTech.tsx

import { t } from "@/theme";
import StorySection from "./StorySection";

export default function AboutTech() {
  return (
    <StorySection title="التقنية في خدمة الحكاية" alt>
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
          نحن نستخدم التقنية، والذكاء الاصطناعي، والمحتوى الرقمي، ليس لمجرد
          أن نقول إن بسطة منصة تقنية.
        </p>

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
          التقنية عندنا وسيلة.
        </p>

        <p style={{ margin: 0 }}>
          وسيلة تساعد الأسرة على عرض منتجاتها.
        </p>

        <p style={{ margin: 0 }}>
          وسيلة تساعد العميل على اكتشاف ما يبحث عنه.
        </p>

        <p style={{ margin: 0 }}>
          وسيلة تجعل المتجر أكثر حيوية من مجرد صور وأسعار.
        </p>

        <p style={{ margin: 0 }}>
          ووسيلة تجعل الوصول إلى المنتجات الشعبية أسهل، حتى عندما تكون الأسرة
          التي تصنعها بعيدة عن الأسواق الكبيرة.
        </p>

        <p
          style={{
            margin: `${t.spacing["2"]} 0 0`,
            padding: `${t.spacing["4"]} ${t.spacing["5"]}`,
            borderRadius: t.radius.lg,
            background: t.colors.cream.warm,
            borderInlineStart: `3px solid ${t.colors.gold[600]}`,
            color: t.colors.primary[800],
            fontWeight: t.typography.fontWeight.semibold,
            lineHeight: 1.9,
          }}
        >
          ولهذا نطوّر أدوات مثل منيرة لمساعدة المستخدمين على اكتشاف المنتجات
          والتفاعل معها بلغات مختلفة، مع بقاء المنتج والأسرة وقصتهما في قلب
          التجربة.
        </p>
      </div>
    </StorySection>
  );
}