// components/about/AboutGlobalReach.tsx
import { t } from "@/theme";
import StorySection from "./StorySection";

export default function AboutGlobalReach() {
  return (
    <StorySection title="من السوق المحلي إلى العالم">
      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
        <p style={{ margin: 0 }}>بدأت الفكرة من الأسرة والمنتج الشعبي، لكننا نرى أن هذه المنتجات قادرة على الوصول إلى جمهور أكبر.</p>
        <p style={{ margin: 0 }}>السائح الذي يزور المملكة قد يبحث عن قطعة صغيرة تحمل معه ذكرى من المكان.</p>
        <p style={{ margin: 0 }}>والشخص الذي يعيش بعيدًا عن وطنه قد يجد في منتج شعبي شيئًا يعيده إلى ذاكرة البيت.</p>
        <p style={{ margin: 0 }}>والعميل خارج المنطقة قد يهتم بمنتج مصنوع يدويًا ويحمل هوية وثقافة مختلفة.</p>
        <p style={{ margin: 0, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primary[800] }}>
          لهذا صُممت بسطة لتكون قابلة للوصول إلى جمهور متعدد اللغات، دون أن تفقد المنتجات هويتها الأصلية.
        </p>
      </div>
    </StorySection>
  );
}