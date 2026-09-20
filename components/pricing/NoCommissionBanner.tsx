
// components/pricing/NoCommissionBanner.tsx

import {
  HandCoins,
  Truck,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { t } from "@/theme";

const POINTS: {
  Icon: LucideIcon;
  title: string;
  desc: string;
}[] = [
  {
    Icon: HandCoins,
    title: "بدون عمولة إطلاقًا",
    desc: "كل ريال تبيعينه لك بالكامل — مهما زادت مبيعاتك",
  },
  {
    Icon: Truck,
    title: "3 ريال شحن فقط",
    desc: "رسوم شحن ثابتة وواضحة، بدون تكاليف خفية",
  },
  {
    Icon: RotateCcw,
    title: "رقّي أو خفّضي باقتك وقتما شئتِ",
    desc: "بدون التزام سنوي — غيّري باقتك من لوحة التحكم بأي وقت",
  },
];

export default function NoCommissionBanner() {
  return (
    <section
      aria-label="مزايا الاشتراك في بسطة"
      style={{
        width: "100%",
        padding: `0 ${t.spacing["4"]} ${t.spacing["10"]}`,
        direction: "rtl",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1180,
          margin: "0 auto",
          background: t.colors.primary[900],
          borderRadius: t.radius.xl,
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 14px 35px rgba(15,61,46,0.12)",
          padding: `${t.spacing["4"]} ${t.spacing["5"]}`,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: t.spacing["4"],
            alignItems: "stretch",
          }}
        >
          {POINTS.map((point) => {
            const Icon = point.Icon;

            return (
              <div
                key={point.title}
                style={{
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: t.spacing["3"],
                  padding: t.spacing["3"],
                  borderRadius: t.radius.lg,
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxSizing: "border-box",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: 44,
                    height: 44,
                    borderRadius: t.radius.full,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(201,151,58,0.10)",
                    border: "1px solid rgba(201,151,58,0.22)",
                  }}
                >
                  <Icon
                    size={21}
                    strokeWidth={1.8}
                    color={t.colors.gold[400]}
                  />
                </div>

                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 4px",
                      color: t.colors.gold[400],
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.bold,
                      lineHeight: 1.45,
                    }}
                  >
                    {point.title}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: t.colors.text.onDarkMuted,
                      fontSize: t.typography.fontSize.xs,
                      lineHeight: 1.7,
                    }}
                  >
                    {point.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          section > div {
            max-width: 700px;
          }

          section > div > div {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          section {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          section > div {
            padding: 12px;
            border-radius: 18px;
          }

          section > div > div {
            gap: 10px;
          }

          section > div > div > div {
            padding: 12px;
          }
        }
      `}</style>
    </section>
  );
}
