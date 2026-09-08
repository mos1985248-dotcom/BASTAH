// components/product/ProductMuniraCTA.tsx
// منيرة هنا للمشتري/الزائر — نفس سياق buyer/guest المستخدم بصفحة المتجر،
// وليست منيرة التاجر بلوحة التاجر.
import MuniraMiniPanel from "@/components/munira/MuniraMiniPanel";
import { ProductDetail } from "./types";

export default function ProductMuniraCTA({ product }: { product: ProductDetail }) {
  const suggestions = [
    `اشرحي لي ${product.nameAr}`,
    ...(product.variants.length > 0 ? ["ساعديني أختار الحجم المناسب"] : []),
    "هل يناسب هذا المنتج كهدية؟",
    "اقترحي منتجات مشابهة",
  ];

  return (
    <MuniraMiniPanel
      title="اسأل منيرة عن هذا المنتج"
      subtitle="اشرح، قارن، أو استفسر عن أي تفصيل قبل الشراء"
      suggestions={suggestions}
    />
  );
}
