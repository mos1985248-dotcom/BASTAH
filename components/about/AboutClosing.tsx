// components/about/AboutClosing.tsx

import { t } from "@/theme";

export default function AboutClosing() {
  return (
    <section
      style={{
        background: t.colors.cream.warm,
        padding: `${t.spacing["12"]} ${t.spacing["4"]} ${t.spacing["10"]}`,
        textAlign: "center",
        direction: "rtl",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        {/* العنوان */}
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              margin: `0 0 ${t.spacing["5"]}`,
              color: t.colors.primary[800],
              fontSize: t.typography.fontSize["3xl"],
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.5,
            }}
          >
            هذه هي بسطة
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: t.spacing["2"],
              marginBottom: t.spacing["6"],
              color: t.colors.text.body,
              fontSize: t.typography.fontSize.base,
              lineHeight: 2,
            }}
          >
            <p style={{ margin: 0 }}>
              بسطة ليست مجرد مكان لبيع المنتجات.
            </p>

            <p style={{ margin: 0 }}>
              هي محاولة لبناء سوق رقمي يحتفظ بشيء من روح الأسواق القديمة.
            </p>

            <p style={{ margin: 0 }}>
              مكان تستطيع فيه الأسرة أن تعرض ما تصنعه.
            </p>

            <p style={{ margin: 0 }}>
              ويستطيع فيه العميل أن يكتشف منتجًا جديدًا.
            </p>

            <p style={{ margin: 0 }}>
              وتستطيع فيه قصة قديمة أن تجد جمهورًا جديدًا.
            </p>

            <p style={{ margin: 0 }}>
              نحن نؤمن أن دعم الأسرة المنتجة ليس مجرد شعار.
            </p>

            <p style={{ margin: 0 }}>
              إنه السبب الذي بدأنا من أجله.
            </p>

            <p style={{ margin: 0 }}>
              وأن المنتج الشعبي ليس مجرد سلعة.
            </p>

            <p
              style={{
                margin: `${t.spacing["2"]} 0 0`,
                color: t.colors.primary[800],
                fontSize: t.typography.fontSize.lg,
                fontWeight: t.typography.fontWeight.bold,
                lineHeight: 1.9,
              }}
            >
              إنه جزء من قصة، وذاكرة، وحرفة، وهوية تستحق أن تُرى.
            </p>
          </div>
        </div>

        {/* الخاتمة المختصرة */}
        <div
          style={{
            background: `linear-gradient(135deg, ${t.colors.primary[950]}, ${t.colors.primary[800]})`,
            borderRadius: t.radius.xl,
            padding: `${t.spacing["6"]} ${t.spacing["5"]}`,
            boxShadow: t.shadows.md,
          }}
        >
          <p
            style={{
              margin: `0 0 ${t.spacing["1"]}`,
              color: t.colors.gold[400],
              fontSize: t.typography.fontSize["2xl"],
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.4,
            }}
          >
            بسطة
          </p>

          <p
            style={{
              margin: 0,
              color: t.colors.text.onDark,
              fontSize: t.typography.fontSize.base,
              fontWeight: t.typography.fontWeight.semibold,
            }}
          >
            دعم الأسرة المنتجة.
          </p>

          <p
            style={{
              maxWidth: 560,
              margin: `${t.spacing["2"]} auto ${t.spacing["5"]}`,
              color: t.colors.text.onDarkMuted,
              fontSize: t.typography.fontSize.sm,
              lineHeight: 1.8,
            }}
          >
            نأخذ روح البسطة القديمة، ونمنحها مكانًا جديدًا في العالم الرقمي.
          </p>

          {/* الأزرار */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: t.spacing["3"],
              flexWrap: "wrap",
            }}
          >
            <a
              href="/marketplace"
              className="basita-btn-interactive"
              style={{
                minWidth: 145,
                padding: "11px 24px",
                background: t.colors.gold[600],
                color: t.colors.primary[950],
                borderRadius: t.radius.full,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                textDecoration: "none",
              }}
            >
              تسوّقي الآن
            </a>

            <a
              href="/register"
              className="basita-btn-interactive"
              style={{
                minWidth: 145,
                padding: "11px 24px",
                background: "rgba(255,255,255,0.08)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                color: t.colors.white,
                borderRadius: t.radius.full,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                textDecoration: "none",
              }}
            >
              ابدأ متجرك
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}