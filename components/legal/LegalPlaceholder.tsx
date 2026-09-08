// components/legal/LegalPlaceholder.tsx
// يميّز بصرياً أي قيمة لم تُحسم بعد بالنص القانوني (تاريخ، مدة، بريد
// دعم...) — إشارة واضحة أنها تحتاج تعبئة لاحقاً قبل النشر الرسمي، بدل أن
// تختفي بين النص العادي.
import { t } from "@/theme";

export default function LegalPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ background: t.colors.gold[200], color: t.colors.gold[700], padding: "1px 6px", borderRadius: t.radius.sm, fontWeight: t.typography.fontWeight.bold, fontSize: "0.92em" }}>
      {children}
    </span>
  );
}
