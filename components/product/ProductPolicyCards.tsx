// components/product/ProductPolicyCards.tsx
// امتداد حقيقي لإعدادات المتجر (Dashboard → Backend → Storefront → Product
// Page) — كل قيمة من StorePublicInfo الحقيقي، ولا بطاقة تُعرض بدون بيانات.

import { t } from "@/theme";
import {
  RotateCcw,
  Truck,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { ProductDetail } from "./types";

export default function ProductPolicyCards({
  product,
}: {
  product: ProductDetail;
}) {
  const info = product.store.publicInfo;

  const cards: {
    Icon: LucideIcon;
    title: string;
    body: string | null;
  }[] = [
    {
      Icon: RotateCcw,
      title: "سياسة الإرجاع",
      body: info
        ? `يمكنك إرجاع المنتج خلال ${info.returnPolicyDays} ${
            info.returnPolicyDays === 1 ? "يوم" : "أيام"
          } من الاستلام، بشرط أن يكون بحالته الأصلية.`
        : null,
    },
    {
      Icon: Truck,
      title: "الشحن والتوصيل",
      body: info
        ? `تجهيز خلال ${info.prepTimeDays}${
            info.deliveryPartner ? ` عبر ${info.deliveryPartner}` : ""
          } — يشحن إلى ${info.shippingCoverage}.`
        : null,
    },
    {
      Icon: CreditCard,
      title: "وسائل الدفع",
      body: info?.paymentMethods?.length
        ? info.paymentMethods.join(" · ")
        : null,
    },
  ].filter((c) => c.body);

  if (cards.length === 0) return null;

  return (
    <div
      dir="rtl"
      className="basita-product-policy-cards"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: t.spacing["3"],
        marginTop: t.spacing["5"],
      }}
    >
      {cards.map((c) => (
        <div
          key={c.title}
          className="basita-product-policy-card"
          style={{
            position: "relative",
            overflow: "hidden",
            background: t.colors.white,
            border: `1px solid ${t.colors.cream.border}`,
            borderRadius: t.radius.lg,
            padding: t.spacing["4"],
            minHeight: 126,
            boxShadow: "0 4px 15px rgba(25, 45, 35, 0.035)",
            transition:
              "transform 170ms ease, box-shadow 170ms ease, border-color 170ms ease",
          }}
        >
          {/* لمسة لونية بسيطة أعلى البطاقة */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              insetInlineStart: 0,
              width: 42,
              height: 3,
              borderRadius: "0 0 4px 0",
              background: t.colors.gold[600],
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: t.spacing["2"],
              marginBottom: t.spacing["2"],
            }}
          >
            <span
              style={{
                width: 34,
                height: 34,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: t.radius.md,
                background: t.colors.primary[100],
                color: t.colors.primary[800],
              }}
            >
              <c.Icon size={16} strokeWidth={1.8} />
            </span>

            <p
              style={{
                margin: 0,
                paddingTop: 5,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.primary[800],
                lineHeight: 1.4,
              }}
            >
              {c.title}
            </p>
          </div>

          <p
            style={{
              margin: 0,
              paddingInlineStart: 42,
              fontSize: t.typography.fontSize.xs,
              color: t.colors.text.mid,
              lineHeight: 1.8,
            }}
          >
            {c.body}
          </p>
        </div>
      ))}

      <style>{`
        .basita-product-policy-card:hover {
          transform: translateY(-2px);
          border-color: rgba(15, 61, 46, 0.14);
          box-shadow: 0 9px 24px rgba(25, 45, 35, 0.07);
        }

        @media (max-width: 700px) {
          .basita-product-policy-cards {
            grid-template-columns: 1fr !important;
            gap: ${t.spacing["2"]} !important;
          }

          .basita-product-policy-card {
            min-height: auto !important;
          }
        }

        @media (max-width: 420px) {
          .basita-product-policy-card {
            padding: ${t.spacing["3"]} !important;
          }

          .basita-product-policy-card p:last-child {
            padding-inline-start: 0 !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-product-policy-card {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}