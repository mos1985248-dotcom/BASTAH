// components/layout/FooterNewsletter.tsx
"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { t } from "@/theme";

export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div style={{ background: t.colors.primary[800], borderBottom: `1px solid ${t.colors.primary[700]}` }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: `${t.spacing["8"]} ${t.spacing["4"]}`,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: t.spacing["6"],
        }}
      >
        <div>
          <h3 style={{ color: t.colors.text.onDark, fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, margin: `0 0 ${t.spacing["1"]}` }}>
            انضم إلى نشرتنا البريدية
          </h3>
          <p style={{ color: t.colors.text.onDarkMuted, fontSize: t.typography.fontSize.base, margin: 0 }}>
            كن أول من يعرف بالعروض والمنتجات الجديدة من الأسر المنتجة
          </p>
        </div>

        {sent ? (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: t.colors.gold[400], fontSize: t.typography.fontSize.base, fontWeight: t.typography.fontWeight.semibold }}>
            <Check size={18} strokeWidth={2.5} />
            تم الاشتراك بنجاح، شكراً لك!
          </span>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email.trim()) setSent(true);
            }}
            style={{ display: "flex", gap: t.spacing["3"], width: "100%", maxWidth: 420 }}
          >
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="أدخل بريدك الإلكتروني"
              style={{
                padding: `14px ${t.spacing["5"]}`,
                borderRadius: t.radius.full,
                border: `1.5px solid ${t.colors.primary[600]}`,
                fontSize: t.typography.fontSize.base,
                direction: "rtl",
                outline: "none",
                flex: 1,
                background: t.colors.primary[900],
                color: t.colors.text.onDark,
              }}
            />
            <button
              type="submit"
              className="basita-btn-interactive"
              style={{
                padding: `14px ${t.spacing["6"]}`,
                borderRadius: t.radius.full,
                border: "none",
                background: t.colors.gold[600],
                color: t.colors.text.onDark,
                fontWeight: t.typography.fontWeight.bold,
                fontSize: t.typography.fontSize.base,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              اشترك الآن
            </button>
          </form>
        )}
      </div>
    </div>
  );
}