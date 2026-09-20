// components/home/MuniraShowcase.tsx
import Image from "next/image";
import {
  BarChart3,
  ImageIcon,
  MessageCircle,
  PenLine,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { t } from "@/theme";

const CAPABILITIES: { Icon: LucideIcon; label: string }[] = [
  { Icon: BarChart3, label: "تحليل الأداء والمبيعات" },
  { Icon: ImageIcon, label: "تصميم صور احترافية" },
  { Icon: MessageCircle, label: "الرد على العملاء بذكاء" },
  { Icon: PenLine, label: "كتابة وصف المنتجات" },
  { Icon: Tag, label: "كتابة أسماء المنتجات" },
];

export default function MuniraShowcase() {
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
        className="basita-munira-container"
        style={{
          position: "relative",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1.6fr auto",
          alignItems: "center",
          gap: t.spacing["6"],
          padding: t.spacing["6"],
          borderRadius: 24,
          background: "#F7F1E5",
          border: "1px solid rgba(91, 70, 45, 0.12)",
          boxShadow: "0 6px 20px rgba(67, 48, 29, 0.045)",
        }}
      >
        {/* لمسة زخرفية خفيفة */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -70,
            right: -60,
            width: 180,
            height: 180,
            borderRadius: "50%",
            border: "1px solid rgba(166,124,45,0.12)",
          }}
        />

        {/* تعريف منيرة */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: t.spacing["4"],
            minWidth: 0,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 86,
              height: 86,
              flexShrink: 0,
            }}
          >
            <Image
              src="/images/munira-avatar.png"
              alt="منيرة"
              width={86}
              height={86}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 22,
                border: "3px solid #FFFDF8",
                boxShadow: "0 6px 16px rgba(67,48,29,0.12)",
              }}
            />

            <span
              style={{
                position: "absolute",
                left: -5,
                bottom: -5,
                padding: "4px 8px",
                borderRadius: 999,
                background: t.colors.gold[600],
                color: t.colors.white,
                fontSize: 10,
                fontWeight: t.typography.fontWeight.bold,
                border: "2px solid #F7F1E5",
              }}
            >
              AI
            </span>
          </div>

          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                margin: `0 0 ${t.spacing["1"]}`,
                fontSize: t.typography.fontSize.xl,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.primary[800],
              }}
            >
              منيرة
            </h2>

            <p
              style={{
                margin: 0,
                fontSize: t.typography.fontSize.sm,
                color: t.colors.text.mid,
                lineHeight: t.typography.lineHeight.relaxed,
              }}
            >
              مساعدتك الذكية لإدارة متجرك وزيادة مبيعاتك
            </p>
          </div>
        </div>

        {/* قدرات منيرة */}
        <div
          className="basita-munira-capabilities"
          style={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 10,
            minWidth: 0,
          }}
        >
          {CAPABILITIES.map((c) => (
            <div
              key={c.label}
              className="basita-munira-feature"
              style={{
                minHeight: 108,
                padding: "12px 8px",
                borderRadius: 16,
                background: "#FFFDF8",
                border: "1px solid rgba(91,70,45,0.10)",
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
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: t.colors.gold[100],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <c.Icon
                  size={20}
                  strokeWidth={1.7}
                  color={t.colors.gold[700]}
                />
              </div>

              <span
                style={{
                  fontSize: 11,
                  color: t.colors.text.body,
                  fontWeight: t.typography.fontWeight.semibold,
                  lineHeight: 1.5,
                }}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>

        {/* زر منيرة */}
        <a
          href="/dashboard/munira"
          className="basita-munira-button basita-btn-interactive"
          style={{
            position: "relative",
            zIndex: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 48,
            padding: `0 ${t.spacing["5"]}`,
            background: t.colors.primary[800],
            color: t.colors.white,
            borderRadius: t.radius.full,
            fontWeight: t.typography.fontWeight.bold,
            fontSize: t.typography.fontSize.sm,
            textDecoration: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 5px 14px rgba(33,53,42,0.14)",
          }}
        >
          اسأل منيرة
        </a>
      </div>

      <style>{`
        .basita-munira-feature:hover {
          transform: translateY(-4px);
          border-color: rgba(166, 124, 45, 0.24) !important;
          box-shadow: 0 10px 22px rgba(67, 48, 29, 0.07);
        }

        .basita-munira-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(33,53,42,0.18);
        }

        @media (max-width: 1100px) {
          .basita-munira-container {
            grid-template-columns: 1fr !important;
          }

          .basita-munira-capabilities {
            grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
          }

          .basita-munira-button {
            justify-self: center;
          }
        }

        @media (max-width: 720px) {
          .basita-munira-container {
            padding: 18px !important;
            border-radius: 20px !important;
          }

          .basita-munira-capabilities {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </section>
  );
}