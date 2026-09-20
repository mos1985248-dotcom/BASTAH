// components/product/ProductTrustBar.tsx
// شارات منصّة ثابتة (دفع آمن عبر Moyasar، دعم سريع...) — قدرات حقيقية
// للمنصّة نفسها وليست بيانات مُلفَّقة لكل منتج على حدة، بنفس مبدأ
// PLATFORM_BADGES بصفحة المتجر.

import { t } from "@/theme";
import {
  Headset,
  PackageCheck,
  RotateCcw,
  Lock,
  type LucideIcon,
} from "lucide-react";

const ITEMS: { Icon: LucideIcon; label: string }[] = [
  { Icon: Headset, label: "دعم سريع" },
  { Icon: PackageCheck, label: "تغليف آمن" },
  { Icon: RotateCcw, label: "إرجاع سهل" },
  { Icon: Lock, label: "دفع آمن" },
];

export default function ProductTrustBar() {
  return (
    <div
      dir="rtl"
      className="basita-product-trust-bar"
      aria-label="مزايا التسوق في بسطة"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 1,
        marginTop: t.spacing["3"],
        padding: "3px",
        background: t.colors.cream.warm,
        border: `1px solid ${t.colors.cream.border}`,
        borderRadius: t.radius.lg,
        overflow: "hidden",
      }}
    >
      {ITEMS.map((it) => (
        <div
          key={it.label}
          className="basita-trust-item"
          style={{
            minWidth: 0,
            minHeight: 60,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "6px 4px",
            borderRadius: t.radius.md,
            color: t.colors.primary[800],
            transition:
              "background-color 160ms ease, transform 160ms ease",
          }}
        >
          <span
            style={{
              width: 27,
              height: 27,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: t.colors.white,
              color: t.colors.primary[800],
              boxShadow:
                "0 2px 6px rgba(25, 45, 35, 0.045)",
            }}
          >
            <it.Icon
              size={14}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </span>

          <span
            style={{
              fontSize: 11,
              color: t.colors.text.body,
              lineHeight: 1.35,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            {it.label}
          </span>
        </div>
      ))}

      <style>{`
        .basita-trust-item:hover {
          background: rgba(255, 255, 255, 0.65);
          transform: translateY(-1px);
        }

        @media (max-width: 560px) {
          .basita-product-trust-bar {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 2px !important;
          }

          .basita-trust-item {
            min-height: 58px !important;
          }
        }

        @media (max-width: 360px) {
          .basita-trust-item {
            min-height: 56px !important;
            padding-inline: 2px !important;
          }

          .basita-trust-item > span:first-child {
            width: 25px !important;
            height: 25px !important;
          }

          .basita-trust-item > span:first-child svg {
            width: 13px !important;
            height: 13px !important;
          }

          .basita-trust-item > span:last-child {
            font-size: 10px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-trust-item {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}