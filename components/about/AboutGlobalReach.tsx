// components/about/AboutGlobalReach.tsx

import { t } from "@/theme";
import StorySection from "./StorySection";

export default function AboutGlobalReach() {
  return (
    <StorySection title="من السوق المحلي إلى العالم">
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
          بدأت الفكرة من الأسرة والمنتج الشعبي، لكننا نرى أن هذه المنتجات
          قادرة على الوصول إلى جمهور أكبر.
        </p>

        <p style={{ margin: 0 }}>
          السائح الذي يزور المملكة قد يبحث عن قطعة صغيرة تحمل معه ذكرى من
          المكان.
        </p>

        <p style={{ margin: 0 }}>
          والشخص الذي يعيش بعيدًا عن وطنه قد يجد في منتج شعبي شيئًا يعيده إلى
          ذاكرة البيت.
        </p>

        <p style={{ margin: 0 }}>
          والعميل خارج المنطقة قد يهتم بمنتج مصنوع يدويًا ويحمل هوية وثقافة
          مختلفة.
        </p>

        <p
          style={{
            margin: t.spacing["2"] + " 0 0",
            padding: `${t.spacing["4"]} ${t.spacing["5"]}`,
            borderRadius: t.radius.lg,
            background: t.colors.primary[50],
            borderInlineStart: `3px solid ${t.colors.primary[700]}`,
            color: t.colors.primary[800],
            fontWeight: t.typography.fontWeight.semibold,
            lineHeight: 1.9,
          }}
        >
          لهذا صُممت بسطة لتكون قابلة للوصول إلى جمهور متعدد اللغات، دون أن
          تفقد المنتجات هويتها الأصلية.
        </p>
      </div>
    </StorySection>
  );
}