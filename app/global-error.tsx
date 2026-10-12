// app/global-error.tsx — خطأ في الـlayout الجذري نفسه: يحلّ محله بالكامل،
// فيجب أن يحمل <html>/<body> ولا يعتمد على أي provider أو خط محمَّل.
"use client";

import { t } from "@/theme";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: t.colors.cream.bg }}>
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: "96px 16px" }}>
          <h1 style={{ margin: "0 0 8px", fontSize: 22, color: t.colors.primary[800] }}>تعذّر تحميل بسطة</h1>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: t.colors.text.mid }}>
            حدث خطأ غير متوقع. حدّثي الصفحة، وإن استمر فحاولي لاحقاً.
            {error.digest && <span style={{ display: "block", marginTop: 6, fontSize: 11 }}>رمز الخطأ: {error.digest}</span>}
          </p>
          <button onClick={reset} style={{ padding: "12px 28px", background: t.colors.primary[800], color: t.colors.white, border: "none", borderRadius: 999, fontWeight: 700, cursor: "pointer" }}>
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
