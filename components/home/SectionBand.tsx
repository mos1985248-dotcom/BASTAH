// components/home/SectionBand.tsx
// غلاف موحّد يفصل أقسام الصفحة الرئيسية بشرائط خلفية كاملة العرض.
// يحافظ على تدرّج بصري هادئ بين الأقسام دون إضافة زخارف أو ظلال
// قد تجعل الصفحة مزدحمة.

import { ReactNode } from "react";
import { t } from "@/theme";

const TONES = {
  // أبيض ناصع — للأقسام الرئيسية ذات المحتوى البطاقي.
  white: t.colors.cream.card,

  // أخضر فاتح جدًا من هوية بسطة — يستخدم لإبراز الأقسام الداعمة.
  tint: t.colors.primary[50],

  // شفاف — يحافظ على خلفية الصفحة الطبيعية.
  transparent: "transparent",
} as const;

export default function SectionBand({
  tone = "transparent",
  divider = true,
  children,
}: {
  tone?: keyof typeof TONES;
  divider?: boolean;
  children: ReactNode;
}) {
  const showDivider = divider && tone !== "transparent";

  return (
    <div
      style={{
        background: TONES[tone],
        borderTop: showDivider
          ? `1px solid ${t.colors.cream.borderLight}`
          : "none",
      }}
    >
      {children}
    </div>
  );
}