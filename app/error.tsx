// app/error.tsx — يلتقط أخطاء التشغيل داخل أي صفحة ويعرض بديلاً مرتباً مع إعادة محاولة
"use client";

import { useEffect } from "react";
import { t } from "@/theme";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app/error]", error.digest ?? "", error);
  }, [error]);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: `${t.spacing["16"]} ${t.spacing["4"]}` }}>
      <h1 style={{ margin: `0 0 ${t.spacing["2"]}`, fontSize: t.typography.fontSize.xl, color: t.colors.primary[800] }}>حدث خطأ غير متوقع</h1>
      <p style={{ margin: `0 0 ${t.spacing["5"]}`, fontSize: t.typography.fontSize.sm, color: t.colors.text.mid }}>
        نعتذر عن ذلك. جرّبي مرة أخرى، وإن استمرت المشكلة تواصلي مع الدعم.
        {error.digest && <span style={{ display: "block", marginTop: 6, fontSize: 11, color: t.colors.text.light }}>رمز الخطأ: {error.digest}</span>}
      </p>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={reset} style={{ padding: "12px 28px", background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: t.radius.full, fontWeight: t.typography.fontWeight.bold, cursor: "pointer" }}>
          إعادة المحاولة
        </button>
        <a href="/" style={{ padding: "12px 28px", border: `1px solid ${t.colors.cream.border}`, color: t.colors.text.dark, borderRadius: t.radius.full, textDecoration: "none" }}>
          الرئيسية
        </a>
      </div>
    </div>
  );
}
