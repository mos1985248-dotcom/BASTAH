// components/cart/CartTrustBar.tsx

import { t } from "@/theme";
import {
  Lock,
  Truck,
  RotateCcw,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";

const ITEMS: { Icon: LucideIcon; label: string }[] = [
  { Icon: Lock, label: "دفع آمن" },
  { Icon: Truck, label: "شحن سريع" },
  { Icon: RotateCcw, label: "إرجاع سهل" },
  { Icon: BadgeCheck, label: "منتجات موثوقة" },
];

export default function CartTrustBar() {
  return (
    <div
      dir="rtl"
      aria-label="مزايا التسوق"
      className="basita-cart-trust-bar"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: t.spacing["2"],
        background: t.colors.cream.warm,
        border: `1px solid ${t.colors.cream.border}`,
        borderRadius: t.radius.lg,
        padding: t.spacing["2"],
      }}
    >
      {ITEMS.map((it) => {
        const Icon = it.Icon;

        return (
          <div
            key={it.label}
            className="basita-cart-trust-item"
            style={{
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              padding: `${t.spacing["3"]} ${t.spacing["2"]}`,
              borderRadius: t.radius.md,
              background: "rgba(255, 255, 255, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.7)",
              textAlign: "center",
              transition:
                "transform 180ms ease, box-shadow 180ms ease, background 180ms ease",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 34,
                height: 34,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.full,
                background: t.colors.white,
                color: t.colors.primary[800],
                boxShadow: "0 2px 8px rgba(75, 56, 34, 0.06)",
              }}
            >
              <Icon
                size={18}
                strokeWidth={1.65}
              />
            </span>

            <span
              style={{
                minWidth: 0,
                color: t.colors.text.body,
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.medium,
                lineHeight: 1.5,
              }}
            >
              {it.label}
            </span>
          </div>
        );
      })}

      <style>{`
        .basita-cart-trust-item:hover {
          transform: translateY(-1px);
          background: ${t.colors.white};
          box-shadow: 0 4px 12px rgba(75, 56, 34, 0.06);
        }

        @media (max-width: 700px) {
          .basita-cart-trust-bar {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 400px) {
          .basita-cart-trust-bar {
            gap: ${t.spacing["1"]} !important;
            padding: ${t.spacing["1"]} !important;
          }

          .basita-cart-trust-item {
            gap: 7px !important;
            padding: ${t.spacing["2"]} ${t.spacing["1"]} !important;
          }

          .basita-cart-trust-item > span:first-child {
            width: 30px !important;
            height: 30px !important;
          }

          .basita-cart-trust-item > span:first-child svg {
            width: 16px !important;
            height: 16px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-cart-trust-item {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}