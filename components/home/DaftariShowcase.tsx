// components/home/DaftariShowcase.tsx
import { t } from "@/theme";
import {
  Wallet,
  Receipt,
  TrendingUp,
  ClipboardList,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";

const FEATURES: {
  Icon: LucideIcon;
  label: string;
}[] = [
  { Icon: Wallet, label: "تسجيل المدفوعات" },
  { Icon: Receipt, label: "تسجيل المصروفات" },
  { Icon: TrendingUp, label: "حساب الأرباح" },
  { Icon: ClipboardList, label: "تقارير سهلة وواضحة" },
];

export default function DaftariShowcase() {
  return (
    <section
      style={{
        maxWidth: t.layout.containerMaxWidth,
        margin: "0 auto",
        padding: `${t.spacing["10"]} ${t.spacing["4"]} 0`,
        direction: "rtl",
      }}
    >
      <div
        className="basita-daftari-shell"
        style={{
          display: "grid",
          gridTemplateColumns: "1.35fr 0.65fr",
          gap: t.spacing["6"],
          alignItems: "stretch",
          padding: t.spacing["6"],
          borderRadius: t.radius.xl,
          background: t.colors.cream.warm,
          border: `1px solid ${t.colors.cream.borderLight}`,
          boxShadow: t.shadows.xs,
          boxSizing: "border-box",
        }}
      >
        {/* المحتوى الرئيسي */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          {/* الشارة */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              alignSelf: "flex-start",
              gap: 8,
              marginBottom: t.spacing["3"],
              padding: "6px 11px",
              borderRadius: t.radius.full,
              background: t.colors.cream.card,
              border: `1px solid ${t.colors.gold[200]}`,
              color: t.colors.gold[700],
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              boxSizing: "border-box",
            }}
          >
            <Wallet size={15} strokeWidth={1.8} />
            أدوات تساعدك في إدارة متجرك
          </div>

          <h2
            style={{
              margin: `0 0 ${t.spacing["2"]}`,
              fontSize:
                t.typography.fontSize["2xl"] ?? t.typography.fontSize.xl,
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.primary[800],
              lineHeight: 1.4,
            }}
          >
            دفاتري — محاسبة بسيطة لمتجرك
          </h2>

          <p
            style={{
              margin: `0 0 ${t.spacing["5"]}`,
              maxWidth: 620,
              fontSize: t.typography.fontSize.sm,
              color: t.colors.text.mid,
              lineHeight: t.typography.lineHeight.relaxed,
            }}
          >
            تتبّعي مبيعاتك ومصروفاتك وأرباحك بدون تعقيد محاسبي، وخلي أرقام
            متجرك واضحة أمامك في كل وقت.
          </p>

          {/* المميزات */}
          <div
            className="basita-daftari-features"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: t.spacing["3"],
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="basita-daftari-feature"
                style={{
                  minHeight: 116,
                  padding: t.spacing["3"],
                  borderRadius: t.radius.lg,
                  background: t.colors.cream.card,
                  border: `1px solid ${t.colors.cream.borderLight}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  boxSizing: "border-box",
                  transition:
                    `transform ${t.motion.base} ${t.motion.ease}, ` +
                    `box-shadow ${t.motion.base} ${t.motion.ease}, ` +
                    `border-color ${t.motion.base} ${t.motion.ease}`,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: t.radius.md,
                    background: t.colors.gold[100],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  <f.Icon
                    size={21}
                    strokeWidth={1.75}
                    color={t.colors.gold[700]}
                  />
                </div>

                <div
                  style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.text.body,
                    fontWeight: t.typography.fontWeight.semibold,
                    lineHeight: 1.5,
                  }}
                >
                  {f.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* بطاقة بدون عمولات */}
        <div
          className="basita-daftari-benefit"
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: 300,
            padding: t.spacing["6"],
            borderRadius: t.radius.lg,
            background: `linear-gradient(145deg, ${t.colors.primary[950]}, ${t.colors.primary[800]})`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          {/* لمسة زخرفية بسيطة */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 150,
              height: 150,
              borderRadius: "50%",
              top: -85,
              left: -70,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 100,
              height: 100,
              borderRadius: "50%",
              bottom: -55,
              right: -35,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                margin: `0 auto ${t.spacing["3"]}`,
                borderRadius: t.radius.lg,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp
                size={25}
                strokeWidth={1.8}
                color={t.colors.gold[400]}
              />
            </div>

            <p
              style={{
                margin: `0 0 ${t.spacing["2"]}`,
                fontSize: t.typography.fontSize.xl,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.text.onDark,
              }}
            >
              بدون عمولات
            </p>

            <p
              style={{
                margin: `0 0 ${t.spacing["5"]}`,
                fontSize: t.typography.fontSize.sm,
                color: t.colors.text.onDarkMuted,
                lineHeight: t.typography.lineHeight.relaxed,
              }}
            >
              جميع متاجر بسطة مرتبطة بحساباتها مباشرة — لا توجد أي عمولة على
              المبيعات، فقط رسوم اشتراك ثابتة شهريًا.
            </p>

            <a
              href="/pricing"
              className="basita-daftari-link"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                textDecoration: "none",
                color: t.colors.gold[400],
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                transition: `color ${t.motion.fast} ${t.motion.ease}`,
              }}
            >
              تعرّف على الباقات
              <ArrowLeft
                size={15}
                strokeWidth={2}
                style={{ transform: "rotate(180deg)" }}
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}