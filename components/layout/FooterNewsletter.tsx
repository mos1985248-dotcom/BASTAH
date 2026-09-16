// components/layout/FooterNewsletter.tsx
"use client";

import { useState } from "react";
import { Check, Mail } from "lucide-react";
import { t } from "@/theme";

export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) return;

    // ملاحظة:
    // هذا يعرض نجاح الاشتراك فقط حاليًا.
    // ربط الحفظ الفعلي بالـ API يمكن إضافته لاحقًا.
    setSent(true);
  };

  return (
    <section
      className="basita-newsletter-section"
      style={{
        background: t.colors.primary[800],
        borderBottom: `1px solid ${t.colors.primary[700]}`,
      }}
    >
      <div
        style={{
          maxWidth: t.layout.containerMaxWidth,
          margin: "0 auto",
          padding: `${t.spacing["4"]} ${t.spacing["4"]}`,
        }}
      >
        <div
          className="basita-newsletter-inner"
          style={{
            maxWidth: 860,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: t.spacing["6"],
            direction: "rtl",
          }}
        >
          {/* العنوان والوصف */}
          <div
            className="basita-newsletter-copy"
            style={{
              display: "flex",
              alignItems: "center",
              gap: t.spacing["3"],
              minWidth: 0,
              flex: 1,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: t.radius.full,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Mail
                size={17}
                strokeWidth={1.9}
                color={t.colors.gold[400]}
              />
            </div>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <h3
                style={{
                  color: t.colors.text.onDark,
                  fontFamily: t.typography.fontFamily.heading,
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: t.typography.fontWeight.bold,
                  lineHeight: 1.35,
                  margin: 0,
                }}
              >
                انضم إلى نشرتنا البريدية
              </h3>

              <p
                style={{
                  color: t.colors.text.onDarkMuted,
                  fontSize: t.typography.fontSize.xs,
                  lineHeight: 1.6,
                  margin: "3px 0 0",
                }}
              >
                عروض جديدة ومنتجات مميزة وأخبار بسطة تصلك أولًا.
              </p>
            </div>
          </div>

          {/* النموذج */}
          {sent ? (
            <div
              className="basita-newsletter-success"
              style={{
                minHeight: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: `0 ${t.spacing["4"]}`,
                borderRadius: t.radius.full,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: t.colors.gold[400],
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                boxSizing: "border-box",
                flexShrink: 0,
              }}
            >
              <Check size={17} strokeWidth={2.5} />
              <span>تم الاشتراك بنجاح، شكرًا لك!</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="basita-newsletter-form"
              style={{
                width: 430,
                maxWidth: "100%",
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: 4,
                borderRadius: t.radius.full,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxSizing: "border-box",
                flexShrink: 0,
              }}
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="أدخل بريدك الإلكتروني"
                aria-label="البريد الإلكتروني"
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: 40,
                  padding: `0 ${t.spacing["4"]}`,
                  borderRadius: t.radius.full,
                  border: "none",
                  outline: "none",
                  background: "#FFFFFF",
                  color: t.colors.primary[900],
                  fontSize: t.typography.fontSize.xs,
                  direction: "rtl",
                  boxSizing: "border-box",
                }}
              />

              <button
                type="submit"
                className="basita-btn-interactive"
                style={{
                  minHeight: 40,
                  padding: `0 ${t.spacing["4"]}`,
                  borderRadius: t.radius.full,
                  border: "none",
                  background: t.colors.gold[600],
                  color: t.colors.text.onDark,
                  fontWeight: t.typography.fontWeight.bold,
                  fontSize: t.typography.fontSize.xs,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                اشترك الآن
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}