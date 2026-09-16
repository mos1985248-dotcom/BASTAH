// components/about/AboutPeopleFirst.tsx

import { t } from "@/theme";
import StorySection from "./StorySection";

export default function AboutPeopleFirst() {
  return (
    <StorySection title="بسطة تبدأ من الناس">
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
          لا نريد أن نبني منصة بمعزل عن السوق ثم نطلب من الناس استخدامها.
        </p>

        <p
          style={{
            margin: `${t.spacing["1"]} 0`,
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
          نريد أن نتعلم منهم.
        </p>

        <p style={{ margin: 0 }}>
          سنبدأ مع عدد محدود من الأسر المنتجة، ونستمع إلى تجربتهم، ونراقب
          كيف يستخدمون المنصة، وما الذي يحتاجونه، وما الذي يمكن أن نجعله
          أبسط.
        </p>

        <p style={{ margin: 0 }}>
          ثم نستمع إلى العملاء أيضًا.
        </p>

        <p style={{ margin: 0 }}>
          لأن أفضل نسخة من بسطة لن تأتي من التخمين.
        </p>

        <p
          style={{
            margin: `${t.spacing["1"]} 0 0`,
            color: t.colors.primary[800],
            fontWeight: t.typography.fontWeight.semibold,
          }}
        >
          ستأتي من الناس الذين يستخدمونها.
        </p>
      </div>
    </StorySection>
  );
}