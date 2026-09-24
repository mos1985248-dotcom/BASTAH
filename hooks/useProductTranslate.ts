// hooks/useProductTranslate.ts
// نقل حرفي لمنطق الترجمة التلقائية (منيرة) من صفحة تعديل المنتج — بلا تغيير سلوك،
// فقط لإبقاء الصفحة ضمن حد الأسطر بعد إضافة بطاقة المتغيرات.
"use client";

import { useState } from "react";

export function useProductTranslate(
  form: { nameAr: string; shortDescAr: string },
  onResult: (r: { nameEn: string; shortDescEn: string }) => void,
  onError: (message: string) => void
) {
  const [translating, setTranslating] = useState(false);

  const translateToEnglish = async () => {
    if (!form.nameAr) return;
    setTranslating(true);
    onError("");
    try {
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.nameAr, description: form.shortDescAr, from: "ar", to: "en" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "فشل الترجمة");
      onResult({ nameEn: data.title ?? "", shortDescEn: data.description ?? "" });
    } catch (err: any) {
      onError(err.message ?? "تعذّر الترجمة");
    } finally {
      setTranslating(false);
    }
  };

  return { translating, translateToEnglish };
}
