// components/product/ProductMuniraCTA.tsx
// منيرة هنا للمشتري/الزائر — نفس سياق buyer/guest المستخدم بصفحة المتجر،
// وليست منيرة التاجر بلوحة التاجر.

import MuniraMiniPanel from "@/components/munira/MuniraMiniPanel";
import { ProductDetail } from "./types";

export default function ProductMuniraCTA({
  product,
}: {
  product: ProductDetail;
}) {
  const suggestions = [
    `اشرحي لي ${product.nameAr}`,
    ...(product.variants.length > 0
      ? ["ساعديني أختار الحجم المناسب"]
      : []),
    "هل يناسب هذا المنتج كهدية؟",
    "اقترحي منتجات مشابهة",
  ];

  return (
    <div
      dir="rtl"
      className="basita-product-munira"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        border: "1px solid rgba(15, 61, 46, 0.10)",
        background: `
          radial-gradient(
            circle at 100% 0%,
            rgba(198, 164, 82, 0.14),
            transparent 38%
          ),
          radial-gradient(
            circle at 0% 100%,
            rgba(15, 61, 46, 0.07),
            transparent 42%
          ),
          ${"rgba(248, 246, 238, 0.78)"}
        `,
        boxShadow: "0 8px 26px rgba(25, 45, 35, 0.05)",
      }}
    >
      {/* لمسة زخرفية خفيفة من هوية بسطة */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 110,
          height: 110,
          borderRadius: "50%",
          top: -65,
          insetInlineStart: -35,
          border: "1px solid rgba(198, 164, 82, 0.13)",
          pointerEvents: "none",
        }}
      />

      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 70,
          height: 70,
          borderRadius: "50%",
          bottom: -42,
          insetInlineEnd: 24,
          background: "rgba(15, 61, 46, 0.035)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <MuniraMiniPanel
          title="اسأل منيرة عن هذا المنتج"
          subtitle="اشرح، قارن، أو استفسر عن أي تفصيل قبل الشراء"
          suggestions={suggestions}
        />
      </div>

      <style>{`
        .basita-product-munira {
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease;
        }

        .basita-product-munira:hover {
          transform: translateY(-1px);
          border-color: rgba(15, 61, 46, 0.14);
          box-shadow: 0 12px 30px rgba(25, 45, 35, 0.07);
        }

        @media (max-width: 700px) {
          .basita-product-munira {
            border-radius: 16px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .basita-product-munira {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}