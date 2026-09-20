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
        gridTemplateColumns:
          "repeat(4, minmax(0, 1fr))",
        gap: 2,
        background: t.colors.cream.warm,
        border: `1px solid ${t.colors.cream.border}`,
        borderRadius: t.radius.lg,
        padding: 3,
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
              minHeight: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              padding: "6px 5px",
              borderRadius: t.radius.md,
              background:
                "rgba(255, 255, 255, 0.58)",
              border:
                "1px solid rgba(255, 255, 255, 0.72)",
              textAlign: "center",
              transition:
                "transform 180ms ease, box-shadow 180ms ease, background 180ms ease",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 29,
                height: 29,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.full,
                background: t.colors.white,
                color: t.colors.primary[800],
                boxShadow:
                  "0 2px 6px rgba(75, 56, 34, 0.045)",
              }}
            >
              <Icon
                size={15}
                strokeWidth={1.7}
              />
            </span>

            <span
              style={{
                minWidth: 0,
                color: t.colors.text.body,
                fontSize: 11,
                fontWeight:
                  t.typography.fontWeight.medium,
                lineHeight: 1.4,
                whiteSpace: "nowrap",
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
          box-shadow: 0 4px 11px rgba(75, 56, 34, 0.055);
        }

        @media (max-width: 700px) {
          .basita-cart-trust-bar {
            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;
            gap: 2px !important;
          }

          .basita-cart-trust-item {
            min-height: 54px !important;
          }
        }

        @media (max-width: 400px) {
          .basita-cart-trust-bar {
            gap: 2px !important;
            padding: 2px !important;
          }

          .basita-cart-trust-item {
            min-height: 52px !important;
            gap: 6px !important;
            padding: 5px 3px !important;
          }

          .basita-cart-trust-item > span:first-child {
            width: 27px !important;
            height: 27px !important;
          }

          .basita-cart-trust-item > span:first-child svg {
            width: 14px !important;
            height: 14px !important;
          }

          .basita-cart-trust-item > span:last-child {
            font-size: 10px !important;
          }
        }

        @media (max-width: 340px) {
          .basita-cart-trust-item {
            gap: 4px !important;
          }

          .basita-cart-trust-item > span:first-child {
            width: 25px !important;
            height: 25px !important;
          }

          .basita-cart-trust-item > span:first-child svg {
            width: 13px !important;
            height: 13px !important;
          }

          .basita-cart-trust-item > span:last-child {
            font-size: 9px !important;
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