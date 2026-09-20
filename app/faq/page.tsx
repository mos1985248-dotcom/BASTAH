
// app/faq/page.tsx
import type { Metadata } from "next";
import SiteShell from "@/components/layout/SiteShell";
import PricingFAQ from "@/components/pricing/PricingFAQ";
import { ArrowRight, Sparkles } from "lucide-react";
import { t } from "@/theme";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة | بسطة",
  description:
    "إجابات عن الاشتراكات والباقات والشحن ومنيرة وغيرها من الأسئلة الشائعة في بسطة.",
};

export default function FAQPage() {
  return (
    <SiteShell>
      <main
        dir="rtl"
        style={{
          width: "100%",
          boxSizing: "border-box",
          paddingBottom: t.spacing["16"],
        }}
      >
        {/* رأس الصفحة */}
        <section
          style={{
            width: "100%",
            maxWidth: 980,
            margin: "0 auto",
            padding: `${t.spacing["12"]} ${t.spacing["4"]} ${t.spacing["4"]}`,
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              marginBottom: t.spacing["3"],
              padding: "6px 11px",
              borderRadius: t.radius.full,
              background: "rgba(217,179,108,0.12)",
              border: "1px solid rgba(217,179,108,0.22)",
              color: t.colors.gold[600],
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.bold,
            }}
          >
            <Sparkles size={14} strokeWidth={1.8} />
            مركز المساعدة
          </div>

          <h1
            style={{
              margin: `0 0 ${t.spacing["2"]}`,
              color: t.colors.text.dark,
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.3,
            }}
          >
            الأسئلة الشائعة
          </h1>

          <p
            style={{
              maxWidth: 620,
              margin: "0 auto",
              color: t.colors.text.mid,
              fontSize: t.typography.fontSize.base,
              lineHeight: 1.8,
            }}
          >
            إجابات مختصرة عن باقات بسطة، الاشتراك، الشحن والخدمات المتاحة
            لمتجرك.
          </p>
        </section>

        {/* الأسئلة */}
        <PricingFAQ />

        {/* العودة إلى الباقات */}
        <section
          style={{
            width: "100%",
            maxWidth: 980,
            margin: `${t.spacing["6"]} auto 0`,
            padding: `0 ${t.spacing["4"]}`,
            boxSizing: "border-box",
          }}
        >
          <a
            href="/pricing"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "fit-content",
              margin: "0 auto",
              padding: "11px 18px",
              borderRadius: t.radius.md,
              background: t.colors.primary[800],
              color: t.colors.white,
              textDecoration: "none",
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.bold,
              transition: `transform ${t.motion.fast} ${t.motion.ease}`,
            }}
          >
            <ArrowRight size={16} strokeWidth={2} />
            استعرض الباقات والأسعار
          </a>
        </section>
      </main>
    </SiteShell>
  );
}
