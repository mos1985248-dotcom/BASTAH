// components/pricing/PricingFAQ.tsx
import { ChevronDown, HelpCircle } from "lucide-react";
import { t } from "@/theme";

const FAQS = [
  {
    q: "ليش بسطة ما تاخذ عمولة على مبيعاتي؟",
    a: "نؤمن أن إيرادك من تعبك يرجع لك بالكامل — لهذا موديل بسطة اشتراك شهري ثابت فقط، بدون أي نسبة من مبيعاتك.",
  },
  {
    q: "هل أقدر أغيّر باقتي بأي وقت؟",
    a: "نعم، تقدرين ترقّي أو تنزّلي باقتك من لوحة تحكم متجرك مباشرة، وتُطبَّق التغييرات على دورة الفوترة القادمة.",
  },
  {
    q: "شنو رسوم الشحن؟",
    a: "رسوم شحن ثابتة 3 ريال على كل طلب، توزّع حسب اتفاقك مع شركة الشحن — بدون أي رسوم إضافية من بسطة.",
  },
  {
    q: "متى أقدر أستخدم منيرة، المساعدة الذكية؟",
    a: "منيرة متاحة تلقائياً لباقتي نماء وبرو، وتساعدك في الرد على استفسارات العملاء وإدارة متجرك بذكاء.",
  },
];

export default function PricingFAQ() {
  return (
    <section
      id="faq"
      dir="rtl"
      className="basita-pricing-faq"
      style={{
        width: "100%",
        maxWidth: 980,
        margin: `${t.spacing["10"]} auto 0`,
        padding: t.spacing["3"],
        boxSizing: "border-box",
        textAlign: "right",
      }}
    >
      {/* الحاوية الوسطية */}
      <div
        className="basita-faq-container"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: `${t.spacing["10"]} ${t.spacing["8"]}`,
          borderRadius: t.radius.xl,
          background: t.colors.cream.bg,
          border: `1px solid ${t.colors.cream.border}`,
          boxShadow: t.shadows.xs,
        }}
      >
        {/* رأس القسم */}
        <div
          style={{
            textAlign: "center",
            marginBottom: t.spacing["6"],
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: 46,
              height: 46,
              margin: `0 auto ${t.spacing["3"]}`,
              borderRadius: t.radius.full,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(217,179,108,0.13)",
              border: "1px solid rgba(217,179,108,0.24)",
              color: t.colors.gold[600],
            }}
          >
            <HelpCircle
              size={22}
              strokeWidth={1.8}
            />
          </div>

          <h2
            style={{
              margin: `0 0 ${t.spacing["2"]}`,
              fontSize: "clamp(24px, 3vw, 30px)",
              fontWeight: t.typography.fontWeight.bold,
              color: t.colors.text.dark,
              lineHeight: 1.35,
            }}
          >
            أسئلة شائعة
          </h2>

          <p
            style={{
              margin: 0,
              color: t.colors.text.mid,
              fontSize: t.typography.fontSize.sm,
              fontWeight:
                t.typography.fontWeight.medium,
              lineHeight: 1.8,
            }}
          >
            كل ما تحتاجين معرفته عن باقات بسطة
          </p>
        </div>

        {/* الأسئلة */}
        <div
          className="basita-faq-list"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: t.spacing["3"],
          }}
        >
          {FAQS.map((f, index) => (
            <div
              key={f.q}
              className="basita-faq-item"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "flex-start",
                gap: t.spacing["4"],
                background: t.colors.white,
                border: `1px solid ${t.colors.cream.border}`,
                borderRadius: t.radius.lg,
                padding: `${t.spacing["4"]} ${t.spacing["5"]}`,
                boxShadow: t.shadows.xs,
                overflow: "hidden",
              }}
            >
              {/* الرقم */}
              <span
                aria-hidden="true"
                className="basita-faq-number"
                style={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: t.radius.full,
                  background:
                    index === 0
                      ? "rgba(217,179,108,0.14)"
                      : t.colors.cream.bg,
                  color:
                    index === 0
                      ? t.colors.gold[600]
                      : t.colors.primary[700],
                  fontSize: t.typography.fontSize.xs,
                  fontWeight:
                    t.typography.fontWeight.bold,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* النص */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <p
                  style={{
                    margin: `0 0 ${t.spacing["2"]}`,
                    color: t.colors.primary[800],
                    fontSize: t.typography.fontSize.base,
                    fontWeight:
                      t.typography.fontWeight.bold,
                    lineHeight: 1.55,
                  }}
                >
                  {f.q}
                </p>

                <p
                  style={{
                    margin: 0,
                    color: t.colors.text.mid,
                    fontSize: t.typography.fontSize.sm,
                    lineHeight:
                      t.typography.lineHeight.relaxed,
                    fontWeight:
                      t.typography.fontWeight.medium,
                  }}
                >
                  {f.a}
                </p>
              </div>

              {/* المؤشر */}
              <span
                aria-hidden="true"
                className="basita-faq-chevron"
                style={{
                  width: 30,
                  height: 30,
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: t.radius.full,
                  background: t.colors.cream.bg,
                  color: t.colors.text.light,
                }}
              >
                <ChevronDown
                  size={17}
                  strokeWidth={1.8}
                />
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .basita-faq-container {
          position: relative;
          overflow: hidden;
        }

        .basita-faq-container::before {
          content: "";
          position: absolute;
          width: 260px;
          height: 260px;
          top: -150px;
          left: -100px;
          border-radius: 50%;
          background: rgba(217, 179, 108, 0.07);
          pointer-events: none;
        }

        .basita-faq-container::after {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          bottom: -150px;
          right: -90px;
          border-radius: 50%;
          background: rgba(91, 70, 45, 0.035);
          pointer-events: none;
        }

        .basita-faq-item {
          transition:
            transform ${t.motion.fast} ${t.motion.ease},
            border-color ${t.motion.fast} ${t.motion.ease},
            box-shadow ${t.motion.fast} ${t.motion.ease};
        }

        .basita-faq-item:hover {
          transform: translateY(-2px);
          border-color: rgba(217, 179, 108, 0.4);
          box-shadow: ${t.shadows.sm};
        }

        .basita-faq-chevron {
          transition:
            color ${t.motion.fast} ${t.motion.ease},
            background ${t.motion.fast} ${t.motion.ease};
        }

        .basita-faq-item:hover .basita-faq-chevron {
          color: ${t.colors.gold[600]};
          background: rgba(217, 179, 108, 0.12);
        }

        @media (max-width: 700px) {
          .basita-pricing-faq {
            padding-left: ${t.spacing["3"]} !important;
            padding-right: ${t.spacing["3"]} !important;
          }

          .basita-faq-container {
            padding: ${t.spacing["6"]} ${t.spacing["4"]} !important;
            border-radius: ${t.radius.lg} !important;
          }
        }

        @media (max-width: 600px) {
          .basita-faq-item {
            gap: ${t.spacing["3"]};
            padding: ${t.spacing["4"]} !important;
          }

          .basita-faq-number {
            width: 28px !important;
            height: 28px !important;
          }

          .basita-faq-chevron {
            width: 26px !important;
            height: 26px !important;
          }

          .basita-faq-item:hover {
            transform: none;
          }
        }

        @media (max-width: 420px) {
          .basita-faq-container {
            padding: ${t.spacing["6"]} ${t.spacing["3"]} !important;
          }

          .basita-faq-item {
            gap: ${t.spacing["2"]};
            padding: ${t.spacing["3"]} !important;
          }

          .basita-faq-item > div p:first-child {
            font-size: ${t.typography.fontSize.sm} !important;
          }

          .basita-faq-item > div p:last-child {
            font-size: ${t.typography.fontSize.xs} !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-faq-item,
          .basita-faq-chevron {
            transition: none !important;
          }

          .basita-faq-item:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}

