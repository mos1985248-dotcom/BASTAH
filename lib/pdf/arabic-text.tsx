// lib/pdf/arabic-text.tsx
// ⚠️ إصلاح خلل مؤكَّد بالاختبار في محرك النصوص بمكتبة @react-pdf/renderer
// (fontkit/textkit): أي سطر عربي طويل يحوي رقماً لاتينياً في وسطه (مثل
// "شقة 3 الدور" أو "تحصيله 73 ر.س") يُنتج حروفاً مشوَّهة فيما بعد الرقم —
// تجربة موثّقة بعدة محاولات (تشكيل مسبق، عزل bidi، إعادة ترتيب يدوية) لم
// تُصلحه. الإصلاح الوحيد الذي أعطى نتيجة صحيحة 100% بالاختبار: تقسيم النص
// إلى كلمات، وعرض كل كلمة بعنصر <Text> مستقل شقيق (لا متداخل) داخل حاوية
// flexDirection: row-reverse + flexWrap — هذا يمنع محرك التنسيق من معالجة
// سطر واحد طويل مختلط فيتفادى الخلل تماماً. التكلفة: لا التفاف نص مُبرَّر
// (justify) على مستوى الحرف، وهو غير مهم لتسمية شحن قصيرة.
import React from "react";
import { View, Text } from "@react-pdf/renderer";

export function ArabicText({
  children, style, wrap = true,
}: { children: string; style?: any; wrap?: boolean }) {
  const text = children ?? "";
  if (!wrap) return <Text style={style}>{text}</Text>;
  const tokens = text.split(" ").filter((t) => t.length > 0);
  return (
    <View style={{ flexDirection: "row-reverse", flexWrap: "wrap" }}>
      {tokens.map((tok, i) => (
        <Text key={i} style={[{ marginLeft: 3 }, style]}>{tok}</Text>
      ))}
    </View>
  );
}
