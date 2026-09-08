// components/about/AboutTech.tsx
import { t } from "@/theme";
import StorySection from "./StorySection";

export default function AboutTech() {
  return (
    <StorySection title="التقنية في خدمة الحكاية" alt>
      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
        <p style={{ margin: 0 }}>نحن نستخدم التقنية، والذكاء الاصطناعي، والمحتوى الرقمي، ليس لمجرد أن نقول إن بسطة منصة تقنية.</p>
        <p style={{ margin: 0, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>التقنية عندنا وسيلة.</p>
        <p style={{ margin: 0 }}>وسيلة تساعد الأسرة على عرض منتجاتها.</p>
        <p style={{ margin: 0 }}>وسيلة تساعد العميل على اكتشاف ما يبحث عنه.</p>
        <p style={{ margin: 0 }}>وسيلة تجعل المتجر أكثر حيوية من مجرد صور وأسعار.</p>
        <p style={{ margin: 0 }}>ووسيلة تجعل الوصول إلى المنتجات الشعبية أسهل، حتى عندما تكون الأسرة التي تصنعها بعيدة عن الأسواق الكبيرة.</p>
        <p style={{ margin: 0, fontWeight: t.typography.fontWeight.medium, color: t.colors.primary[800] }}>
          ولهذا نطوّر أدوات مثل منيرة لمساعدة المستخدمين على اكتشاف المنتجات والتفاعل معها بلغات مختلفة، مع بقاء
          المنتج والأسرة وقصتهما في قلب التجربة.
        </p>
      </div>
    </StorySection>
  );
}