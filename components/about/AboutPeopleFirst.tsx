// components/about/AboutPeopleFirst.tsx
import { t } from "@/theme";
import StorySection from "./StorySection";

export default function AboutPeopleFirst() {
  return (
    <StorySection title="بسطة تبدأ من الناس">
      <div style={{ display: "flex", flexDirection: "column", gap: t.spacing["3"] }}>
        <p style={{ margin: 0 }}>لا نريد أن نبني منصة بمعزل عن السوق ثم نطلب من الناس استخدامها.</p>
        <p style={{ margin: 0, fontWeight: t.typography.fontWeight.bold, color: t.colors.primary[800] }}>نريد أن نتعلم منهم.</p>
        <p style={{ margin: 0 }}>سنبدأ مع عدد محدود من الأسر المنتجة، ونستمع إلى تجربتهم، ونراقب كيف يستخدمون المنصة، وما الذي يحتاجونه، وما الذي يمكن أن نجعله أبسط.</p>
        <p style={{ margin: 0 }}>ثم نستمع إلى العملاء أيضًا.</p>
        <p style={{ margin: 0 }}>لأن أفضل نسخة من بسطة لن تأتي من التخمين.</p>
        <p style={{ margin: 0, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primary[800] }}>ستأتي من الناس الذين يستخدمونها.</p>
      </div>
    </StorySection>
  );
}