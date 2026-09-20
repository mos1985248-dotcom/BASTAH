// components/home/WhyBasita.tsx
import { t } from "@/theme";
import {
  Megaphone,
  HandHeart,
  Wrench,
  BadgeCheck,
  Headset,
} from "lucide-react";

const FEATURES = [
  {
    Icon: Megaphone,
    title: "تسويق ودعم",
    desc: "لمتجرك ومنتجاتك",
  },
  {
    Icon: HandHeart,
    title: "بدون عمولات",
    desc: "على جميع الباقات",
  },
  {
    Icon: Wrench,
    title: "أدوات متكاملة",
    desc: "لإدارة متجرك بسهولة",
  },
  {
    Icon: BadgeCheck,
    title: "منتجات أصلية",
    desc: "من مصادر موثوقة",
  },
  {
    Icon: Headset,
    title: "دعم فني سريع",
    desc: "فريق يرافقك خطوة بخطوة",
  },
];

export default function WhyBasita() {
  return (
    <section
      className="basita-why-section"
      style={{
        maxWidth: t.layout.containerMaxWidth,
        margin: "0 auto",
        padding: `${t.spacing["12"]} ${t.spacing["4"]} ${t.spacing["10"]}`,
        direction: "rtl",
        boxSizing: "border-box",
      }}
    >
      {/* عنوان القسم */}
      <div
        className="basita-why-header"
        style={{
          textAlign: "center",
          marginBottom: t.spacing["8"],
        }}
      >
        <h2
          style={{
            fontFamily: t.typography.fontFamily.heading,
            margin: `0 0 ${t.spacing["2"]}`,
            fontSize: t.typography.fontSize["2xl"],
            fontWeight: t.typography.fontWeight.bold,
            color: t.colors.text.dark,
            lineHeight: t.typography.lineHeight.tight,
          }}
        >
          ليش بسطة؟
        </h2>

        <p
          style={{
            margin: 0,
            maxWidth: 640,
            marginInline: "auto",
            fontSize: t.typography.fontSize.sm,
            lineHeight: t.typography.lineHeight.relaxed,
            color: t.colors.text.mid,
          }}
        >
          كل ما تحتاجه الأسرة المنتجة لتبيع، تنمو، وتوصل منتجاتها لعملاء أكثر.
        </p>
      </div>

      {/* المزايا */}
      <div
        className="basita-why-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: t.spacing["4"],
          alignItems: "stretch",
        }}
      >
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="basita-why-card"
            style={{
              minHeight: 178,
              padding: `${t.spacing["6"]} ${t.spacing["4"]}`,
              borderRadius: t.radius.lg,
              background: t.colors.cream.card,
              border: `1px solid ${t.colors.cream.borderLight}`,
              boxShadow: t.shadows.xs,
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
              className="basita-why-icon"
              style={{
                width: 50,
                height: 50,
                marginBottom: t.spacing["3"],
                borderRadius: t.radius.md,
                background: t.colors.gold[50],
                border: `1px solid ${t.colors.gold[200]}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition:
                  `background ${t.motion.base} ${t.motion.ease}, ` +
                  `transform ${t.motion.base} ${t.motion.ease}`,
              }}
            >
              <f.Icon
                size={23}
                strokeWidth={1.8}
                color={t.colors.gold[700]}
                aria-hidden="true"
              />
            </div>

            <p
              style={{
                margin: `0 0 ${t.spacing["1"]}`,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.text.dark,
                lineHeight: t.typography.lineHeight.snug,
              }}
            >
              {f.title}
            </p>

            <p
              style={{
                margin: 0,
                fontSize: t.typography.fontSize.xs,
                color: t.colors.text.mid,
                lineHeight: t.typography.lineHeight.relaxed,
              }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        .basita-why-card:hover {
          transform: translateY(-3px);
          border-color: ${t.colors.gold[200]} !important;
          box-shadow: ${t.shadows.sm} !important;
        }

        .basita-why-card:hover .basita-why-icon {
          background: ${t.colors.gold[100]} !important;
          transform: translateY(-1px);
        }

        @media (max-width: 1050px) {
          .basita-why-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 760px) {
          .basita-why-section {
            padding-top: ${t.spacing["10"]} !important;
            padding-bottom: ${t.spacing["8"]} !important;
          }

          .basita-why-header {
            margin-bottom: ${t.spacing["6"]} !important;
          }

          .basita-why-header h2 {
            font-size: ${t.typography.fontSize.xl} !important;
          }

          .basita-why-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: ${t.spacing["3"]} !important;
          }

          .basita-why-card {
            min-height: 165px !important;
            padding: ${t.spacing["5"]} ${t.spacing["3"]} !important;
          }
        }

        @media (max-width: 480px) {
          .basita-why-grid {
            grid-template-columns: 1fr !important;
          }

          .basita-why-card {
            min-height: 145px !important;
          }
        }
      `}</style>
    </section>
  );
}