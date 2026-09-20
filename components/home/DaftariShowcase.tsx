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
      className="basita-daftari-section"
      style={{
        maxWidth: t.layout.containerMaxWidth,
        margin: "0 auto",
        padding: `${t.spacing["10"]} ${t.spacing["4"]} 0`,
        direction: "rtl",
        boxSizing: "border-box",
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
          className="basita-daftari-main"
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
                    flexShrink: 0,
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
            className="basita-daftari-benefit-content"
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
                lineHeight: 1.4,
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

      <style>{`
        /* =========================
           Daftari - Tablet
           ========================= */
        @media (max-width: 980px) {
          .basita-daftari-shell {
            grid-template-columns: minmax(0, 1fr) minmax(260px, 0.72fr) !important;
            gap: 16px !important;
            padding: 20px !important;
          }

          .basita-daftari-features {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .basita-daftari-feature {
            min-height: 100px !important;
          }

          .basita-daftari-benefit {
            min-height: 100% !important;
            padding: 22px !important;
          }
        }

        /* =========================
           Daftari - Mobile
           ========================= */
        @media (max-width: 767px) {
          .basita-daftari-section {
            padding: 28px 10px 0 !important;
          }

          .basita-daftari-shell {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            padding: 12px !important;
            border-radius: 18px !important;
          }

          .basita-daftari-main {
            width: 100% !important;
          }

          .basita-daftari-main > div:first-child {
            margin-bottom: 9px !important;
            padding: 5px 9px !important;
            gap: 6px !important;
            font-size: 11px !important;
          }

          .basita-daftari-main > div:first-child svg {
            width: 14px !important;
            height: 14px !important;
          }

          .basita-daftari-main h2 {
            margin-bottom: 6px !important;
            font-size: 20px !important;
            line-height: 1.45 !important;
          }

          .basita-daftari-main > p {
            margin-bottom: 13px !important;
            font-size: 12.5px !important;
            line-height: 1.8 !important;
          }

          .basita-daftari-features {
            width: 100% !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 7px !important;
          }

          .basita-daftari-feature {
            min-height: 82px !important;
            padding: 9px 6px !important;
            border-radius: 12px !important;
          }

          .basita-daftari-feature > div:first-child {
            width: 34px !important;
            height: 34px !important;
            margin-bottom: 5px !important;
            border-radius: 9px !important;
          }

          .basita-daftari-feature > div:first-child svg {
            width: 18px !important;
            height: 18px !important;
          }

          .basita-daftari-feature > div:last-child {
            font-size: 10.5px !important;
            line-height: 1.45 !important;
          }

          .basita-daftari-benefit {
            width: 100% !important;
            min-height: 0 !important;
            padding: 20px 16px !important;
            border-radius: 14px !important;
          }

          .basita-daftari-benefit-content > div:first-child {
            width: 44px !important;
            height: 44px !important;
            margin-bottom: 9px !important;
            border-radius: 11px !important;
          }

          .basita-daftari-benefit-content > div:first-child svg {
            width: 21px !important;
            height: 21px !important;
          }

          .basita-daftari-benefit-content p:first-of-type {
            margin-bottom: 5px !important;
            font-size: 18px !important;
          }

          .basita-daftari-benefit-content p:nth-of-type(2) {
            margin-bottom: 12px !important;
            font-size: 12px !important;
            line-height: 1.8 !important;
          }

          .basita-daftari-link {
            font-size: 12px !important;
          }
        }

        /* =========================
           Daftari - Small phones
           ========================= */
        @media (max-width: 420px) {
          .basita-daftari-section {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }

          .basita-daftari-shell {
            padding: 10px !important;
            gap: 10px !important;
            border-radius: 16px !important;
          }

          .basita-daftari-main h2 {
            font-size: 18px !important;
          }

          .basita-daftari-main > p {
            font-size: 12px !important;
          }

          .basita-daftari-features {
            gap: 6px !important;
          }

          .basita-daftari-feature {
            min-height: 76px !important;
            padding: 8px 5px !important;
          }

          .basita-daftari-feature > div:first-child {
            width: 31px !important;
            height: 31px !important;
            margin-bottom: 4px !important;
          }

          .basita-daftari-feature > div:first-child svg {
            width: 16px !important;
            height: 16px !important;
          }

          .basita-daftari-feature > div:last-child {
            font-size: 10px !important;
          }

          .basita-daftari-benefit {
            padding: 18px 13px !important;
          }

          .basita-daftari-benefit-content p:nth-of-type(2) {
            font-size: 11.5px !important;
          }
        }
      `}</style>
    </section>
  );
}